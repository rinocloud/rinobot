/* eslint max-len: 0 */
import webpack from 'webpack'
import path from 'path'

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'

const plugins = [
  new webpack.DefinePlugin({ 'global.GENTLY': false }),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    __DEV__: isProd,
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  })
]

if (isProd) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ compressor: { screw_ie8: true, warnings: false } }))
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin())
  plugins.push(new webpack.IgnorePlugin(/^(buffertools)$/))
  plugins.push(new webpack.NoErrorsPlugin())
}

const config = {
  devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',

  entry: isProd ? './lib/index' :
  [
    'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
    './lib/index'
  ],

  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
    publicPath: isProd ? null : 'http://localhost:3000/dist/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)\?*.*$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins,
  target: 'electron-renderer',
  node: {
    __filename: true,
    __dirname: true
  }
}

export default config
