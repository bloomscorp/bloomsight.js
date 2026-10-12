#!/usr/bin/env node
/**
 * Assert that every **value** the public declaration promises actually exists
 * as a runtime export in the built bundles.
 *
 * This exists because of a real bug shipped in 0.8.0 and earlier.
 * `EmailEngineTypeEnum` was referenced only in `sendEmail`'s type signature and
 * nowhere as a value reachable from `src/index.ts`, so tsup's
 * `treeshake: 'smallest'` dropped its runtime code while `dts: true` still
 * emitted `email/enums/emailEngineTypeEnum.d.ts`. The package therefore shipped
 * a declaration for a value it did not contain: nothing could import the enum,
 * from the root (not exported) or by path (no `.js` file).
 *
 * The library's own routing was never affected — the minifier inlined the member
 * comparison to a string literal — so nothing inside the repo ever failed. Only
 * consumers did, which is why it went unnoticed.
 *
 * A unit test cannot catch this: in `src/` the enum is perfectly real. The bug
 * exists only in the built artifact, so the check has to read the artifact.
 *
 * It then caught something larger on its first CI run. `webpack.config.ts` gave
 * `ts-loader` `compilerOptions: { noEmit: false }` so it would emit JS for
 * webpack — but `tsconfig.json` also sets `declaration: true` and
 * `outDir: "dist"`, so every `npm run bundle` wrote a `.d.ts` for **every**
 * source file into `dist/`. Webpack's own output goes to `umd/`, so it was
 * invisible, and with no `files` field in `package.json` all 49 were published.
 * Every release up to 0.9.0 shipped them. Fixed by adding `declaration: false`
 * to that loader's options; the tarball went from 60 files to 12.
 *
 * Deliberately generic. It does not look for that enum; it compares the
 * declaration's value exports against each bundle's export table, so any future
 * export tree-shaken out from under its own type is caught too.
 *
 * Static rather than a runtime `import()`: a dependency ships malformed ESM
 * (`bmx-pastebox` imports an extensionless path), so loading the bundle in Node
 * fails for reasons unrelated to what is being checked here.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// Defaults to this repo's build; takes a path so it can be aimed at an
// extracted tarball, which is how check 1 below was verified against the
// actually-published 0.8.0.
const DIST = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'dist');
const DTS = path.join(DIST, 'index.d.ts');
const BUNDLES = [
	path.join(DIST, 'index.mjs'),
	path.join(DIST, 'index.js')
];

function read(file) {
	if (!fs.existsSync(file)) {
		console.error(
			`verify-runtime-exports: ${path.relative(ROOT, file)} is missing — `
			+ 'run "npm run build" first'
		);
		process.exit(1);
	}
	return fs.readFileSync(file, 'utf8');
}

/**
 * Comments must go before anything is parsed.
 *
 * A doc comment sitting *inside* an `export { ... }` specifier list is carried
 * straight into the generated `.d.ts`, and this script originally read those
 * comment lines as export names — reporting imaginary missing exports like
 * "a **value**" and failing a release for the wrong reason. The comment was
 * moved out of the braces, but the parser should not have been fragile enough
 * to care.
 */
