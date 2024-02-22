const {resolve} = require("path");

module.exports = {
	entry: "./src/index.ts",
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
		filename: `production.js`,
		path: resolve(__dirname, 'umd')
	}
};
