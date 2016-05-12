
const path = require('path');

module.exports = {
  entry: './index.jsx',
  output: {
    path: './build',
    filename: 'app.bundle.js',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets:[ 'es2015', 'react', 'stage-2' ]
      }
    }]
  },
  resolve: {
    root: path.resolve('.'),
    alias: {
      '/imports': 'imports'
    }
  }
};
