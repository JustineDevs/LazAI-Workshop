// Test setup and configuration
const { expect } = require('chai');

// Global test configuration
global.expect = expect;

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/datastreamnft_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.LAZAI_RPC_URL = 'https://testnet.lazai.network';
process.env.LAZAI_CHAIN_ID = '133718';

// Mock console methods in tests to reduce noise
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: () => {},
  warn: () => {},
  error: () => {},
};

// Test timeout configuration
const timeout = 10000; // 10 seconds

// Global test utilities
global.testUtils = {
  generateTestAddress: () => `0x${Math.random().toString(16).substr(2, 40)}`,
  generateTestFileId: () => `test-file-${Date.now()}`,
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Cleanup after tests
afterEach(() => {
  // Clear any timers
  if (global.gc) {
    global.gc();
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});