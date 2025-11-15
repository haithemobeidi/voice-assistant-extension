# EmuSave - Development Plan Outline

**Project Goal:** Simple, reliable emulator save sync between PC and Android devices

**Current Status:** Phase 1 In Progress - PC Server Complete
**Current Phase:** Phase 1 - MVP Development
**Last Updated:** November 14, 2025

---

## Project Overview

EmuSave is an emulator-agnostic save synchronization tool that lets users seamlessly transfer save data between their PC and Android device. Built for simplicity and reliability.

### Core Value Proposition
"Play on PC, continue on your phone, or vice versa - with one tap."

### Key Principles
1. **Emulator-Agnostic** - Works with any emulator
2. **Safety First** - Automatic backups before every sync
3. **Simple UX** - Minimal setup, clear actions
4. **LAN-First** - Fast, secure local sync (remote access later)
5. **Vibe-Codeable** - Achievable complexity for solo dev

---

## Development Phases

### Phase 1: MVP - Core Sync Functionality
**Status:** In Progress (PC Server Complete)
**Goal:** Prove the concept with working PC ↔ Android sync on LAN
**Target Duration:** 3-5 coding sessions

**Deliverables:**
- [x] PC server with HTTP sync endpoints ✅ COMPLETE
- [ ] Android app with folder picker and sync buttons
- [ ] Full folder zip/sync (bidirectional)
- [x] Automatic backups before sync ✅ COMPLETE
- [x] Works with any emulator's save folder ✅ COMPLETE
- [x] Manual IP-based connection ✅ COMPLETE

**Success Criteria:**
- User can pick save folder on PC
- User can pick save folder on Android
- Sync completes in under 10 seconds
- No data loss in testing
- Works with 3+ different emulators

**Phase File:** `plan/phase1.md` (detailed technical plan)

---

### Phase 2: Polish & Automation
**Status:** Not Started
**Goal:** Make it seamless with auto-sync and better UX
**Target Duration:** 4-6 coding sessions

**Planned Features:**
- [ ] File watching with auto-sync
- [ ] QR code pairing
- [ ] Better PC UI (Tauri wrapper)
- [ ] Polished Android UI
- [ ] Multiple save folder profiles
- [ ] Sync history/logs

**Success Criteria:**
- Auto-sync works reliably
- Setup takes under 3 minutes
- UI feels polished and modern

**Phase File:** `plan/phase2.md` (will be created when Phase 1 completes)

---

### Phase 3: Advanced Features
**Status:** Not Started
**Goal:** Power user features and expanded reach
**Target Duration:** TBD

**Planned Features:**
- [ ] Remote access (VPN or port forward)
- [ ] Conflict resolution UI
- [ ] iOS support (maybe)
- [ ] Cloud relay option (for commercialization)
- [ ] Emulator auto-detection

**Success Criteria:**
- Works outside home network
- Handles edge cases gracefully
- Production-ready quality

**Phase File:** `plan/phase3.md` (future)

---

## Technical Stack

### PC Server
- **Runtime:** Node.js (v18+)
- **Framework:** Express
- **UI (Phase 1):** System tray only
- **UI (Phase 2):** Tauri wrapper
- **Key Libraries:**
  - `express` - HTTP server
  - `archiver` - Zip creation
  - `unzipper` - Zip extraction
  - `chokidar` - File watching (Phase 2)
  - `node-systray` - System tray icon

### Android App
- **Language:** Kotlin
- **Min SDK:** API 26 (Android 8.0)
- **Target SDK:** API 34 (Android 14)
- **Key Libraries:**
  - `OkHttp` - HTTP client
  - `Gson` - JSON parsing
  - `Material Components` - UI
  - `Storage Access Framework` - File access

### Development Tools
- **Version Control:** Git
- **PC Dev:** VS Code
- **Android Dev:** Android Studio
- **Testing:** Manual testing with real emulators

---

## Architecture Overview

