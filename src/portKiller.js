import crossSpawn from 'cross-spawn';
import debug from 'debug';
import { sleep } from './utils.js';
import { COMMANDS } from './constants.js';
import { log } from './logger.js';

const debugLog = debug('killportall:killer');

async function getProcessInfo(pid, platform) {
  if (!pid) return null;
  
  let command, args;
  if (platform === 'win32') {
    command = 'tasklist';
    args = ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'];
  } else {
    command = 'ps';
    args = ['-p', pid, '-o', 'pid,ppid,user,%cpu,%mem,command'];
  }

  return new Promise((resolve) => {
    const child = crossSpawn(command, args);
    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) return resolve(null);
      
      const info = parseProcessInfo(output, platform);
      debugLog(`Process info for PID ${pid}:`, info);
      return resolve(info);
    });

    child.on('error', () => resolve(null));
  });
}

function parseProcessInfo(output, platform) {
  if (!output.trim()) return null;

  if (platform === 'win32') {
    // Windows CSV format: "Image Name","PID","Session Name","Session#","Mem Usage"
    const [imageName, pid, , , memUsage] = output.trim()
      .split(',')
      .map(field => field.replace(/^"|"$/g, ''));
    
    return {
      pid: parseInt(pid),
      name: imageName,
      memory: memUsage,
      command: imageName
    };
  } else {
    // Unix format: PID PPID USER %CPU %MEM COMMAND
    const lines = output.trim().split('\n');
    const processLine = lines.length > 1 ? lines[1] : lines[0]; // Skip header if present
    const [pid, ppid, user, cpu, mem, ...commandParts] = processLine.trim().split(/\s+/);
    return {
      pid: parseInt(pid),
      ppid: parseInt(ppid),
      user,
      cpu: parseFloat(cpu),
      memory: parseFloat(mem),
      command: commandParts.join(' ')
    };
  }
}

async function findProcessId(port) {
  debugLog(`Finding process on port ${port}`);
  
  return new Promise((resolve, reject) => {
    let command, args;
    if (process.platform === 'win32') {
      command = 'netstat';
      args = ['-ano', '|', 'findstr', `:${port}`];
    } else {
      command = 'lsof';
      args = ['-i', `:${port}`, '-t']; // -t to only get PID
    }
    
    const child = crossSpawn(command, args);
    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        debugLog('Command failed with code:', code);
        return resolve(null);
      }
      
      const pid = parsePidFromOutput(output, process.platform, port);
      debugLog(`Found PID ${pid} for port ${port}`);
      resolve(pid);
    });

    child.on('error', (err) => {
      debugLog('Command error:', err);
      reject(new Error(`Failed to execute find command: ${err.message}`));
    });
  });
}

function parsePidFromOutput(output, platform, port) {
  if (!output.trim()) return null;
  
  if (platform === 'win32') {
    // Look for exact port match in Windows netstat output
    const regex = new RegExp(`[:\\s]${port}\\s+.*?\\s+(\\d+)\\s*$`, 'm');
    const match = output.match(regex);
    return match ? match[1] : null;
  } else {
    // For Unix-like systems, lsof -t returns only the PID
    return output.trim().split('\n')[0];
  }
}

async function killProcess(pid) {
  debugLog(`Killing process ${pid}`);
  const { command, args } = COMMANDS[process.platform].kill;
  
  return new Promise((resolve, reject) => {
    const child = crossSpawn(command, [...args, pid]);
    
    child.on('close', (code) => {
      resolve(code === 0);
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to kill process: ${err.message}`));
    });
  });
}

async function killPort(port, options = {}) {
  const { retries = 3, timeout = 1000 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const pid = await findProcessId(port);
      
      if (!pid) {
        log.info(`No process found on port ${port}`);
        return { port, success: true };
      }

      // Get and display process information before killing
      const processInfo = await getProcessInfo(pid, process.platform);
      if (processInfo) {
        log.info(`Process found on port ${port}:`);
        log.info(`  PID: ${processInfo.pid}`);
        log.info(`  Name: ${processInfo.name || processInfo.command}`);
        if (processInfo.user) log.info(`  User: ${processInfo.user}`);
        if (processInfo.cpu) log.info(`  CPU: ${processInfo.cpu}%`);
        log.info(`  Memory: ${processInfo.memory}`);
      }

      const killed = await killProcess(pid);
      if (killed) {
        log.success(`Successfully killed process ${pid} on port ${port}`);
        return { port, success: true };
      }

      if (attempt < retries) {
        log.warn(`Failed to kill port ${port}, attempt ${attempt}/${retries}`);
        await sleep(timeout);
      }
    } catch (error) {
      debugLog(`Error killing port ${port}:`, error);
      if (attempt === retries) {
        return { port, success: false, error: error.message };
      }
      await sleep(timeout);
    }
  }

  return { port, success: false, error: 'Max retries reached' };
}

async function killPorts(ports, options) {
  debugLog(`Killing ports: ${ports.join(', ')}`);
  return Promise.all(ports.map(port => killPort(port, options)));
}

export {
  killPorts,
  killPort,
  findProcessId,
  killProcess,
  getProcessInfo
};
