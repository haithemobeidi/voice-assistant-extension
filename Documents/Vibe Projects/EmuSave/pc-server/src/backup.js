/**
 * Backup Manager
 * Handles backup creation, listing, and restoration
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class BackupManager {
  constructor(backupFolder, maxBackups = 5) {
    this.backupFolder = backupFolder;
    this.maxBackups = maxBackups;

    // Ensure backup folder exists
    if (!fs.existsSync(this.backupFolder)) {
      fs.mkdirSync(this.backupFolder, { recursive: true });
    }
  }

  /**
   * Create a timestamped backup of a folder
   * @param {string} sourceFolder - Folder to backup
   * @returns {Promise<string>} - Path to created backup file
   */
  async createBackup(sourceFolder) {
    return new Promise((resolve, reject) => {
      // Generate timestamp-based filename
      const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
      const backupFileName = `saves_backup_${timestamp}.zip`;
      const backupPath = path.join(this.backupFolder, backupFileName);

      // Check if source folder exists
      if (!fs.existsSync(sourceFolder)) {
        return reject(new Error(`Source folder does not exist: ${sourceFolder}`));
      }

      // Create write stream for backup file
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`✓ Backup created: ${backupFileName} (${sizeMB} MB)`);

        // Clean up old backups
        this.cleanupOldBackups();

        resolve(backupPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      // Pipe archive to file
      archive.pipe(output);

      // Add folder contents to archive
      archive.directory(sourceFolder, false);

      // Finalize archive
      archive.finalize();
    });
  }

  /**
   * List all backups in backup folder
   * @returns {Array} - Array of backup info objects
   */
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupFolder);

      const backups = files
        .filter(file => file.startsWith('saves_backup_') && file.endsWith('.zip'))
        .map(file => {
          const filePath = path.join(this.backupFolder, file);
          const stats = fs.statSync(filePath);

          return {
            filename: file,
            path: filePath,
            timestamp: stats.mtime,
            size: stats.size
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

      return backups;
    } catch (error) {
      console.error('✗ Error listing backups:', error.message);
      return [];
    }
  }

  /**
   * Delete old backups, keeping only maxBackups most recent
   */
  cleanupOldBackups() {
    try {
      const backups = this.listBackups();

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);

        toDelete.forEach(backup => {
          fs.unlinkSync(backup.path);
          console.log(`✓ Deleted old backup: ${backup.filename}`);
        });
      }
    } catch (error) {
      console.error('✗ Error cleaning up backups:', error.message);
    }
  }

  /**
   * Restore from a specific backup
   * @param {string} backupFileName - Backup file to restore from
   * @param {string} targetFolder - Folder to restore to
   * @returns {Promise<void>}
   */
  async restoreBackup(backupFileName, targetFolder) {
    const unzipper = require('unzipper');

    return new Promise((resolve, reject) => {
      const backupPath = path.join(this.backupFolder, backupFileName);

      if (!fs.existsSync(backupPath)) {
        return reject(new Error(`Backup not found: ${backupFileName}`));
      }

      // Create target folder if it doesn't exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Extract backup
      fs.createReadStream(backupPath)
        .pipe(unzipper.Extract({ path: targetFolder }))
        .on('close', () => {
          console.log(`✓ Restored from backup: ${backupFileName}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  /**
   * Get backup folder path
   */
  getBackupFolder() {
    return this.backupFolder;
  }

  /**
   * Get count of available backups
   */
  getBackupCount() {
    return this.listBackups().length;
  }
}

module.exports = BackupManager;
