const webpackConfig = require('./webpack.config.karma');

module.exports = function(config) {
  config.set({
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['webpack', 'mocha', 'chai'],
    plugins: [
      'karma-webpack',
      'karma-sourcemap-loader',
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-spec-reporter'
    ],
    browsers: ['ChromeHeadless'],

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    files: ['src/index.ts', 'src/**/*.test.ts'],
    preprocessors: {
      'src/index.ts': ['webpack', 'sourcemap'],
      'src/{lib,services}/**/*.ts': ['webpack', 'sourcemap']
    },

    reporters: ['spec'],
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  });
};
