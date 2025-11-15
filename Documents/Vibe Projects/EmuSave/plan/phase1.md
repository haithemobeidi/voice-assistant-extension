# Phase 1: MVP - Core Sync Functionality

**Status:** Not Started
**Goal:** Build working bidirectional sync between PC and Android on LAN
**Estimated Duration:** 3-5 coding sessions (~10-15 hours)
**Target Completion:** TBD

---

## Overview

Phase 1 delivers the **minimum viable product** - a simple but reliable way to sync emulator saves between PC and Android. Focus is on **proving the concept** with minimal complexity.

### What We're Building

**PC Side:**
- Node.js HTTP server running on localhost
- System tray icon with basic controls
- Endpoints to upload/download save folders
- Automatic backup creation

**Android Side:**
- Single-screen app
- Folder picker for save directory
- Upload/Download buttons
- Automatic backup creation

### What We're NOT Building (Yet)
- ❌ Auto-sync (manual buttons only)
- ❌ QR pairing (manual IP entry)
- ❌ Multiple save folders (one at a time)
- ❌ Fancy UI (functional only)
- ❌ Remote access (LAN only)

---

## Technical Specifications

### PC Server API Endpoints

#### `GET /status`
Returns server status and configuration.

**Response:**
```json
{
  "status": "running",
  "version": "0.1.0",
  "saveFolder": "/path/to/saves",
  "lastSync": "2025-11-14T18:30:45Z",
  "backupCount": 3
}
```

#### `GET /download`
Downloads the current save folder as a zip.

**Response:**
- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename=saves.zip`
- Binary zip data

**Process:**
1. Create timestamped backup of current folder
2. Zip the save folder
3. Stream zip to client
4. Clean up temp files

#### `POST /upload`
Receives a zip file and replaces the save folder.

**Request:**
- `Content-Type: multipart/form-data`
- Field: `savefile` (zip file)

**Process:**
1. Create timestamped backup of current folder
2. Receive and validate zip
3. Extract to save folder (overwrite existing)
4. Return success/failure

**Response:**
```json
{
  "success": true,
  "message": "Saves uploaded successfully",
  "backupCreated": "saves_backup_2025-11-14_18-30-45.zip"
}
```

#### `GET /backups`
Lists available backups.

**Response:**
```json
{
  "backups": [
    {
      "filename": "saves_backup_2025-11-14_18-30-45.zip",
      "timestamp": "2025-11-14T18:30:45Z",
      "size": 1024576
    }
  ]
}
```

#### `POST /restore`
Restores from a specific backup.

**Request:**
```json
{
  "backup": "saves_backup_2025-11-14_18-30-45.zip"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restored from backup successfully"
}
```

---

### PC Server Configuration

**config.json:**
```json
{
  "saveFolder": "/path/to/emulator/saves",
  "backupFolder": "./backups",
  "maxBackups": 5,
  "port": 5050,
  "host": "0.0.0.0"
}
```

**Auto-generated on first run if not exists.**

---

### PC Server File Structure

```
pc-server/
├── package.json
├── package-lock.json
├── config.json               # User configuration
├── src/
│   ├── server.js             # Main Express server (200 lines)
│   ├── config.js             # Config management (50 lines)
│   ├── sync.js               # Zip/unzip operations (150 lines)
│   ├── backup.js             # Backup management (100 lines)
│   └── tray.js               # System tray UI (100 lines)
├── backups/                  # Timestamped backups
│   └── saves_backup_*.zip
└── README.md
```

---

### Android App Architecture

#### Main Activity (MainActivity.kt)

**UI Components:**
- EditText: PC server IP address (saved in SharedPreferences)
- Button: "Choose Save Folder" → DocumentFile picker
- TextView: Current folder path display
- Button: "Download from PC" (↓)
- Button: "Upload to PC" (↑)
- TextView: Status message / last sync time
- Button: "View Backups" (opens BackupActivity)

**Core Functions:**
```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var serverUrl: String
    private lateinit var saveFolderUri: Uri

    fun chooseSaveFolder() {
        // Launch Storage Access Framework picker
        // Save URI to SharedPreferences
    }

    suspend fun downloadFromPC() {
        // 1. Create backup of current saves
        // 2. GET /download from server
        // 3. Extract zip to save folder
        // 4. Show success/error message
    }

    suspend fun uploadToPC() {
        // 1. Zip save folder
        // 2. POST /upload to server
        // 3. Show success/error message
    }

    fun showBackups() {
        // Open BackupActivity
    }
}
```

#### Sync Service (SyncService.kt)

Handles HTTP communication with PC server.

```kotlin
class SyncService(private val serverUrl: String) {

