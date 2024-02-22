import {defineConfig} from 'tsup';

export default defineConfig({
	format: ['cjs', 'esm'],
	entry: ['./src/index.ts'],
	sourcemap: false,
	dts: true,
	shims: true,
	skipNodeModulesBundle: true,
	clean: true,
	minify: 'terser',
	treeshake: 'smallest'
});
