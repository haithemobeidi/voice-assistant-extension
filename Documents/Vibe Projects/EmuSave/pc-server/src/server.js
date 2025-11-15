/**
 * EmuSave Server
 * Main Express server handling sync operations
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const config = require('./config');
const BackupManager = require('./backup');
const SyncManager = require('./sync');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests from Android app
app.use(express.json());

// Initialize backup manager
let backupManager;

/**
 * Initialize server and validate configuration
 */
function initializeServer() {
  const validation = config.validate();

  if (!validation.valid) {
    console.error('\n❌ Server Configuration Errors:');
    validation.errors.forEach(err => console.error('  -', err));
    console.log('\n📝 Please edit config.json and set your save folder path\n');
    process.exit(1);
  }

  // Initialize backup manager
  backupManager = new BackupManager(
    config.get('backupFolder'),
    config.get('maxBackups')
  );

  console.log('\n✅ EmuSave Server Initialized');
  console.log('📁 Save folder:', config.get('saveFolder'));
  console.log('💾 Backup folder:', config.get('backupFolder'));
  console.log('📊 Max backups:', config.get('maxBackups'));
  console.log('');
}

/**
 * Get local network IP address
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * GET /status
 * Returns server status and configuration info
 */
app.get('/status', (req, res) => {
  const saveFolder = config.get('saveFolder');
  const folderSize = SyncManager.getFolderSize(saveFolder);
  const backups = backupManager.listBackups();

  res.json({
    status: 'running',
    version: '0.1.0',
    saveFolder: saveFolder,
    saveFolderSize: SyncManager.formatSize(folderSize),
    lastSync: backups.length > 0 ? backups[0].timestamp : null,
    backupCount: backups.length,
    serverTime: new Date().toISOString()
  });
});

/**
 * GET /download
 * Downloads the save folder as a zip file
 * Android will call this to download PC saves
 */
app.get('/download', async (req, res) => {
  try {
    const saveFolder = config.get('saveFolder');

    console.log('📤 Download request received');
    console.log('  Zipping folder:', saveFolder);

    // Zip and stream the save folder
    await SyncManager.zipFolder(saveFolder, res);

    console.log('✓ Download completed');
  } catch (error) {
    console.error('✗ Download failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /upload
 * Receives a zip file from Android and extracts it to save folder
 * Creates backup before overwriting
 */
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('savefile'), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  try {
    const saveFolder = config.get('saveFolder');

    console.log('📥 Upload request received');
    console.log('  File size:', SyncManager.formatSize(uploadedFile.size));

    // Validate zip file
    const isValid = await SyncManager.validateZip(uploadedFile.path);
    if (!isValid) {
      fs.unlinkSync(uploadedFile.path); // Clean up invalid file
      throw new Error('Invalid or corrupted zip file');
    }

    // Create backup before overwriting
    console.log('  Creating backup...');
    const backupPath = await backupManager.createBackup(saveFolder);

    // Extract uploaded zip to save folder
    console.log('  Extracting saves...');
    await SyncManager.unzipToFolder(uploadedFile.path, saveFolder);

    // Clean up uploaded file
    fs.unlinkSync(uploadedFile.path);

    console.log('✓ Upload completed successfully');

    res.json({
      success: true,
      message: 'Saves uploaded successfully',
      backupCreated: path.basename(backupPath)
    });
  } catch (error) {
    console.error('✗ Upload failed:', error.message);

    // Clean up uploaded file if it exists
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /backups
 * Lists all available backups
 */
app.get('/backups', (req, res) => {
  try {
    const backups = backupManager.listBackups();

    res.json({
      backups: backups.map(b => ({
        filename: b.filename,
        timestamp: b.timestamp,
        size: b.size,
        sizeFormatted: SyncManager.formatSize(b.size)
      }))
    });
  } catch (error) {
    console.error('✗ Error listing backups:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /restore
 * Restores save folder from a specific backup
 */
app.post('/restore', async (req, res) => {
  try {
    const { backup } = req.body;

    if (!backup) {
      return res.status(400).json({
        success: false,
        error: 'Backup filename required'
      });
    }

    console.log('🔄 Restore request received');
    console.log('  Backup file:', backup);

    const saveFolder = config.get('saveFolder');

    // Restore from backup
    await backupManager.restoreBackup(backup, saveFolder);

    console.log('✓ Restore completed successfully');

    res.json({
      success: true,
      message: `Restored from ${backup}`
    });
  } catch (error) {
    console.error('✗ Restore failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /health
 * Simple health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize and start server
try {
  initializeServer();

  const PORT = config.get('port');
  const HOST = config.get('host');

  app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 EmuSave Server Running');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Local:   http://localhost:${PORT}`);
    console.log(`📍 Network: http://${localIP}:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('👉 Use this address in your Android app:');
    console.log(`   ${localIP}:${PORT}`);
    console.log('');
    console.log('📝 Press Ctrl+C to stop the server');
    console.log('');
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down EmuSave server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down EmuSave server...');
  process.exit(0);
});
