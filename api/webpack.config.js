var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {
  chokidar: 'commonjs chokidar',
  electron: 'commonjs electron',
};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: {
    api: __dirname + '/src/api.js'
  },
  devtool: 'sourcemap',
  target: 'node',
  externals: nodeModules,
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        loader: "babel-loader",
        test: /\.js?$/,
        query: {
          presets: ['es2015'],
        }
      },
      { test: /\.json$/, loader: "json" }
    ]
  }
};