    suspend fun downloadSaves(): ByteArray {
        // GET request to /download
        // Return zip file bytes
    }

    suspend fun uploadSaves(zipFile: File): Boolean {
        // POST request to /upload
        // Multipart file upload
        // Return success/failure
    }

    suspend fun getBackupList(): List<Backup> {
        // GET request to /backups
        // Parse JSON response
    }

    suspend fun checkConnection(): Boolean {
        // GET request to /status
        // Return true if reachable
    }
}
```

#### Backup Manager (BackupManager.kt)

Handles local backup creation and restoration on Android.

```kotlin
class BackupManager(private val context: Context) {

    fun createBackup(saveFolderUri: Uri): Uri? {
        // 1. Zip save folder
        // 2. Save to app's private storage
        // 3. Return backup URI
    }

    fun listBackups(): List<Backup> {
        // List backups in app's private storage
    }

    fun restoreBackup(backupUri: Uri, targetUri: Uri): Boolean {
        // Extract backup zip to target folder
    }

    fun deleteOldBackups(keepCount: Int) {
        // Keep only N most recent backups
    }
}
```

#### Storage Helper (StorageHelper.kt)

Handles DocumentFile operations and zip/unzip.

```kotlin
object StorageHelper {

    fun zipFolder(folderUri: Uri, context: Context): File {
        // Recursively zip folder using DocumentFile
        // Return temporary zip file
    }

    fun unzipToFolder(zipFile: File, targetUri: Uri, context: Context) {
        // Extract zip to DocumentFile tree
        // Overwrite existing files
    }

    fun validateSaveFolder(uri: Uri): Boolean {
        // Check if folder looks like emulator saves
        // Look for .sav, .state, or similar files
    }
}
```

---

### Android App File Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/emusave/
│   │   │   ├── MainActivity.kt           (250 lines)
│   │   │   ├── BackupActivity.kt         (150 lines)
│   │   │   ├── SyncService.kt            (200 lines)
│   │   │   ├── BackupManager.kt          (150 lines)
│   │   │   ├── StorageHelper.kt          (200 lines)
│   │   │   └── models/
│   │   │       └── Backup.kt             (30 lines)
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_main.xml
│   │   │   │   └── activity_backup.xml
│   │   │   ├── values/
│   │   │   │   ├── strings.xml
│   │   │   │   ├── colors.xml
│   │   │   │   └── themes.xml
│   │   │   └── drawable/
│   │   │       └── ic_launcher.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/
└── build.gradle.kts
```

---

## Development Roadmap

### Session 1: PC Server Foundation
**Goal:** Working HTTP server with basic endpoints

**Tasks:**
- [ ] Initialize Node.js project
- [ ] Install dependencies (express, archiver, unzipper)
- [ ] Implement /status endpoint
- [ ] Implement /download endpoint (zip and send)
- [ ] Test with Postman/curl
- [ ] Add basic error handling

**Deliverable:** Server that can zip and download a folder

---

### Session 2: PC Server Upload & Backup
**Goal:** Complete bidirectional sync and backups

