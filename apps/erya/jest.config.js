module.exports = {
  name: 'erya',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/erya',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
