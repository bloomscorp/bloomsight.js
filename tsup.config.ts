import {defineConfig} from 'tsup';
import {readFileSync} from 'fs';

const {version} = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
	format: ['cjs', 'esm'],
	entry: ['./src/index.ts'],
	sourcemap: false,
	dts: true,
	shims: true,
	skipNodeModulesBundle: true,
	clean: true,
	minify: 'terser',
	treeshake: 'smallest',
	// src/b2/version.ts: the version sent to blooms.ai as `bloomsightClient`.
	define: {__BLOOMSIGHT_VERSION__: JSON.stringify(version)},
});
