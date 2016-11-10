import webpack from 'webpack'

export default {
  target: 'electron-main',
  devtool: 'source-map',
  entry: ['babel-polyfill', './app/index.dev'],
  output: {
    libraryTarget: 'commonjs2',
    path: __dirname,
    filename: './app/index.js'
  },
  plugins: [
    new webpack.BannerPlugin(
      'require("source-map-support").install()',
      { raw: true, entryOnly: false }
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
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
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [
    'chokidar',
    'npmi',
    'raven',
    'trash',
    'font-awesome',
    'source-map-support'
  ]
}
