/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  skipErrorChecking: true,
  navigationLinks: {
    GitHub: 'https://github.com/casper-ecosystem/casper-js-sdk'
  }
};
