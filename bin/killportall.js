#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import debug from 'debug';
import { killPorts } from '../src/portKiller.js';
import { validatePorts } from '../src/utils.js';
import { runInteractiveMode } from '../src/interactive.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { loadConfig, saveConfig } from '../src/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')));
const debugLog = debug('killportall:cli');

const program = new Command();
const config = loadConfig();

program
  .version(packageJson.version)
  .description('Kill processes running on specified ports')
  .argument('[ports...]', 'Port numbers to kill (can be single port, range, or multiple ports)')
  .option('-r, --retries <number>', 'Number of retry attempts', String(config.retries))
  .option('-t, --timeout <ms>', 'Timeout between retries in milliseconds', String(config.timeout))
  .option('-i, --interactive', 'Run in interactive mode to select ports from a list', config.interactive)
  .option('-j, --json', 'Output results in JSON format')
  .option('--config <key=value>', 'Set a configuration value (retries, timeout, interactive, outputFormat)')
  .action(async (ports, options) => {
    try {
      // Handle config setting
      if (options.config) {
        const [key, value] = options.config.split('=');
        if (!key || !value) {
          console.error(chalk.red('Error: Invalid config format. Use key=value'));
          process.exit(1);
        }
        const newConfig = {};
        switch (key) {
          case 'retries':
            newConfig.retries = parseInt(value);
            break;
          case 'timeout':
            newConfig.timeout = parseInt(value);
            break;
          case 'interactive':
            newConfig.interactive = value === 'true';
            break;
          case 'outputFormat':
            if (!['text', 'json'].includes(value)) {
              console.error(chalk.red('Error: outputFormat must be either "text" or "json"'));
              process.exit(1);
            }
            newConfig.outputFormat = value;
            break;
          default:
            console.error(chalk.red(`Error: Unknown config key "${key}"`));
            process.exit(1);
        }
        if (saveConfig({ ...config, ...newConfig })) {
          console.log(chalk.green('Configuration saved successfully'));
          process.exit(0);
        } else {
          process.exit(1);
        }
      }

      debugLog('Starting port killing process with arguments:', { ports, options });
      
      const outputFormat = options.json ? 'json' : config.outputFormat;
      let results;

      if (options.interactive || config.interactive || ports.length === 0) {
        results = await runInteractiveMode({
          retries: parseInt(options.retries),
          timeout: parseInt(options.timeout)
        });
      } else {
        const validatedPorts = validatePorts(ports);
        if (!validatedPorts.length) {
          console.error(chalk.red('Error: No valid ports specified'));
          process.exit(1);
        }

        results = await killPorts(validatedPorts, {
          retries: parseInt(options.retries),
          timeout: parseInt(options.timeout)
        });
      }

      if (outputFormat === 'json') {
        console.log(JSON.stringify(results, null, 2));
      } else {
        results.forEach(result => {
          if (result.success) {
            console.log(chalk.green(`✓ Port ${result.port}: Process killed successfully`));
          } else {
            console.error(chalk.red(`✗ Port ${result.port}: ${result.error}`));
          }
        });
      }

    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      debugLog('Error details:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
