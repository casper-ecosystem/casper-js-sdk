const webpack = require('webpack');
const productionConfig = require('./webpack.config');
const productionBrowserConfig = productionConfig[1];

module.exports = {
  ...productionBrowserConfig,
  mode: 'development',
  output: {
    filename: 'bundle.js'
  },
  devtool: false,
  plugins: [
    ...productionBrowserConfig.plugins,
    new webpack.SourceMapDevToolPlugin({
      filename: null,
      test: /\.(ts|js)($|\?)/i
    })
  ]
};