```
┌─────────────────┐           LAN/Wi-Fi          ┌──────────────────┐
│   PC Server     │◄────────────────────────────►│  Android App     │
│  (Node.js)      │      HTTP REST API           │   (Kotlin)       │
└─────────────────┘                               └──────────────────┘
        │                                                  │
        ▼                                                  ▼
┌─────────────────┐                               ┌──────────────────┐
│  PC Save Folder │                               │ Android Save Dir │
│  (any emulator) │                               │  (any emulator)  │
└─────────────────┘                               └──────────────────┘
        │                                                  │
        ▼                                                  ▼
┌─────────────────┐                               ┌──────────────────┐
│ Backup Folder   │                               │ Backup Folder    │
│ (timestamped)   │                               │  (timestamped)   │
└─────────────────┘                               └──────────────────┘
```

### Sync Flow (Phase 1)
```
User Action: "Download from PC"
1. Android requests save folder from PC
2. PC creates timestamped backup of Android folder
3. PC zips its save folder
4. PC sends zip to Android
5. Android backs up current saves
6. Android extracts zip
7. Show success message

User Action: "Upload to PC"
1. Android zips its save folder
2. PC backs up current saves
3. Android uploads zip to PC
4. PC extracts zip
5. Show success message
```

---

## Project Structure

### PC Server (`/pc-server/`)
```
pc-server/
├── package.json
├── package-lock.json
├── src/
│   ├── server.js          # Main server file
│   ├── config.js          # Configuration management
│   ├── sync.js            # Sync logic
│   ├── backup.js          # Backup management
│   └── tray.js            # System tray UI
├── backups/               # Timestamped backups
└── README.md
```

### Android App (`/android-app/`)
```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/emusave/
│   │   │   ├── MainActivity.kt
│   │   │   ├── SyncService.kt
│   │   │   ├── BackupManager.kt
│   │   │   └── StorageHelper.kt
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml
│   │   │   └── values/
│   │   │       └── strings.xml
│   │   └── AndroidManifest.xml
│   └── build.gradle
└── build.gradle
```

---

## Risk Mitigation

### Technical Risks

**Risk:** Android Storage Access Framework complexity
- **Mitigation:** Use DocumentFile API, test on multiple devices
- **Fallback:** Require specific folder location (less flexible but simpler)

**Risk:** Network connectivity issues
- **Mitigation:** Clear error messages, retry logic, timeout handling
- **Testing:** Test on different routers, networks, interference scenarios

**Risk:** Data corruption during sync
- **Mitigation:** Mandatory backups, atomic file operations, verify zip integrity
- **Testing:** Kill processes mid-sync, corrupt zip files intentionally

### User Experience Risks

**Risk:** User doesn't know their PC's IP address
- **Mitigation:** PC app displays IP prominently, provide network troubleshooting guide
- **Future:** Add network discovery in Phase 2

**Risk:** User picks wrong folder
- **Mitigation:** Show folder contents preview, confirm before first sync
- **Validation:** Check for emulator-like files (.sav, .state, etc.)

**Risk:** Large save folders (100MB+)
- **Mitigation:** Show progress bar, compress well, warn if >100MB
- **Testing:** Test with large save folders (RPG games with lots of saves)

---

## Success Metrics

### Phase 1 Completion Criteria
- [ ] PC server runs without errors for 1 hour
- [ ] Android app syncs successfully 10 times in a row
- [ ] Tested with 3+ different emulators
- [ ] Zero data loss in 50+ sync operations
- [ ] User can complete full setup in under 5 minutes
- [ ] Backups are created and can be restored
- [ ] Clear error messages for all failure scenarios

### User Satisfaction Indicators
- User continues using it after initial test
- User recommends it to others
- User trusts it with valuable save data
- User finds it easier than manual file copying

---

## Future Considerations (Post-Phase 3)

### Commercialization Potential
- Free tier: LAN sync only
- Pro tier ($2.99 one-time): Remote access, cloud relay
- Business model: Simple, one-time purchase, no subscriptions

### Open Source Strategy
- Consider open-sourcing after Phase 2
- Build community, get contributors
- Monetize through support/hosting if needed

### Platform Expansion
- iOS app (if demand exists)
- Linux PC support (should work already with Node.js)
- macOS support (same)
- Steam Deck support (runs Linux, should work)

---

## Current Focus

**Active Phase:** Phase 1 (MVP Development)
**Next Milestone:** Complete Android app
**Blocking Issues:** None
**PC Server:** ✅ Complete and tested
**Android App:** ⏳ Not started

---

**Last Updated:** November 14, 2025
**Next Review:** After Phase 1 completion
