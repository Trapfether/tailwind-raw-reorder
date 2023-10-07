module.exports = {
  plugins: [],
  env: {
    module: true,
    es2022: true,
    node: true
  },
  extends: ['google'],
  parserOptions: {
    ecmaVersion: 14
  },
	ignorePatterns: ["**/dist/*.js"],
  rules: {
    'max-len': ['error', {code: 150}],
    'comma-dangle': ['error', 'never'],
    'no-undef': ['error', {typeof: true}],
    'no-shadow': ['error', {builtinGlobals: false, hoist: 'functions', allow: []}],
    'valid-jsdoc': 'off',
    'new-cap': 'off',
    'indent': ['error', 2]
  },
  settings: {
    jsdoc: {
      mode: 'typescript'
    }
  }
};
