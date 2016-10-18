import webpack from 'webpack'
import nodeExternals from 'webpack-node-externals'
import DashboardPlugin from 'webpack-dashboard/plugin'

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

export default {
  target: 'node',
  devtool: isProd ? 'source-map' : 'cheap-eval-source-map',
  devServer: {
    stats: { chunks: false }
  },
  entry: ['babel-polyfill', './app/bot/fork.dev'],
  output: {
    libraryTarget: 'commonjs2',
    path: __dirname,
    filename: isProd ? './app/fork.js' : './app/bot/fork.js'
  },
  plugins: [
    new webpack.BannerPlugin(
      'require("source-map-support").install()',
      { raw: true, entryOnly: false }
    ),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.DefinePlugin({ FormData: false }),
    new DashboardPlugin()
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
