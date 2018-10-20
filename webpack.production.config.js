const webpack = require('webpack')
const path = require('path')

// Plugins
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const AsyncChunkNamesPlugin = require("webpack-async-chunk-names-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require('brotli-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const Dotenv = require('dotenv-webpack')
const loadersConf = require('./webpack.loaders')

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    app: [
      'babel-polyfill',
      './app/index.jsx'
    ]
  },
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'public'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules') // the old 'fallback' option (needed for npm link-ed packages)
    ],
    alias: {
      styles: path.resolve(__dirname, 'styles/')
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 8,
          warnings: false,
          compress: {
            warnings: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            drop_console: true,
            drop_debugger: true,
          },
          output: {
            comments: false,
            beautify: false,
          },
          sourceMap: false,
          pure_funcs: ['console.log'],
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_classnames: undefined,
          keep_fnames: false,
          safari10: false,
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } },
      }),
    ],
  },
  module: {
    rules: loadersConf(true)
  },
  plugins: [
    // provides a nice visualisation on http://localhost:8888 for debugging bundle size
    // new BundleAnalyzerPlugin(),
    // Fetch polyfill
    new webpack.ProvidePlugin({
      fetch: 'exports-loader?self.fetch!whatwg-fetch/dist/fetch.umd'
    }),
    // cleans output folder
    new CleanWebpackPlugin(['public']),
    // minimizing is done by webpack as we are in prod mode
    new webpack.optimize.OccurrenceOrderPlugin(),
    // regroup styles in app.css bundle
    new MiniCssExtractPlugin({
      filename: 'app.[chunkhash].css',
      allChunks: true
    }),
    new CopyWebpackPlugin(
      [{ from: 'app/assets', to: '', toType: 'dir' }], // patterns
      {} // options
    ),
    // load the bundles into an html template
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
      },
    }),
    new AsyncChunkNamesPlugin(),
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true,
    }),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
    // gzip
    new CompressionPlugin({
      algorithm: "gzip",
      asset: "[path].gz[query]",
      test: /\.(html|js|css|svg|ttf|eot|otf|woff|ico)$/,
      minRatio: 0.5,
    }),
    // loads up .env file
    new Dotenv({
      path: 'config/env/prod.env',
      systemvars: true
    })
  ]
}
