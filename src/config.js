import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { log } from './logger.js';

const CONFIG_FILE_NAME = '.killportallrc.json';
const DEFAULT_CONFIG = {
  retries: 3,
  timeout: 1000,
  interactive: false,
  outputFormat: 'text'
};

function getConfigPath() {
  // First try current directory
  const currentDirConfig = join(process.cwd(), CONFIG_FILE_NAME);
  try {
    readFileSync(currentDirConfig);
    return currentDirConfig;
  } catch (error) {
    // If not found in current directory, use home directory
    return join(homedir(), CONFIG_FILE_NAME);
  }
}

function loadConfig() {
  try {
    const configPath = getConfigPath();
    const configContent = readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Validate and merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...config,
      retries: Number(config.retries) || DEFAULT_CONFIG.retries,
      timeout: Number(config.timeout) || DEFAULT_CONFIG.timeout,
      interactive: Boolean(config.interactive),
      outputFormat: ['text', 'json'].includes(config.outputFormat) 
        ? config.outputFormat 
        : DEFAULT_CONFIG.outputFormat
    };
  } catch (error) {
    // If config file doesn't exist or is invalid, return defaults
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config) {
  try {
    const configPath = getConfigPath();
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config
    };
    writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
    return true;
  } catch (error) {
    log.error(`Failed to save config: ${error.message}`);
    return false;
  }
}

export {
  loadConfig,
  saveConfig,
  DEFAULT_CONFIG
};
