import { jest } from '@jest/globals';

// Set up global test timeout
jest.setTimeout(10000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Add any global test setup here
global.console = {
  ...console,
  // Silence console logs during tests
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
}; 