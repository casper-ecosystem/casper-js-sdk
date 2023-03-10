module.exports = {
  env: {
    node: true
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:lodash/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin-jsdoc', 'eslint-plugin-prefer-arrow', 'lodash'],
  overrides: [
    {
      files: ['*.ts'], // Your TypeScript files extension
      // As mentioned in the comments, you should extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        project: ['./tsconfig.json'] // Specify it only for TypeScript files
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'lodash/import-scope': [2, 'method'],
    'lodash/prefer-lodash-method': 'off',
    'lodash/prefer-lodash-typecheck': 'off',
    'lodash/prefer-constant': 'off',
    'lodash/prefer-is-nil': 'off',
    'lodash/prefer-includes': 'off',
    'lodash/prefer-matches': 'off'
  }
};
