module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  transformIgnorePatterns: [],
};
