/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ['packages/**'],
  out: 'docs',
  entryPointStrategy: 'packages',
  navigationLinks: {
    GitHub: 'https://github.com/casper-ecosystem/casper-js-sdk'
  }
};
