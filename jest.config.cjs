module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/*.(ts|tsx)', '!**/__tests__/expects/*.(ts|tsx)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'example/',
    'dist/',
    'src/tools/__tests__/context.ts',
    'src/modules/__tests__/env.ts',
  ],
  setupFilesAfterEnv: ['./.configs/jest.setup.cjs'],
  moduleDirectories: ['node_modules', 'src', __dirname],
};
