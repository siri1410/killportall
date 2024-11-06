import { jest } from '@jest/globals';
import { killPort, findProcessId } from '../src/portKiller.js';

// Create mock functions
const mockCrossSpawn = jest.fn();
const mockLog = {
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock the modules
jest.unstable_mockModule('cross-spawn', () => ({
  default: mockCrossSpawn
}));

jest.unstable_mockModule('../src/logger.js', () => ({
  log: mockLog
}));

describe('Port Killer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCrossSpawn.mockReset();
  });

  describe('findProcessId', () => {
    

    it('should return null when no process found', async () => {
      const mockSpawn = {
        stdout: {
          on: jest.fn()
        },
        on: jest.fn()
      };

      mockSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(1), 0);
        }
      });

      mockCrossSpawn.mockReturnValue(mockSpawn);
      
      const pid = await findProcessId(3000);
      expect(pid).toBeNull();
    });
  });

  describe('killPort', () => {
    it('should successfully kill process on port', async () => {
      // Mock for findProcessId
      const mockFindSpawn = {
        stdout: {
          on: jest.fn()
        },
        on: jest.fn()
      };

      mockFindSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback('123'), 0);
        }
      });

      mockFindSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 10);
        }
      });

      // Mock for kill command
      const mockKillSpawn = {
        on: jest.fn()
      };

      mockKillSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 20);
        }
      });

      mockCrossSpawn
        .mockReturnValueOnce(mockFindSpawn)
        .mockReturnValueOnce(mockKillSpawn);

      const result = await killPort(3000);
      expect(result.success).toBe(true);
    });

    it('should handle kill failure', async () => {
      // Mock for findProcessId
      const mockFindSpawn = {
        stdout: {
          on: jest.fn()
        },
        on: jest.fn()
      };

      mockFindSpawn.stdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          setTimeout(() => callback('123'), 0);
        }
      });

      mockFindSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 10);
        }
      });

      // Mock for kill command failure
      const mockKillSpawn = {
        on: jest.fn()
      };

      mockKillSpawn.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(1), 20);
        }
      });

      mockCrossSpawn
        .mockReturnValueOnce(mockFindSpawn)
        .mockReturnValueOnce(mockKillSpawn);

      const result = await killPort(3000);
      expect(result.success).toBe(true);
    });
  });
});
