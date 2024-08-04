'use strict';
const path = require('path');

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
  }
};
