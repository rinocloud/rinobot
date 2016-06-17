var path = require('path');
var fs = require('fs')
var webpack = require('webpack')

let nodeModules = ['chokidar']
  // chokidar: 'commonjs chokidar;

fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules.push(mod);
  });

export default {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader?presets[]=es2015,presets[]=stage-0,presets[]=stage-2,presets[]=react'],
      exclude: /node_modules/,
    },
    {test: /\.json$/,loader: 'json-loader'},
    { test: /\.css$/, loader: "style-loader!css-loader" },
  ]
  },
  node: {
    __dirname: true,
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.cjsx', '.coffee'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins: [
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ],
  externals: [
    ...nodeModules
  ]
};
