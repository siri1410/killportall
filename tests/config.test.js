import { jest } from '@jest/globals';
import { loadConfig, saveConfig, DEFAULT_CONFIG } from '../src/config.js';

// Mock modules before importing
const mockReadFileSync = jest.fn();
const mockWriteFileSync = jest.fn();

// Mock the fs module
jest.unstable_mockModule('fs', () => ({
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync
}));

// Mock the os module
jest.unstable_mockModule('os', () => ({
  homedir: () => '/mock/home'
}));

// Import the mocked modules
const fs = await import('fs');

describe('Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockReadFileSync.mockReset();
    mockWriteFileSync.mockReset();
  });

  describe('loadConfig', () => {
    it('should return default config when no config file exists', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

  

    it('should validate config values', () => {
      const mockConfig = {
        retries: 'invalid',
        timeout: 'invalid',
        interactive: 'invalid',
        outputFormat: 'invalid'
      };

      mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });


});
