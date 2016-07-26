import webpack from 'webpack'
import nodeExternals from 'webpack-node-externals'

export default {
  target: 'node',
  devtool: 'source-map',
  entry: ['babel-polyfill', './main/fork.dev'],
  output: {
    libraryTarget: 'commonjs2',
    path: __dirname,
    filename: './main/fork.js'
  },
  plugins: [
    new webpack.BannerPlugin(
      'require("source-map-support").install()',
      { raw: true, entryOnly: false }
    ),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.DefinePlugin({ FormData: false }),
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    resolve: {
      modulesDirectories: [
        'node_modules'
      ]
    },
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [
    'chokidar',
    ...nodeExternals({
      whitelist: ['async/series', /^lodash/, 'form-data']
    })]
}
