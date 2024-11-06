import { jest } from '@jest/globals';
import { validatePorts, isValidPort } from '../src/utils.js';

describe('Utils', () => {
  describe('validatePorts', () => {
    it('should validate single port', () => {
      expect(validatePorts(['3000'])).toEqual([3000]);
    });

    it('should validate port range', () => {
      expect(validatePorts(['3000-3002'])).toEqual([3000, 3001, 3002]);
    });

    it('should filter invalid ports', () => {
      expect(validatePorts(['0', '65536', '3000'])).toEqual([3000]);
    });

    it('should handle multiple inputs', () => {
      expect(validatePorts(['3000', '3001-3003', '8080'])).toEqual([3000, 3001, 3002, 3003, 8080]);
    });
  });

  describe('isValidPort', () => {
    it('should validate port numbers', () => {
      expect(isValidPort(1)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort('3000')).toBe(false);
    });
  });
});
