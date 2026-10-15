#!/usr/bin/env node
/**
 * Prove the package is loadable by a real Node consumer before it is published.
 *
 * 0.9.1 shipped unloadable from Node — `require` and `import` both failed — and
 * every gate in this repository passed:
 *
 *   - `lint` only typechecks
 *   - the tests run from `src/` under Vitest **browser** mode, where Vite
 *     pre-bundles dependencies with esbuild and tolerates malformed ones
 *   - `build` and `bundle` compile; nothing executes the result
 *   - `verify:exports` is static, and was written that way *because* loading
 *     `dist/` failed. The symptom was routed around instead of being recognised
 *     as a finding
 *
 * The cause was a dependency: bmx-pastebox ≤ 1.0.17 shipped ESM syntax in `.js`
 * files with no `"type": "module"` and extensionless imports. This package
 * does not bundle its dependencies (`skipNodeModulesBundle: true`), so it
 * inherited the fault. Fixed in bmx-pastebox 1.1.0.
 *
 * So this check does what a consumer does, not what the repo does: pack the
 * tarball, install it into a throwaway project — which pulls the real
 * dependency tree from the registry — and load it **by package name** in both
 * module systems. That exercises `files`, `main`/`module`, and every runtime
 * dependency together. Loading `./dist` by path would test none of those.
 *
 * Needs network access, for the dependency install.
 */
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const NAME = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).name;

// The runtime surface. `verify:exports` already proves these match the
// declarations; this proves they survive packing, installing and loading.
const EXPECTED = [
	'EmailEngineTypeEnum', 'init', 'pageViewObserver',
	'resolveDataEvent', 'resolveSimpleEvent', 'sendEmail'
];

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'bloomsight-verify-'));
let failed = false;

function run(cmd, args, cwd) {
	return execFileSync(cmd, args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
}

try {
	// 1. Pack exactly what `npm publish` would upload. --ignore-scripts because
	//    `prepare` runs husky, and build + bundle have already run.
	// Slice from the first `[`: npm can print other output ahead of the JSON,
	// which is what once corrupted this repo's CI packaging check.
	const packOut = run(npm, ['pack', '--json', '--ignore-scripts', '--pack-destination', work], ROOT);
	const packed = JSON.parse(packOut.slice(packOut.indexOf('[')));
	const tarball = path.join(work, packed[0].filename);
	console.log(`verify-package: packed ${packed[0].filename} (${packed[0].entryCount} files)`);

	// 2. Install it into an empty consumer project, pulling real dependencies.
	const consumer = path.join(work, 'consumer');
	fs.mkdirSync(consumer);
	fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({name: 'consumer', private: true}));
	run(npm, ['install', tarball, '--no-audit', '--no-fund', '--ignore-scripts', '--prefer-online'], consumer);
	console.log('verify-package: installed into a clean consumer project');

	// 3. Load it as a consumer would, in both module systems.
	const probes = [
		['CommonJS require()', ['-e', `console.log(JSON.stringify(Object.keys(require(${JSON.stringify(NAME)}))))`]],
		['ESM import', ['--input-type=module', '-e', `import * as m from ${JSON.stringify(NAME)}; console.log(JSON.stringify(Object.keys(m)))`]]
	];

	for (const [label, args] of probes) {
		try {
			const names = JSON.parse(run(process.execPath, args, consumer).trim());
			const absent = EXPECTED.filter((n) => !names.includes(n));
			if (absent.length) {
				failed = true;
				console.error(`verify-package: ${label} loaded, but is missing: ${absent.join(', ')}`);
			} else {
				console.log(`verify-package: ${label} loads and exports all ${EXPECTED.length} values`);
			}
		} catch (error) {
			failed = true;
			const detail = String(error.stderr || error.message).split('\n').filter(Boolean).slice(0, 3).join('\n    ');
			console.error(`verify-package: ${label} FAILED to load the installed package:\n    ${detail}`);
		}
	}
} catch (error) {
	failed = true;
	console.error(`verify-package: could not pack or install — ${String(error.stderr || error.message).split('\n')[0]}`);
} finally {
	fs.rmSync(work, {recursive: true, force: true});
}

if (failed) {
	console.error('verify-package: FAILED — a Node consumer could not use this build. Do not publish it.');
	process.exit(1);
}
console.log('verify-package: a Node consumer can install and load this package');
