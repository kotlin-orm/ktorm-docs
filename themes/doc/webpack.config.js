'use strict';
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  externals: {
    jquery: '$'
  },
  entry:  {
    'doc': './lib/browser/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'source/script'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false
    })]
  }
};