**Tasks:**
- [ ] Implement /upload endpoint (receive and extract)
- [ ] Implement backup creation before overwrites
- [ ] Implement /backups endpoint (list backups)
- [ ] Implement /restore endpoint
- [ ] Test full upload/download cycle
- [ ] Add config.json management

**Deliverable:** Fully functional server with backups

---

### Session 3: PC System Tray
**Goal:** User-friendly PC interface

**Tasks:**
- [ ] Add node-systray dependency
- [ ] Create tray icon and menu
- [ ] Add "Start Server" / "Stop Server"
- [ ] Display server IP and port in menu
- [ ] Add "Open Save Folder" action
- [ ] Add "Quit" action

**Deliverable:** PC app with system tray interface

---

### Session 4: Android App Foundation
**Goal:** Basic Android app with folder picker

**Tasks:**
- [ ] Create new Android Studio project
- [ ] Design main activity layout
- [ ] Implement Storage Access Framework picker
- [ ] Save/load server URL and folder URI
- [ ] Create SyncService skeleton
- [ ] Add OkHttp dependency

**Deliverable:** Android app that can pick folder and save settings

---

### Session 5: Android Sync Implementation
**Goal:** Working download/upload from Android

**Tasks:**
- [ ] Implement SyncService.downloadSaves()
- [ ] Implement SyncService.uploadSaves()
- [ ] Implement StorageHelper zip/unzip
- [ ] Connect UI buttons to sync functions
- [ ] Add progress indicators
- [ ] Add error handling and user feedback

**Deliverable:** Fully functional Android app

---

### Session 6: Android Backup & Polish
**Goal:** Complete Android app with backups

**Tasks:**
- [ ] Implement BackupManager
- [ ] Create BackupActivity UI
- [ ] Add backup before sync
- [ ] Add restore from backup
- [ ] Polish error messages
- [ ] Add network timeout handling
- [ ] Final testing

**Deliverable:** Complete Phase 1 MVP

---

## Testing Strategy

### Unit Testing
**Priority:** Low for Phase 1 (manual testing sufficient)

Focus on manual testing with real scenarios.

### Integration Testing
**Test Scenarios:**

**Happy Path:**
1. ✅ PC server starts successfully
2. ✅ Android connects to server
3. ✅ Download from PC works
4. ✅ Upload to PC works
5. ✅ Backups are created
6. ✅ Restore from backup works

**Error Scenarios:**
1. ⚠️ Android tries to connect when PC server is off
2. ⚠️ Network disconnects mid-transfer
3. ⚠️ User picks an empty folder
4. ⚠️ User picks a folder with non-save files
5. ⚠️ Disk full during zip extraction
6. ⚠️ Corrupted zip file

**Edge Cases:**
1. Large save folders (100MB+)
2. Folders with special characters in filenames
3. Folders with thousands of small files
4. Simultaneous sync attempts
5. Rapid successive syncs

### Real-World Testing
**Test with actual emulators:**
- Citra (3DS) - Complex folder structure
- RetroArch - Multiple cores/systems
- DuckStation (PS1) - Memory cards + save states
- PPSSPP (PSP) - Various save types

---

## User Documentation

### PC Setup Guide
```markdown
# EmuSave PC Setup

1. Download and extract EmuSave-PC.zip
2. Run `npm install`
3. Run `npm start`
4. Right-click the tray icon
5. Select "Set Save Folder" and choose your emulator's save directory
6. Note the IP address shown in the menu (e.g., 192.168.1.10:5050)

Your PC is now ready to sync!
```

### Android Setup Guide
```markdown
# EmuSave Android Setup

1. Install EmuSave.apk on your Android device
2. Open the app
3. Enter your PC's IP address (shown in PC tray menu)
4. Tap "Choose Save Folder"
5. Navigate to your emulator's save folder
6. Grant storage permission

You're ready to sync!
```

