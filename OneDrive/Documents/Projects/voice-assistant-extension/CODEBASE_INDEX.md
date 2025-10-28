# Codebase Index - Voice Assistant Browser Automation

**Last Updated**: 2025-10-28 (Phase 4 Complete - Full Pipeline Working)

## Project Structure Overview

This project uses a **hybrid dual-component architecture**:
- `/app` - Desktop application (Electron) for voice processing and system mic access
- `/extension` - Chrome extension (Manifest V3) for browser automation and DOM manipulation
- **Communication**: Native messaging bridge using Chrome's native messaging protocol

## Root Files

### Documentation & Configuration
- **CLAUDE.md** - Claude session protocols and project guidelines
- **README.md** - Project overview and getting started
- **CODEBASE_INDEX.md** - This file, catalog of all project files
- **RESEARCH_REPORT.md** - Initial research on voice control solutions and architecture options
- **/handoff/** - Session handoff documents for continuity
- **/logs/** - Electron app runtime logs

### Handoff Tracking
- **/handoff/MASTER_HANDOFF_INDEX.md** - Index of all development sessions

---

## Desktop Application (`/app`)

### Core Application Files
- **package.json** - NPM dependencies (electron ^28.0.0)
- **main.js** - Electron main process, window management, IPC handlers
- **index.html** - Application UI with mic test and manual command button
- **renderer.js** - Renderer process handling mic access, audio visualization, speech recognition (with network issues)

### Native Messaging Bridge
- **native-host.js** - Native messaging host implementing Chrome's stdio protocol
  - Reads from Chrome via stdin (4-byte length prefix + JSON)
  - Writes to Chrome via stdout
  - Polls for commands from Electron app via file system
  - Logs to `/app/logs/native-host.log`
- **native-host.bat** - Windows batch script to launch native-host.js
- **com.voiceassistant.host.json** - Native messaging manifest for Chrome
  - Registered extension ID: `lbcnhpobdoecbgaackpmkkhbidjefmpp`
  - Points to native-host.bat
- **register-native-host.bat** - Windows registry setup script
  - Registers manifest in `HKCU\Software\Google\Chrome\NativeMessagingHosts`

