/**
 * Configuration Manager
 * Handles loading and saving server configuration
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config.json');
const DEFAULT_CONFIG = {
  saveFolder: '',
  backupFolder: path.join(__dirname, '..', 'backups'),
  maxBackups: 5,
  port: 5050,
  host: '0.0.0.0'
};

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file, or create default if not exists
   */
  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        const config = JSON.parse(data);
        console.log('✓ Configuration loaded from config.json');
        return { ...DEFAULT_CONFIG, ...config };
      } else {
        console.log('⚠ No config.json found, creating default configuration');
        this.saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
    } catch (error) {
      console.error('✗ Error loading config:', error.message);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Save configuration to file
   */
  saveConfig(config = this.config) {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
      this.config = config;
      console.log('✓ Configuration saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving config:', error.message);
      return false;
    }
  }

  /**
   * Get configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Set configuration value and save
   */
  set(key, value) {
    this.config[key] = value;
    return this.saveConfig();
  }

  /**
   * Validate configuration (check if save folder exists)
   */
  validate() {
    const errors = [];

    if (!this.config.saveFolder) {
      errors.push('Save folder not configured. Please set saveFolder in config.json');
    } else if (!fs.existsSync(this.config.saveFolder)) {
      errors.push(`Save folder does not exist: ${this.config.saveFolder}`);
    }

    // Create backup folder if it doesn't exist
    if (!fs.existsSync(this.config.backupFolder)) {
      try {
        fs.mkdirSync(this.config.backupFolder, { recursive: true });
        console.log('✓ Created backup folder:', this.config.backupFolder);
      } catch (error) {
        errors.push(`Cannot create backup folder: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }
}

module.exports = new ConfigManager();
