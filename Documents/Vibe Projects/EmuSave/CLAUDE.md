# EmuSave - Project Overview

**Version:** 0.1.0-alpha
**Status:** Planning & Initial Development
**Last Updated:** November 14, 2025

---

## What is EmuSave?

EmuSave is an **emulator-agnostic save synchronization tool** that lets users seamlessly transfer save data between their PC and Android device with one tap.

**Core Value:** "Play on PC, continue on your phone, or vice versa - with one tap."

---

## Project Goals

### Primary Goals
1. **Simple UX** - Non-technical users can set up in under 5 minutes
2. **Reliable** - Never lose save data (automatic backups)
3. **Fast** - Sync completes in under 10 seconds
4. **Universal** - Works with any emulator

### Secondary Goals (Future)
- Auto-sync when saves change
- Remote access (play from anywhere)
- Multiple device support
- Cloud backup integration

---

## Technical Overview

### Architecture
```
PC (Server)          LAN/Wi-Fi          Android (Client)
Node.js + Express ◄─────────────────► Kotlin Native App
     │                                      │
     ▼                                      ▼
Save Folder                          Save Folder
```

### Technology Stack

**PC Server:**
- Runtime: Node.js (v18+)
- Framework: Express
- UI: System tray (Phase 1), Tauri (Phase 2)

**Android App:**
- Language: Kotlin
- Min SDK: API 26 (Android 8.0)
- Key APIs: Storage Access Framework, OkHttp

---

## Current Phase

**Phase:** Phase 1 - MVP Development
**Status:** Planning Complete, Ready to Build
**Goal:** Working bidirectional sync on LAN

**Phase 1 Deliverables:**
- [ ] PC server with HTTP sync endpoints
- [ ] Android app with folder picker
- [ ] Bidirectional sync (upload/download)
- [ ] Automatic backups
- [ ] Works with any emulator

---

## Project Structure

```
EmuSave/
├── .claude/                    # Claude Code configuration
│   └── commands/               # Session management commands
├── handoff/                    # Session handoff documents
│   └── MASTER_HANDOFF_INDEX.md
├── plan/                       # Development plans
│   ├── outline.md              # Project roadmap
│   ├── phase1.md               # Phase 1 technical spec
│   └── phase2.md               # (future)
├── pc-server/                  # Node.js PC server (to be created)
├── android-app/                # Kotlin Android app (to be created)
├── docs/                       # User documentation (to be created)
├── CLAUDE.md                   # This file
├── SESSION_PROTOCOLS.md        # Development session protocols
├── PLAN_REVIEW.md              # Comprehensive plan analysis
├── CODEBASE_INDEX.md           # (to be created)
└── README.md                   # (to be created)
```

---

## Development Workflow

### Session Management

This project uses **strict session protocols** for consistent development:

**Start Session:** `/start-session`
- Load context from handoffs and plans
- Review current phase status
- Create TodoWrite list for session

**During Session:** `/work-session`
- Follow code quality standards
- Update TodoWrite frequently
- Test before committing

**End Session:** `/end-session`
- Create handoff document
- Update master index
- Commit changes
- DO NOT push without user approval

