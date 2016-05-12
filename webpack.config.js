
const path = require('path');

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
    }]
  },
  resolve: {
    root: path.resolve('.'),
    extensions: ['', '.js', '.jsx'],
  }
};
