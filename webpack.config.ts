const {resolve} = require("path");
const {DefinePlugin} = require("webpack");
const {version} = require("./package.json");

module.exports = {
	// src/b2/version.ts: the version sent to blooms.ai as `bloomsightClient`.
	plugins: [new DefinePlugin({__BLOOMSIGHT_VERSION__: JSON.stringify(version)})],
	// Two bundles: the core library, and the optional DOM helper that sites load
	// as a second script tag. `dom` used to be a hand-written file in umd/ that
	// no build step produced — it is now built from src/dom.ts like everything
	// else. Output names are unchanged, so existing script tags keep resolving.
	entry: {
		production: "./src/index.ts",
		dom: "./src/dom.ts"
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: "ts-loader",
					options: {
						compilerOptions: {
							// `noEmit: false` is needed so ts-loader produces JS for
							// webpack at all — tsconfig.json sets `noEmit: true`
							// because `tsc` is only used for typechecking.
							noEmit: false,
							// But tsconfig.json also sets `declaration: true` and
							// `outDir: "dist"`, so flipping `noEmit` made TypeScript
							// write a .d.ts for **every** source file into dist/ as a
							// side effect of bundling. Webpack's own output goes to
							// umd/, so this was invisible: `npm run bundle` quietly
							// added 49 declaration files with no JavaScript beside
							// them, and with no `files` field in package.json they
							// were published. Every release since has shipped them.
							// Declarations are tsup's job (`dts: true`), not this
							// step's.
							declaration: false,
							declarationMap: false
						}
					}
				},
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
		fallback: {"timers": require.resolve("timers-browserify")}
	},
	// required if using webpack-dev-server
	devServer: {
		contentBase: "./dist",
	},
	output: {
		filename: `[name].js`,
		path: resolve(__dirname, 'umd')
	}
};
