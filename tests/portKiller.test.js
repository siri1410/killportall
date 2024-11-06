import { jest } from '@jest/globals';
import { killPort, findProcessId, killProcess } from '../src/portKiller.js';
import crossSpawn from 'cross-spawn';

jest.mock('cross-spawn');
jest.mock('../src/logger.js');

describe('Port Killer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findProcessId', () => {
    it('should find process ID for given port', async () => {
      const mockSpawn = {
        stdout: {
          on: jest.fn((event, cb) => {
            if (event === 'data') cb('123');
          })
        },
        on: jest.fn((event, cb) => {
          if (event === 'close') cb(0);
        })
      };
      
      crossSpawn.mockReturnValue(mockSpawn);
      
      const pid = await findProcessId(3000);
      expect(pid).toBe('123');
    });

    it('should return null when no process found', async () => {
      const mockSpawn = {
        stdout: {
          on: jest.fn()
        },
        on: jest.fn((event, cb) => {
          if (event === 'close') cb(1);
        })
      };
      
      crossSpawn.mockReturnValue(mockSpawn);
      
      const pid = await findProcessId(3000);
      expect(pid).toBeNull();
    });
  });

  describe('killPort', () => {
    it('should successfully kill process on port', async () => {
      const mockFindSpawn = {
        stdout: {
          on: jest.fn((event, cb) => {
            if (event === 'data') cb('123');
          })
        },
        on: jest.fn((event, cb) => {
          if (event === 'close') cb(0);
        })
      };

      const mockKillSpawn = {
        on: jest.fn((event, cb) => {
          if (event === 'close') cb(0);
        })
      };

      crossSpawn
        .mockReturnValueOnce(mockFindSpawn)
        .mockReturnValueOnce(mockKillSpawn);

      const result = await killPort(3000);
      expect(result.success).toBe(true);
    });
  });
});
