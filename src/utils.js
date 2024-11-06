import debug from 'debug';

const debugLog = debug('killportall:utils');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validatePorts(ports) {
  debugLog('Validating ports:', ports);
  const validPorts = new Set();

  ports.forEach(port => {
    if (port.includes('-')) {
      // Handle port ranges
      const [start, end] = port.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (isValidPort(i)) validPorts.add(i);
        }
      }
    } else {
      // Handle single ports
      const numPort = parseInt(port);
      if (isValidPort(numPort)) validPorts.add(numPort);
    }
  });

  return Array.from(validPorts);
}

function isValidPort(port) {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export {
  sleep,
  validatePorts,
  isValidPort
};
