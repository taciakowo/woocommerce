import js from '@eslint/js';
import googleappsscript from 'eslint-plugin-googleappsscript';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...googleappsscript.environments.global,
      },
    },
    plugins: {
      googleappsscript,
    },
    rules: {
      'no-undef': 'off',
      'googleappsscript/no-undef': 'off',
    },
  },
];
