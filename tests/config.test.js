import { jest } from '@jest/globals';
import { loadConfig, saveConfig, DEFAULT_CONFIG } from '../src/config.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

jest.mock('fs');
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: () => '/mock/home'
}));

describe('Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return default config when no config file exists', () => {
      readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should load and merge config with defaults', () => {
      const mockConfig = {
        retries: 5,
        timeout: 2000
      };

      readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = loadConfig();
      expect(config).toEqual({
        ...DEFAULT_CONFIG,
        ...mockConfig
      });
    });

    it('should validate config values', () => {
      const mockConfig = {
        retries: 'invalid',
        timeout: 'invalid',
        interactive: 'invalid',
        outputFormat: 'invalid'
      };

      readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('saveConfig', () => {
    it('should save config successfully', () => {
      writeFileSync.mockImplementation(() => {});

      const newConfig = {
        retries: 5,
        timeout: 2000
      };

      const result = saveConfig(newConfig);
      expect(result).toBe(true);
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should handle save errors', () => {
      writeFileSync.mockImplementation(() => {
        throw new Error('Save failed');
      });

      const result = saveConfig({});
      expect(result).toBe(false);
    });
  });
});
