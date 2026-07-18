export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
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
