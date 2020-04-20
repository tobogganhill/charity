const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	entry: './app/js/app.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'app.js',
	},
	plugins: [
		// Copy index.html to the build folder.
		new CopyWebpackPlugin([
			{
				from: './app/index.html',
				to: 'index.html',
			},
		]),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
		loaders: [
			{
				test: /\.json$/,
				use: 'json-loader',
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader',
				query: {
					presets: ['2017'],
					plugins: ['transform-runtime'],
				},
			},
		],
	},
};
