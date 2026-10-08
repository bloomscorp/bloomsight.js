const {resolve} = require("path");

module.exports = {
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
							noEmit: false
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
