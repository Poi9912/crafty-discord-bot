module.exports = {
  verbose: false,
  collectCoverage: true,
  reporters: [
    'jest-silent-reporter'
  ],
  coverageReporters: ["text", "lcov","json","clover"],
};