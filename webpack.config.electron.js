import webpack from 'webpack';
import baseConfig from './webpack.config.base';

const nodeModules = [
  { chokidar: { commonjs: 'chokidar' } },
  { formidable: { commonjs: 'formidable' } },
  { colors: { commonjs: 'colors' } },
  { 'electron-debug': { commonjs: 'electron-debug' } },
  { 'graceful-fs': { commonjs: 'graceful-fs ' } }
]

export default {
  ...baseConfig,
  devtool: 'source-map',
  entry: ['babel-polyfill', './main.development'],
  output: {
    ...baseConfig.output,
    path: __dirname,
    filename: './main.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new webpack.BannerPlugin(
      'require("source-map-support").install();',
      { raw: true, entryOnly: false }
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [
    ...baseConfig.externals,
    ...nodeModules,
    'font-awesome',
    'source-map-support',
    'chokidar',
    'formidable',
    'colors',
    'graceful-fs',
    'electron-debug'
  ]
};
