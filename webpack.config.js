const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const nodeExternals = require('webpack-node-externals');

/** @type { import('webpack').Configuration } */
const common = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader?configFile=tsconfig.build.json',
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
    libraryTarget: 'umd'
  },
  externals: [nodeExternals()] // in order to ignore all modules in node_modules folder
};

/** @type { import('webpack').Configuration } */
const clientConfig = {
  ...common,
  target: 'web',
  resolve: {
    ...common.resolve,
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      zlib: require.resolve('browserify-zlib'),
      fs: false,
      https: require.resolve('https-browserify')
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
const esmConfig = {
  ...common,
  target: 'node',
  externalsType: 'module',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.build.json',
            compilerOptions: {
              module: 'esnext',
              moduleResolution: 'node'
            }
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  experiments: {
    outputModule: true
  },
  // BundleAnalyzerPlugin has known issues with outputModule: true — exclude it
  plugins: [],
  externals: [nodeExternals({ importType: 'module' })],
  externalsPresets: {
    node: true
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.esm.mjs',
    chunkFormat: 'module',
    library: {
      type: 'module'
    }
  }
};

/** @type { import('webpack').Configuration } */
module.exports = [serverConfig, clientConfig, bundlerConfig, esmConfig];
