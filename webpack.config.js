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
  // No `resolve.fallback` here on purpose. It used to shim nine Node builtins;
  // none of them is reachable from `src` (the SDK's crypto is `@noble/*`, and
  // axios resolves to its browser build), and `dist/lib.web.js` was verified
  // byte-identical with the block present and absent. Carrying it pulled the
  // `elliptic`/`browserify-sign`/`create-ecdh` advisory chain into the tree for
  // nothing. `Buffer` and `process` are the two globals that *are* used, and
  // they come from the ProvidePlugins below.
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
