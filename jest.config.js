export default {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/environments/**/*.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ['text-summary', 'lcov', 'json-summary', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 86.66,
      functions: 98.78,
      lines: 96,
      statements: 96.25,
    },
  },
};
