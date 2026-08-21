module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/'],
};