function stripComments(code) {
	return code
		.replace(/\/\*[\s\S]*?\*\//g, ' ')
		.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function lastName(entry) {
	const parts = entry.split(/\s+as\s+/);
	return (parts[parts.length - 1] || entry).trim();
}

/** The value (non-`type`) names in the declaration's export statements. */
function declaredValueExports(rawDts) {
	const dts = stripComments(rawDts);
	const statements = [...dts.matchAll(/export\s*\{([^}]*)\}/g)];
	if (!statements.length) {
		console.error('verify-runtime-exports: no export statement found in dist/index.d.ts');
		process.exit(1);
	}
	const names = new Set();
	for (const [, body] of statements) {
		for (const raw of body.split(',')) {
			const entry = raw.trim();
			// `type X` entries are type-only; no runtime presence is expected.
			if (!entry || entry.startsWith('type ')) continue;
			const name = lastName(entry);
			// Guard against a parse that has gone off the rails: only real
			// identifiers are exportable, so anything else means this script is
			// misreading the file and must say so rather than invent findings.
			if (!/^[A-Za-z_$][\w$]*$/.test(name)) {
				console.error(
					`verify-runtime-exports: could not parse the export list in `
					+ `${path.relative(ROOT, DTS)} — got ${JSON.stringify(name)}, `
					+ 'which is not an identifier. This is a bug in this script, not '
					+ 'a packaging problem; fix the parser rather than the package.'
				);
				process.exit(1);
			}
			names.add(name);
		}
	}
	return [...names];
}

/**
 * The names a bundle actually exports.
 *   ESM — `export{a as init,b as sendEmail}`
 *   CJS — tsup's export table, `Name: () => local`, plus minified `Name=local`
 */
function bundleExports(rawCode) {
	const code = stripComments(rawCode);
	const names = new Set();
	for (const [, body] of code.matchAll(/export\s*\{([^}]*)\}/g)) {
		for (const raw of body.split(',')) {
			const entry = raw.trim();
			if (entry) names.add(lastName(entry));
		}
	}
	for (const [, name] of code.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*\(\)\s*=>/g)) names.add(name);
	for (const [, name] of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*(?=[,;}])/g)) names.add(name);
	return names;
}

/**
 * Check 1 — orphan declarations.
 *
 * **This is the check that caught the bundle-step leak.** tsup emitted
 * `email/enums/emailEngineTypeEnum.d.ts` with no `emailEngineTypeEnum.js`
 * beside it, so the package shipped a declaration for a module that did not
 * exist. Any `.d.ts` without a sibling `.js` is a promise the package cannot
 * keep, and `index.d.ts` is the only legitimate exception — it describes the
 * bundle, whose code lives in `index.js` / `index.mjs`.
 */
function orphanDeclarations(dir) {
	const orphans = [];
	const walk = (current) => {
		for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) {
				walk(full);
				continue;
			}
			if (!entry.name.endsWith('.d.ts') && !entry.name.endsWith('.d.mts')) continue;
			const base = full.replace(/\.d\.m?ts$/, '');
			if (path.relative(dir, base) === 'index') continue;          // the bundle's own types
			if (fs.existsSync(`${base}.js`) || fs.existsSync(`${base}.mjs`)) continue;
			orphans.push(path.relative(dir, full));
		}
	};
	walk(dir);
	return orphans;
}

let failed = false;

const orphans = orphanDeclarations(DIST);
if (orphans.length) {
	failed = true;
	console.error(
		`verify-runtime-exports: ${orphans.length} declaration file(s) ship with no `
		+ `JavaScript beside them:\n${orphans.map((o) => `    ${o}`).join('\n')}\n`
		+ '  Each one tells TypeScript a module exists that the package does not contain. '
		+ 'Importing from it yields undefined at runtime, or fails to resolve, while the '
		+ 'compiler reports nothing.\n'
		+ '  Usual cause: the module is only ever referenced in a type position, so tsup '
		+ 'tree-shakes its code but `dts: true` still writes its declaration. Fix by '
		+ 'exporting the symbol as a value from src/index.ts.'
	);
} else {
	console.log('verify-runtime-exports: no orphan declarations');
}

const declared = declaredValueExports(read(DTS));

for (const bundle of BUNDLES) {
	const rel = path.relative(ROOT, bundle);
	const present = bundleExports(read(bundle));
	const missing = declared.filter((name) => !present.has(name));

	if (missing.length) {
		failed = true;
		console.error(
			`verify-runtime-exports: ${rel} is missing ${missing.length} value export(s) `
			+ `that dist/index.d.ts declares: ${missing.join(', ')}\n`
			+ '  The type says these exist; the bundle does not contain them, so a consumer '
			+ 'importing one gets undefined at runtime while TypeScript reports no error.\n'
			+ '  Usual cause: the symbol is only referenced in a type position and gets '
			+ 'tree-shaken. Fix by exporting it as a value from src/index.ts.'
		);
	} else {
		console.log(`verify-runtime-exports: ${rel} exports all ${declared.length} declared values`);
	}
}

process.exit(failed ? 1 : 0);
