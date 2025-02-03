module.exports = {
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.[tj]s$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  moduleFileExtensions: ['js', 'mjs', 'cjs'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,mjs,cjs}', '!src/**/index.js'],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  transformIgnorePatterns: ['/node_modules/'],
};
