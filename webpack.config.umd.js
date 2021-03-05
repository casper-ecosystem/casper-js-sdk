const path = require('path');
const config = require('./webpack.config');

module.exports = {
  ...config[1],
  output: {
    filename: 'lib.umd.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'this'
  }
};
