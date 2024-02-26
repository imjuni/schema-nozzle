module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['coverage/**', 'dist/**', '__test__/**', '__tests__/**'],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    // ----------------------------------------------------------------------------------------------------------
    // eslint
    // ----------------------------------------------------------------------------------------------------------
    'max-len': [
      'error',
      {
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
        ignoreTrailingComments: true,
        code: 120,
      },
    ],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration:not([const=true])',
        message: "Don't declare non-const enums",
      },
    ],
    // ----------------------------------------------------------------------------------------------------------
    // @typescript-eslint
    // ----------------------------------------------------------------------------------------------------------
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]+',
          match: true,
        },
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        custom: {
          regex: '^T[A-Z]+',
          match: true,
        },
      },
    ],
    '@typescript-eslint/member-delimiter-style': [
      'off',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_.+$',
        argsIgnorePattern: '^_.+$',
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    // ----------------------------------------------------------------------------------------------------------
    // eslint-plugin-import
    // ----------------------------------------------------------------------------------------------------------
    // 'import/prefer-default-export': ['off'],
    // 'import/no-default-export': ['error'],
  },
  overrides: [
    {
      files: ['src/tools/logger.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': ['off'],
      },
    },
    {
      files: ['src/databases/createDatabaseItem.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': ['off'],
      },
    },
    {
      files: ['**/__tests__/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        'no-console': ['off'],
      },
    },
    {
      files: ['src/cli.ts'],
      rules: {
        '@typescript-eslint/await-thenable': ['off'],
        '@typescript-eslint/no-misused-promises': ['off'],
      },
    },
    {
      files: ['vitest.config.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-argument': ['off'],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-var-requires': ['off'],
        'import/no-extraneous-dependencies': ['off'],
      },
    },
    {
      files: ['examples/*.ts'],
      rules: {
        '@typescript-eslint/naming-convention': ['off'],
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.eslint.json',
      },
    },
  },
};
