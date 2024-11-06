export const COMMANDS = {
  win32: {
    find: {
      command: 'netstat',
      args: ['-ano', '|', 'findstr', ':']
    },
    kill: {
      command: 'taskkill',
      args: ['/F', '/PID']
    }
  },
  darwin: {
    find: {
      command: 'lsof',
      args: ['-i', ':']
    },
    kill: {
      command: 'kill',
      args: ['-9']
    }
  },
  linux: {
    find: {
      command: 'lsof',
      args: ['-i', ':']
    },
    kill: {
      command: 'kill',
      args: ['-9']
    }
  }
};
