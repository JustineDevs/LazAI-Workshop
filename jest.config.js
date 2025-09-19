module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test', '<rootDir>/tests'],
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        'contracts/**/*.sol',
        '!src/**/*.test.js',
        '!src/**/*.spec.js',
        '!test/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    globalSetup: '<rootDir>/test/globalSetup.js',
    globalTeardown: '<rootDir>/test/globalTeardown.js'
};
