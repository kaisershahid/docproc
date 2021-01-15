//const TerserPlugin = require("terser-webpack-plugin");
var webpack = require("webpack");

function generateConfig(opts) {
	const { name, entry, output, mode } = opts;
	var config = {
		entry: __dirname + entry,
		output: {
			path: __dirname + "/dist/src/",
			filename: `${output}.js`,
			sourceMapFilename: `${output}.map`,
			library: "docproc",
			libraryTarget: "umd",
			umdNamedDefine: true,
		},
		resolve: {
			extensions: [".ts", ".js"],
		},
		node: {
			global: true,
			__dirname: false,
			__filename: false,
		},
		devtool: "source-map",
		mode: mode ? mode : "development",
		module: {
			rules: [
				{
					test: /\.ts?$/,
					loader: "awesome-typescript-loader",
					exclude: /node_modules/,
				},
			],
		},
		externals: ["fs", "path", "argparse"],
	};
	return config;
}

var config = [
	{
		name: "index",
		entry: "/src/index.ts",
		output: "index",
		mode: "production",
	},
	{
		name: "cli",
		entry: "/src/cli/bin.ts",
		output: "cli",
		mode: "production",
	},
].map(generateConfig);
module.exports = config;
