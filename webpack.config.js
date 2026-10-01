const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const nodeExternals = require('webpack-node-externals');

/** @type { import('webpack').Configuration } */
const common = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        // ESM input (the shipped tsconfig stays commonjs): webpack can only
        // enumerate exports statically from ESM, which the node bundle's
        // `commonjs-static` output depends on.
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.build.json',
            compilerOptions: { module: 'esnext', moduleResolution: 'node' }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'source-map',
  plugins: [new BundleAnalyzerPlugin({ analyzerMode: 'disabled' })]
};

/** @type { import('webpack').Configuration } */
const serverConfig = {
  ...common,
  target: 'node',
  plugins: [
    new copyPlugin({
      patterns: [{ from: 'src/@types', to: '@types' }]
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js',
    // Not UMD: `commonjs-static` writes exports cjs-module-lexer can parse, so
    // Node's ESM loader can synthesize named exports for
    // `import { RpcClient } from 'casper-js-sdk'`.
    library: { type: 'commonjs-static' }
  },
  externals: [nodeExternals()] // in order to ignore all modules in node_modules folder
};

/** @type { import('webpack').Configuration } */
const clientConfig = {
  ...common,
  target: 'web',
  // No `resolve.fallback` here on purpose: no Node builtin is reachable from
  // `src` (crypto is `@noble/*`, axios resolves to its browser build), and
  // shimming them drags the `elliptic`/`browserify-sign`/`create-ecdh` advisory
  // chain in for nothing. `Buffer` and `process` are the only globals actually
  // used, and the ProvidePlugins below supply them.
  resolve: common.resolve,
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.web.js',
    libraryTarget: 'umd'
  }
};

/** @type { import('webpack').Configuration } */
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

/** @type { import('webpack').Configuration } */
module.exports = [serverConfig, clientConfig, bundlerConfig];