### Code Quality Standards
- TypeScript/Kotlin strict typing
- Comprehensive comments for handoffs
- Library-first approach (don't reinvent)
- Test before committing
- User confirms features work before commit

---

## Key Design Decisions

### Why PC as Server?
- PC is more stable on LAN
- Android storage restrictions make server complex
- Easier debugging on PC
- Natural "host" role

### Why Full Folder Sync (Not Selective)?
- Save folders are small (typically < 50MB)
- LAN is fast (sync in seconds)
- **Much simpler code** (300 lines vs 800+ lines)
- Can add selective sync later if needed

### Why Manual Sync (Not Auto)?
- Proves concept first
- File watching on Android is complex
- Manual sync is acceptable UX (one tap)
- Auto-sync is Phase 2 polish

### Why Emulator-Agnostic?
- Works with ANY emulator (more valuable)
- No emulator-specific code needed
- Future-proof (works with new emulators)
- User picks folder, we sync it

### Why Mandatory Backups?
- User trust is everything
- One corrupted save = user abandons app
- Minimal performance cost
- Easy to implement (zip before overwrite)

---

## Dependencies

### PC Server (Node.js)
```json
{
  "express": "^4.18.2",
  "archiver": "^6.0.1",
  "unzipper": "^0.11.6",
  "chokidar": "^3.5.3",
  "node-systray": "^2.1.5"
}
```

### Android App (Kotlin)
```gradle
dependencies {
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.google.code.gson:gson:2.10.1'
    implementation 'com.google.android.material:material:1.11.0'
}
```

---

## Testing Strategy

### Phase 1 Testing
**Manual testing with real emulators:**
- Citra (3DS)
- RetroArch (Multi-system)
- DuckStation (PS1)
- PPSSPP (PSP)

**Scenarios to test:**
- Small saves (<1MB)
- Large saves (50MB+)
- Network disconnect mid-sync
- Rapid successive syncs
- Backup creation and restoration

### Success Metrics
- Zero data loss in 50+ syncs
- Sync completes in <10 seconds
- Setup takes <5 minutes
- Works with 3+ emulators

---

## Risks & Mitigation

**High-Priority Risks:**

1. **Storage Access Framework complexity**
   - Mitigation: Thorough SAF research, multi-device testing
   - Contingency: Require specific folder location

2. **Network reliability**
   - Mitigation: Retries, timeouts, clear errors
   - Contingency: User retries manually

3. **Data corruption**
   - Mitigation: Atomic operations, backups, zip validation
   - Contingency: Restore from backup

---

## Roadmap

### Phase 1: MVP (Current)
- Working PC ↔ Android sync on LAN
- Manual sync buttons
- Automatic backups
- Target: 3-5 coding sessions

### Phase 2: Polish & Automation
- Auto-sync with file watching
- QR code pairing
- Better UI (Tauri wrapper for PC)
- Multiple save folder support
- Target: 4-6 coding sessions

### Phase 3: Advanced Features
- Remote access (VPN or port forward)
- Conflict resolution UI
- iOS support (maybe)
- Cloud relay option
- Target: TBD

---

## Future Considerations

### Commercialization
- Free tier: LAN sync only
- Pro tier: Remote access, cloud relay
- Pricing: $2.99 one-time (no subscription)

### Open Source
- Consider open-sourcing after Phase 2
- Build community
- Accept contributions

### Platform Expansion
- iOS (if demand exists)
- Linux/macOS (should already work)
- Steam Deck (Linux-based, should work)

---

## Getting Started (Development)

### Prerequisites
- Node.js v18+
- Android Studio
- Git

### First Time Setup
```bash
# Clone repository
git clone [repo-url]
cd EmuSave

# Install PC server dependencies
cd pc-server
npm install

# Open Android app in Android Studio
# Open android-app/ folder
```

### Running Locally
```bash
# Start PC server
cd pc-server
npm start

# Build Android app in Android Studio
# Run on device or emulator
```

---

## Important Files

**Must Read:**
- `SESSION_PROTOCOLS.md` - Development session guidelines
- `plan/outline.md` - Project roadmap
- `plan/phase1.md` - Current phase technical spec
- `PLAN_REVIEW.md` - Comprehensive plan analysis

**Reference:**
- `handoff/MASTER_HANDOFF_INDEX.md` - Session history
- Latest handoff in `handoff/` - Most recent session details

---

## Contact & Support

**Project Lead:** Haith
**Development Tool:** Claude Code
**Repository:** (to be added)
**Issues:** (to be added)

---

## License

(To be determined - likely MIT or GPL-3.0)

---

*This document is the single source of truth for the EmuSave project. Keep it updated as the project evolves.*

**Last Updated:** November 14, 2025
