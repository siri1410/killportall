import inquirer from 'inquirer';
import { log } from './logger.js';
import { COMMANDS } from './constants.js';
import crossSpawn from 'cross-spawn';
import { killPorts, findProcessId, getProcessInfo } from './portKiller.js';
import { isValidPort } from './utils.js';

async function getAllActivePorts() {
  return new Promise((resolve, reject) => {
    const platform = process.platform;
    let command, args;
    
    if (platform === 'win32') {
      command = 'netstat';
      args = ['-ano'];
    } else {
      command = 'lsof';
      args = ['-i', '-n', '-P']; // Removed -t to get full output
    }

    const child = crossSpawn(command, args);
    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        log.warn(`Command failed with code ${code}`);
        return resolve([]);
      }

      const ports = new Set();
      const lines = output.split('\n');

      lines.forEach(line => {
        const port = extractPortFromLine(line, platform);
        if (port && isValidPort(port)) {
          ports.add(port);
        }
      });

      resolve(Array.from(ports).sort((a, b) => a - b));
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to list active ports: ${err.message}`));
    });
  });
}

function extractPortFromLine(line, platform) {
  if (platform === 'win32') {
    const match = line.match(/:(\d+)\s/);
    return match ? parseInt(match[1]) : null;
  } else {
    // Enhanced regex for Unix-like systems to match both IPv4 and IPv6
    const matches = line.match(/[.:]*:(\d+)\s+\(LISTEN\)/);
    return matches ? parseInt(matches[1]) : null;
  }
}

async function getPortWithProcessInfo(port) {
  const pid = await findProcessId(port);
  if (!pid) return { port, description: 'Unknown process' };

  const processInfo = await getProcessInfo(pid, process.platform);
  if (!processInfo) return { port, description: `PID: ${pid}` };

  const description = processInfo.user
    ? `${processInfo.name || processInfo.command} (PID: ${pid}, User: ${processInfo.user})`
    : `${processInfo.name || processInfo.command} (PID: ${pid})`;

  return { port, description };
}

async function runInteractiveMode(options) {
  try {
    log.info('Scanning for active ports...');
    const activePorts = await getAllActivePorts();

    if (activePorts.length === 0) {
      log.info('No active ports found');
      return [];
    }

    // Get process information for all ports
    const portsWithInfo = await Promise.all(
      activePorts.map(port => getPortWithProcessInfo(port))
    );

    const choices = portsWithInfo.map(({ port, description }) => ({
      name: `Port ${port} - ${description}`,
      value: port
    }));

    const { selectedPorts } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPorts',
        message: 'Select ports to kill (use space to select, enter to confirm):',
        choices,
        pageSize: 15,
        validate: (answer) => {
          if (answer.length === 0) {
            return 'You must select at least one port';
          }
          return true;
        }
      }
    ]);

    if (selectedPorts.length === 0) {
      log.warn('No ports selected');
      return [];
    }

    return await killPorts(selectedPorts, options);
  } catch (error) {
    log.error(`Interactive mode failed: ${error.message}`);
    throw error;
  }
}

export { runInteractiveMode };
