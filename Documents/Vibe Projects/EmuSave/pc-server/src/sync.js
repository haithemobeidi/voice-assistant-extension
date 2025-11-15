/**
 * Sync Operations
 * Handles zipping and unzipping of save folders
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');

class SyncManager {
  /**
   * Zip a folder and return as stream or save to file
   * @param {string} folderPath - Folder to zip
   * @param {object} res - Express response object (optional, for streaming)
   * @param {string} outputPath - Output file path (optional, for saving to file)
   * @returns {Promise<void>}
   */
  static async zipFolder(folderPath, res = null, outputPath = null) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(folderPath)) {
        return reject(new Error(`Folder not found: ${folderPath}`));
      }

      const archive = archiver('zip', { zlib: { level: 9 } });

      if (res) {
        // Stream to HTTP response
        res.attachment('saves.zip');
        archive.pipe(res);
      } else if (outputPath) {
        // Save to file
        const output = fs.createWriteStream(outputPath);
        archive.pipe(output);
      } else {
        return reject(new Error('Either res or outputPath must be provided'));
      }

      archive.on('error', (err) => {
        console.error('✗ Error creating zip:', err.message);
        reject(err);
      });

      archive.on('end', () => {
        console.log('✓ Zip created successfully');
        resolve();
      });

      // Add folder contents
      archive.directory(folderPath, false);

      // Finalize
      archive.finalize();
    });
  }

  /**
   * Unzip a file to a folder
   * @param {string} zipPath - Path to zip file
   * @param {string} targetFolder - Folder to extract to
   * @returns {Promise<void>}
   */
  static async unzipToFolder(zipPath, targetFolder) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(zipPath)) {
        return reject(new Error(`Zip file not found: ${zipPath}`));
      }

      // Create target folder if it doesn't exist
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      // Extract zip
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: targetFolder }))
        .on('close', () => {
          console.log('✓ Zip extracted successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('✗ Error extracting zip:', err.message);
          reject(err);
        });
    });
  }

  /**
   * Validate that a zip file is valid
   * @param {string} zipPath - Path to zip file
   * @returns {Promise<boolean>}
   */
  static async validateZip(zipPath) {
    return new Promise((resolve) => {
      try {
        fs.createReadStream(zipPath)
          .pipe(unzipper.Parse())
          .on('entry', (entry) => entry.autodrain())
          .on('finish', () => resolve(true))
          .on('error', () => resolve(false));
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Get folder size in bytes
   * @param {string} folderPath - Folder to measure
   * @returns {number} - Size in bytes
   */
  static getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(currentPath) {
      try {
        const stats = fs.statSync(currentPath);

        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          const files = fs.readdirSync(currentPath);
          files.forEach(file => {
            calculateSize(path.join(currentPath, file));
          });
        }
      } catch (error) {
        console.error(`Error reading ${currentPath}:`, error.message);
      }
    }

    calculateSize(folderPath);
    return totalSize;
  }

  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size string
   */
  static formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}

module.exports = SyncManager;
