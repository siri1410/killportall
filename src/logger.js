import chalk from 'chalk';
import debug from 'debug';

const debugLog = debug('killportall:logger');

class Logger {
  info(message) {
    console.log(chalk.blue('ℹ'), message);
    debugLog('INFO:', message);
  }

  success(message) {
    console.log(chalk.green('✓'), message);
    debugLog('SUCCESS:', message);
  }

  warn(message) {
    console.log(chalk.yellow('⚠'), message);
    debugLog('WARN:', message);
  }

  error(message) {
    console.error(chalk.red('✗'), message);
    debugLog('ERROR:', message);
  }
}

export const log = new Logger();
