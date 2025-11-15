# EmuSave - Codebase Index

**Last Updated:** November 14, 2025
**Current Phase:** Phase 1 - MVP Development (In Progress)

---

## Project Structure

```
EmuSave/
├── .claude/                          # Claude Code configuration
│   └── commands/
│       ├── start-session.md          # Session start protocol command
│       ├── work-session.md           # Work session reminder command
│       └── end-session.md            # Session end protocol command
│
├── handoff/                          # Session handoff documents
│   ├── MASTER_HANDOFF_INDEX.md       # Index of all sessions
│   └── [session handoffs].md         # Individual session handoffs
│
├── plan/                             # Development plans
│   ├── outline.md                    # Project roadmap (3 phases)
│   └── phase1.md                     # Phase 1 technical specification
│
├── pc-server/                        # Node.js PC Server (COMPLETED)
│   ├── src/
│   │   ├── server.js                 # Main Express server (300 lines)
│   │   ├── config.js                 # Configuration manager (100 lines)
│   │   ├── backup.js                 # Backup operations (150 lines)
│   │   └── sync.js                   # Zip/unzip operations (100 lines)
│   ├── backups/                      # Auto-created backups
│   ├── uploads/                      # Temporary upload storage
│   ├── config.json                   # Server configuration
│   ├── config.example.json           # Example configuration
│   ├── package.json                  # Node.js dependencies
│   ├── .gitignore                    # Git ignore rules
│   ├── test-server.sh                # Test script
│   └── README.md                     # Server documentation
│
├── android-app/                      # Android App (NOT STARTED)
│   └── (to be created in next session)
│
├── test-saves/                       # Test save folder
│   └── test.sav                      # Sample test file
│
├── CLAUDE.md                         # Project overview
├── SESSION_PROTOCOLS.md              # Development session protocols
├── PLAN_REVIEW.md                    # Comprehensive plan analysis
├── emusave_idea.md                   # Original ChatGPT conversation
├── mockup-android.html               # Interactive Android UI mockup
├── CODEBASE_INDEX.md                 # This file
└── README.md                         # (to be created)
```

---

## File Descriptions

### Configuration & Documentation

**CLAUDE.md** - Project overview and quick reference
- Technology stack
- Current phase status
- Design decisions
- Dependencies
- Development workflow

**SESSION_PROTOCOLS.md** - Development session guidelines
- Session start checklist
- During-session best practices
- End session protocol
- Quality standards

**PLAN_REVIEW.md** - Comprehensive plan analysis
- Review of original ChatGPT plan
- Recommended simplifications
- Architecture decisions
- Phase 1 scope definition

**emusave_idea.md** - Original ChatGPT conversation
- Initial concept discussion
- Technical approach brainstorming
- HTML mockup (original)

**mockup-android.html** - Interactive Android UI mockup
- Visual prototype of Android app
- Interactive demo of sync flow
- Feature explanation

### Planning Documents

**plan/outline.md** - Project roadmap
- 3-phase development plan
- Technology stack
- Architecture overview
- Success metrics

**plan/phase1.md** - Phase 1 technical specification
- Detailed API specs
- File structures
- 6-session development roadmap
- Testing strategy

### PC Server (Node.js)

**pc-server/src/server.js** - Main Express server
- HTTP endpoints for sync operations
- Middleware setup
- Error handling
- Server initialization
- Network IP detection

**pc-server/src/config.js** - Configuration management
- Load/save config.json
- Configuration validation
- Default values

**pc-server/src/backup.js** - Backup operations
- Create timestamped backups
- List available backups
- Restore from backup
- Auto-cleanup old backups

**pc-server/src/sync.js** - Sync operations
- Zip folder creation
- Unzip extraction
- Zip validation
- Folder size utilities

**pc-server/package.json** - Dependencies
- express - HTTP server
- archiver - Zip creation
- unzipper - Zip extraction
- multer - File upload handling
- cors - Cross-origin support

**pc-server/config.json** - Server configuration
- Save folder path
- Backup folder path
- Max backups to keep
- Port and host settings

**pc-server/README.md** - Server documentation
- Quick start guide
- API endpoint documentation
- Configuration options
- Testing instructions
- Troubleshooting guide

### Session Management

**.claude/commands/** - Slash commands
- `/start-session` - Begin new session
- `/work-session` - Remind of best practices
- `/end-session` - End session protocol

**handoff/MASTER_HANDOFF_INDEX.md** - Session history
- Chronological list of all sessions
- Quick status overview
- Session summaries

**handoff/[timestamp].md** - Individual handoffs
- Session accomplishments
- Files modified
- Current status
- Next steps

---

## Code Statistics

**Total Lines of Code:** ~1,200
- PC Server: ~650 lines
- Configuration/Docs: ~550 lines

**Total Files:** 22
- Code files: 8
- Documentation: 10
- Configuration: 4

---

## Dependencies

### PC Server (Node.js)
```json
{
  "express": "^4.18.2",        // HTTP server framework
  "archiver": "^6.0.1",        // Zip creation
  "unzipper": "^0.11.6",       // Zip extraction
  "multer": "^1.4.5-lts.1",    // File upload handling
  "cors": "^2.8.5"             // CORS support
}
```

### Android App (To be added)
- Kotlin
- OkHttp
- Gson
- Material Components

---

## Development Status

### Completed Components
- ✅ PC Server (fully functional, tested)
- ✅ Session protocols
- ✅ Project documentation
- ✅ Development plans
- ✅ Android UI mockup

### In Progress
- 🔄 Phase 1 MVP

### Not Started
- ⏳ Android app development
- ⏳ End-to-end testing
- ⏳ User documentation
- ⏳ System tray PC UI

---

## Testing Status

### PC Server
- ✅ GET /status - Working
- ✅ GET /health - Working
- ✅ GET /download - Working (creates valid zip)
- ⏳ POST /upload - Implemented, not tested
- ✅ GET /backups - Working
- ⏳ POST /restore - Implemented, not tested

### Android App
- ⏳ Not yet created

---

## Next Development Priorities

1. Create Android app project structure
2. Implement folder picker (Storage Access Framework)
3. Implement sync service (HTTP client)
4. Implement backup manager
5. Create UI layouts
6. Test end-to-end PC ↔ Android sync

---

*This index is maintained to provide quick navigation and status overview for all development sessions.*
