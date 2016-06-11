
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [ 'babel-polyfill', './index.jsx' ],
  output: {
    path: './build',
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
  plugins: [
    new ExtractTextPlugin('styles.css', { allChunks: true }),
  ],
  devServer: {
    port: process.env.PORT || 3000,
    historyApiFallback: true
  }
};