### Logs
- **/app/logs/** - Runtime logs directory
  - `native-host.log` - Native messaging host activity log
  - `pending-command.json` - Temporary file for Electron → Native host communication

---

## Chrome Extension (`/extension`)

### Core Extension Files
- **manifest.json** - Manifest V3 configuration
  - Permissions: `activeTab`, `scripting`, `nativeMessaging`
  - Host permissions: `<all_urls>` (universal site access)
  - Service worker: background.js
  - Content scripts: content.js (runs on all pages)
- **background.js** - Service worker handling native messaging connection
  - Connects to `com.voiceassistant.host`
  - Routes messages between native host and content scripts
  - Error handling for connection failures
- **content.js** - Content script injected into all web pages
  - Handles click commands
  - Smart element finder (buttons, links, ARIA buttons)
  - Visual feedback (green border + scroll into view)
- **popup.html** - Extension popup UI (simple status display)
- **popup.js** - Popup script with test button
- **icon.png** - Placeholder extension icon (1x1 transparent PNG)

### Extension ID
- **lbcnhpobdoecbgaackpmkkhbidjefmpp** (registered in native messaging manifest)

---

## Development Phases

### Phase 0: Initial Setup ✅
- [x] Create project structure
- [x] Set up documentation and protocols
- [x] Establish handoff system
- [x] Copy end session protocol from howufeel extension

### Phase 1: Desktop App - Basic Mic Access ✅
- [x] Choose framework: **Electron** (powerful PC, familiar ecosystem)
- [x] Create minimal app skeleton (main.js, index.html, renderer.js)
- [x] Implement system microphone access via Web Audio API
- [x] Test mic input capture with visual feedback (volume numbers, green indicator)
- [x] Audio visualization working (real-time volume display)

### Phase 2: Chrome Extension - Basic Structure ✅
- [x] Create Manifest V3 extension with all required files
- [x] Set up native messaging host manifest and registry
- [x] Test extension installation (loads on all pages)
- [x] Content script logging confirmed working

### Phase 3: Native Messaging Bridge ✅
- [x] Implement native-host.js with Chrome's stdio protocol
- [x] Register native messaging manifest in Windows registry
- [x] Test bidirectional communication (extension ↔ native host)
- [x] Connection confirmed: No errors, clean logs

### Phase 4: Voice Command Processing ✅ (Partial)
- [x] Manual command button for testing pipeline
- [x] Electron → Native host → Chrome → DOM click working
- [x] Content script successfully clicks elements
- [ ] **BLOCKED**: Speech recognition has network errors in Electron
  - Web Speech API requires Google servers
  - Need offline STT solution (Vosk/Whisper) or alternative approach

### Phase 5: Browser Automation ✅
- [x] Implement smart element finder in content.js
- [x] Supports: `button`, `a[href]`, `[role="button"]`, `input[type="button"]`, `input[type="submit"]`
- [x] Visual feedback: Green border + scroll into view
- [x] Test clicking elements by command: **WORKING** ✅
- [x] Successfully clicked search button on Engadget.com

### Phase 6: Advanced Features (Pending)
- [ ] Text-to-speech for reading content
- [ ] Macro system for common responses
- [ ] Dictation mode for text input
- [ ] Natural language element matching ("click on Mary Sue conversation")

---

## Technical Architecture

### Communication Flow
```
User speaks → Electron app (mic) → Speech Recognition
                                        ↓
                                  Parse command
                                        ↓
                        IPC → Write to pending-command.json
                                        ↓
                          Native host polls file (100ms)
                                        ↓
                          Read JSON → Send via stdout
                                        ↓
                        Chrome native messaging port
                                        ↓
                          Background service worker
                                        ↓
                          Query active tab → Send message
                                        ↓
                          Content script receives command
                                        ↓
                          Find element → Add visual feedback
                                        ↓
                              Click element ✅
```

### File-based IPC (Electron → Native Host)
- Electron writes: `/app/logs/pending-command.json`
- Native host polls every 100ms
- Deletes file after reading
- Simple, reliable, no process management needed

### Native Messaging Protocol
- Chrome sends: 4-byte length (little-endian) + JSON message
- Host responds: Same format via stdout
- Connection maintained while Chrome is open
- Auto-reconnects on Chrome restart

---

## Known Issues

### 1. Speech Recognition Network Errors
**Status**: Blocking voice input
**Error**: `Speech recognition error: network`
**Cause**: Web Speech API in Electron requires Google servers, connection failing
**Impact**: Cannot use voice commands, manual button works fine
**Solution Options**:
- Switch to offline STT library (Vosk, Whisper.cpp)
- Configure Web Speech API differently
- Use OS-level speech recognition APIs

### 2. Content Script Timing
**Status**: Resolved
**Issue**: "Receiving end does not exist" errors
**Fix**: Added error handling in background.js, requires page reload after extension install

---

## File Naming Conventions
- **Handoff files**: `MM-DD-YYYY_HH-MM-SS_EST.md`
- **Code files**: camelCase for JavaScript
- **Documentation**: SCREAMING_SNAKE_CASE.md for project docs
- **Logs**: Numeric timestamps for Electron logs

## Build Status
- **Desktop App**: Running (npm start in `/app`)
- **Extension**: Installed and active
- **Native Messaging**: Connected
- **Full Pipeline**: ✅ **WORKING** (manual command → browser click confirmed)
- **Voice Recognition**: ❌ Network errors (needs fix)

## Installation Status
- **Windows Registry**: Native messaging host registered
- **Extension ID**: lbcnhpobdoecbgaackpmkkhbidjefmpp
- **Chrome Extension**: Loaded unpacked from `/extension`
- **Location**: `C:\Users\haith\OneDrive\Documents\Projects\voice-assistant-extension`
