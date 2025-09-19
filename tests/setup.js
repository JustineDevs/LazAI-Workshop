// Jest setup file
const mongoose = require('mongoose');

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastreamnft_test';
    process.env.JWT_SECRET = 'test-jwt-secret';
});

// Global test teardown
afterAll(async () => {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});

// Suppress console.log in tests unless explicitly needed
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