### Usage Guide
```markdown
# How to Sync

**From PC to Android:**
1. Make sure PC server is running
2. On Android, tap "Download from PC"
3. Wait for sync to complete
4. Your Android saves are now updated!

**From Android to PC:**
1. Make sure PC server is running
2. On Android, tap "Upload to PC"
3. Wait for sync to complete
4. Your PC saves are now updated!

**Restore from Backup:**
1. Tap "View Backups"
2. Select the backup you want to restore
3. Confirm restoration
```

---

## Success Criteria

### Technical Metrics
- [ ] PC server uptime > 99% for 1-hour test
- [ ] Sync completes in < 10 seconds for typical saves (<50MB)
- [ ] Zero data loss in 50 consecutive syncs
- [ ] Backups successfully created for 100% of syncs
- [ ] Successful restore from backup in 100% of attempts

### User Experience Metrics
- [ ] Setup time < 5 minutes for new user
- [ ] Sync operation requires < 3 taps
- [ ] Error messages are clear and actionable
- [ ] Works with 3+ different emulators without modification

### Code Quality Metrics
- [ ] No console errors during normal operation
- [ ] All HTTP endpoints return proper status codes
- [ ] Android app doesn't crash during testing
- [ ] Configuration persists between restarts

---

## Known Limitations (Phase 1)

**Acknowledged trade-offs for MVP:**
1. Manual sync only (not automatic)
2. Manual IP entry (no QR code or discovery)
3. Single save folder per device
4. LAN only (no remote access)
5. No conflict detection (last sync wins)
6. Basic UI (functional, not polished)
7. No sync history/logs
8. No multi-device support (1 PC ↔ 1 Android)

**These are intentional** to keep Phase 1 scope manageable.

---

## Risks & Mitigation

### High-Priority Risks

**Risk 1: Storage Access Framework complexity**
- **Impact:** High - can't access files without it
- **Likelihood:** Medium
- **Mitigation:** Research SAF thoroughly, test on multiple devices
- **Contingency:** Require user to use a specific accessible folder

**Risk 2: Network reliability issues**
- **Impact:** Medium - sync fails but no data loss
- **Likelihood:** Medium
- **Mitigation:** Implement retries, timeouts, clear error messages
- **Contingency:** User retries manually

**Risk 3: Data corruption during transfer**
- **Impact:** High - could lose save data
- **Likelihood:** Low
- **Mitigation:** Atomic operations, backups, zip integrity checks
- **Contingency:** Restore from backup

---

## Phase 1 Completion Checklist

### PC Server
- [ ] All endpoints implemented and tested
- [ ] Backup creation works reliably
- [ ] Config persistence works
- [ ] System tray interface functional
- [ ] Runs on Windows/Mac/Linux
- [ ] Error handling for all edge cases

### Android App
- [ ] Folder picker works on Android 8+
- [ ] Download sync works reliably
- [ ] Upload sync works reliably
- [ ] Backup creation works
- [ ] Backup restoration works
- [ ] UI is clear and functional
- [ ] Error messages are helpful

### Testing
- [ ] Tested with 3+ emulators
- [ ] Tested with small saves (<1MB)
- [ ] Tested with large saves (50MB+)
- [ ] Tested network disconnect scenarios
- [ ] Tested rapid successive syncs
- [ ] No data loss in any test

### Documentation
- [ ] README.md completed
- [ ] Setup guides written
- [ ] Usage guide written
- [ ] Troubleshooting guide started

---

## Next Steps After Phase 1

Once Phase 1 is complete and tested:

1. **User Testing** - Let real users try it
2. **Gather Feedback** - What works? What doesn't?
3. **Prioritize Phase 2** - Which features matter most?
4. **Plan Phase 2** - Auto-sync, QR pairing, or UI polish?

---

**Status:** Ready to begin implementation
**Blocking Issues:** None
**Awaiting:** User approval to start development

---

*Last Updated: November 14, 2025*
