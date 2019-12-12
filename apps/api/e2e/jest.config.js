// Copied from /apps/api/jest.config.js
// Could not figure out how to DRY this out
module.exports = {
  name: 'api',
  preset: '../../../jest.config.js',
  testMatch: ['**/+(*-)+(spec|test).+(ts|js)?(x)'], // customised to match `jest-e2e`
  testEnvironment: 'node', // https://mongoosejs.com/docs/jest.html
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  }
};
