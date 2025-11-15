# EmuSave PC Server

The PC server component of EmuSave - handles syncing emulator save data with Android devices over LAN.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Save Folder

Edit `config.json` and set your emulator's save folder path:

```json
{
  "saveFolder": "C:/Users/YourName/AppData/Roaming/Citra/sdmc",
  "backupFolder": "./backups",
  "maxBackups": 5,
  "port": 5050,
  "host": "0.0.0.0"
}
```

**Example save folder paths:**
- **Citra (3DS):** `C:/Users/YourName/AppData/Roaming/Citra/sdmc`
- **RetroArch:** `C:/RetroArch/saves`
- **PPSSPP:** `C:/Users/YourName/Documents/PPSSPP/PSP/SAVEDATA`
- **DuckStation:** `C:/Users/YourName/Documents/DuckStation/memcards`

### 3. Start Server

```bash
npm start
```

You'll see output like:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 EmuSave Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local:   http://localhost:5050
📍 Network: http://192.168.1.10:5050
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👉 Use this address in your Android app:
   192.168.1.10:5050
```

Copy the network address (`192.168.1.10:5050` in this example) - you'll need it for the Android app.

## API Endpoints

### `GET /status`
Get server status and save folder info.

**Response:**
```json
{
  "status": "running",
  "version": "0.1.0",
  "saveFolder": "/path/to/saves",
  "saveFolderSize": "12.3 MB",
  "lastSync": "2025-11-14T18:30:45Z",
  "backupCount": 3
}
```

### `GET /download`
Download the save folder as a zip file.

### `POST /upload`
Upload a zip file to replace the save folder.

**Request:** Multipart form with `savefile` field

**Response:**
```json
{
  "success": true,
  "message": "Saves uploaded successfully",
  "backupCreated": "saves_backup_2025-11-14_18-30-45.zip"
}
```

### `GET /backups`
List all available backups.

### `POST /restore`
Restore from a specific backup.

**Request:**
```json
{
  "backup": "saves_backup_2025-11-14_18-30-45.zip"
}
```

## Configuration

**config.json options:**

- `saveFolder` - Path to your emulator's save folder (required)
- `backupFolder` - Where to store backups (default: `./backups`)
- `maxBackups` - How many backups to keep (default: 5)
- `port` - Server port (default: 5050)
- `host` - Server host (default: `0.0.0.0` for LAN access)

## Backups

The server automatically creates a backup **before every sync operation**. This ensures your saves are never lost.

Backups are stored in the `backups/` folder with timestamped filenames:
- `saves_backup_2025-11-14_18-30-45.zip`

The server keeps the 5 most recent backups by default and automatically deletes older ones.

## Testing

You can test the server using `curl`:

```bash
# Check status
curl http://localhost:5050/status

# Download saves
curl http://localhost:5050/download -o saves.zip

# Upload saves
curl -F "savefile=@saves.zip" http://localhost:5050/upload

# List backups
curl http://localhost:5050/backups
```

## Troubleshooting

**"Save folder not configured" error:**
- Edit `config.json` and set the `saveFolder` path

**"Folder does not exist" error:**
- Verify the path in `config.json` is correct
- Make sure the emulator has created the folder (run the emulator once)

**Android can't connect:**
- Make sure both PC and Android are on the same Wi-Fi network
- Check that no firewall is blocking port 5050
- Verify the IP address is correct (it may change when you reconnect to Wi-Fi)

**Sync fails mid-transfer:**
- Restore from the most recent backup using the `/restore` endpoint
- Check network stability

## Security Notes

**Phase 1 (Current):**
- Server runs on LAN only (no internet access)
- No authentication (trusted network only)
- Do not expose to the internet without additional security

**Future (Phase 2):**
- Optional authentication for remote access
- HTTPS support
- VPN recommendation for remote sync

## Development

**Watch mode** (auto-restart on file changes):
```bash
npm run dev
```

**Project structure:**
```
pc-server/
├── src/
│   ├── server.js     # Main Express server
│   ├── config.js     # Configuration management
│   ├── backup.js     # Backup operations
│   └── sync.js       # Zip/unzip operations
├── backups/          # Automatic backups stored here
├── uploads/          # Temporary upload storage
├── config.json       # Your configuration
└── package.json
```

## License

MIT
