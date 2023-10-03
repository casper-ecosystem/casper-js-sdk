const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');

/**
 * Get configuration for rollup
 * @param {{
 *  browser: boolean,
 *  suffix: string | undefined,
 *  format: import('rollup').OutputOptions['format'],
 *  name: string | undefined
 * }} opts
 * @returns {import('rollup').RollupOptions}
 */
function getConfig(opts) {
  if (opts == null) {
    opts = {
      browser: true,
      format: 'esm'
    };
  }

  const file = `./dist/lib${opts.suffix || ''}.js`;
  const exportConditions = ['import', 'default'];
  const mainFields = ['module', 'main'];
  if (opts.browser) {
    mainFields.unshift('browser');
  }

  const plugins = [
    json(),
    typescript({ tsconfig: './tsconfig.build.json' }),
    nodeResolve({
      exportConditions,
      mainFields,
      modulesOnly: true,
      preferBuiltins: opts.browser ? false : true
    })
  ];

  if (opts.browser) {
    plugins.push(nodePolyfills({ exclude: ['fs'] }));
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
    plugins
  };
}

/** @type {import('rollup').RollupOptions[]} */
module.exports = [
  getConfig({ browser: true, format: 'esm' }),
  getConfig({
    browser: false,
    suffix: '.node',
    format: 'commonjs',
    name: 'casper-js-sdk'
  })
];
