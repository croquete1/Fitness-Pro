/* .eslintrc.cjs */
module.exports = {
  root: true,
  extends: ['next', 'next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // não bloquear build por imports/vars não usados enquanto migramos
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^(assertRole|getServerSession|authOptions|user)$',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    // relaxar "any" para WARN durante a migração (podes voltar a 'error' mais tarde)
    '@typescript-eslint/no-explicit-any': 'warn',
    // prefer-const como warn para não quebrar build
    'prefer-const': 'warn',
    // comentários de supressão: permitir @ts-ignore temporariamente em migração
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      { 'ts-expect-error': 'allow-with-description', 'ts-ignore': 'allow-with-description' },
    ],
    // durante a migração aceitamos {} como tipo sem travar o lint
    '@typescript-eslint/ban-types': 'warn',
  },
};
