const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');

function getConfig(opts) {
  if (opts == null) {
    opts = {};
  }

  const file = `./dist/lib${opts.suffix || ''}.js`;
  const exportConditions = ['import', 'default'];
  const mainFields = ['module', 'main'];
  if (opts.browser) {
    mainFields.unshift('browser');
  }

  return {
    input: 'src/index.ts',
    output: {
      file,
      name: opts.name || undefined,
      format: opts.format || 'esm',
      sourcemap: true
    },
    treeshake: true,
    plugins: [
      json(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      nodeResolve({
        exportConditions,
        mainFields,
        modulesOnly: true,
        preferBuiltins: false
      }),
      nodePolyfills({ exclude: ['fs'] })
    ]
  };
}

// /** @type {import('rollup').RollupOptions} */
// const commonjsConfig = {
//   ...config,
//   output: {
//     ...config.output,
//     file: 'dist/lib.cjs.js',
//     format: 'cjs'
//   },
//   plugins: [...config.plugins, commonjs()]
// };

// /** @type {import('rollup').RollupOptions} */
// const browserConfig = {
//   ...config,
//   output: {
//     ...config.output,
//     file: 'dist/lib.js',
//     name: 'casper-js-sdk',
//     format: 'umd'
//   },
//   plugins: [
//     ...config.plugins,
//     resolve({
//       preferBuiltins: false,
//       browser: true
//     }),
//     commonjs(),
//     nodePolyfills({ exclude: ['fs'] })
//   ]
// };

// /** @type {import('rollup').RollupOptions} */
// const nodeConfig = {
//   ...config,
//   output: {
//     ...config.output,
//     file: 'dist/lib.node.js',
//     name: 'casper-js-sdk',
//     format: 'umd'
//   },
//   plugins: [...config.plugins]
// };

/** @type {import('rollup').RollupOptions} */
module.exports = [
  getConfig({ browser: true }),
  getConfig({
    browser: true,
    suffix: '.umd',
    format: 'umd',
    name: 'casper-js-sdk'
  })
];
// export default browserConfig;
