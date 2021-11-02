const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const copyPlugin = require("copy-webpack-plugin");

const common = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};

const serverConfig = {
  ...common,
  target: 'node',
  plugins: [
    new copyPlugin({
      patterns: [
        { from: "src/@types", to: "@types" },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js',
    libraryTarget: 'umd'
  },
  externals: [nodeExternals()] // in order to ignore all modules in node_modules folder
};

const clientConfig = {
  ...common,
  target: 'web',
  resolve: {
    ...common.resolve,
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      asert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      url: require.resolve('url/'),
      fs: false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.js',
    libraryTarget: 'umd'
  }
};

const bundlerConfig = {
  ...common,
  target: 'web',
  resolve: {
    ...common.resolve
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.cjs.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  externalsPresets: {
    node: true
  }
};

module.exports = [serverConfig, clientConfig, bundlerConfig];
