const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [ 'babel-polyfill', './demo/main.jsx' ],
  output: {
    path: '.',
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets:[ 'es2015', 'react', 'stage-2' ],
        plugins: [
          "transform-runtime",
          ["babel-root-import", {
            "rootPathPrefix": "/"
          }]
        ],
      }
    }, {
      test: /\.(less|css)$/,
      loader: ExtractTextPlugin.extract('style', 'css!less'),
    }]
  },
  resolve: {
    root: path.resolve('.'),
    extensions: ['', '.js', '.jsx'],
  },
  plugins: ([

    // avoid publishing files when compilation failed
    new webpack.NoErrorsPlugin(),

    new ExtractTextPlugin('styles.css', { allChunks: true }),

  ]).concat(process.env.WEBPACK_ENV==='dev' ? [] : [

    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    new webpack.optimize.OccurenceOrderPlugin(),

    // minify
    new webpack.optimize.UglifyJsPlugin({
      output   : { comments: false },
      exclude  : [ /\.min\.js$/gi ], // skip pre-minified libs
      compress : {
        warnings: false
      }
    })
  ]),
  devServer: {
    port: process.env.PORT || 3000,
    contentBase: './demo/static',
    historyApiFallback: true
  }
};
