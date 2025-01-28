module.exports = {
    extends: ['eslint:recommended', 'plugin:googleappsscript/recommended', 'prettier'],
    env: {
      es6: true,
      node: true,
    },
    rules: {
      'no-console': 'off',
    },
  };
  