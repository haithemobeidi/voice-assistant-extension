# Voice Assistant Browser Automation - Project Configuration

## 🚨 MANDATORY SESSION INITIALIZATION PROTOCOL

**EVERY NEW CLAUDE SESSION MUST:**
1. Read CODEBASE_INDEX.md first for current file structure
2. Check latest handoff in `/handoff/MASTER_HANDOFF_INDEX.md` for current status
3. Review build/test status
4. Tell the user what is next - **DO NOT START** until user confirms

This ensures continuity between sessions and prevents duplicate work or missed context.

## 🚨 END SESSION PROTOCOL

**EVERY SESSION END MUST:**
1. Update CODEBASE_INDEX.md (if files changed)
2. Create detailed handoff document in `/handoff/` with timestamp
   - Session summary
   - Accomplishments
   - Current status
   - Files modified (NEW/MODIFIED)
   - Next session recommendations
3. Update MASTER_HANDOFF_INDEX.md with session entry
4. Commit changes (only after user confirms features work)

## Project-Specific Agent Usage

### General Coordination
See /home/haith/documents/CLAUDE_AGENT_COORDINATION.md for base patterns

### Project-Specific Quality Gates
- **Incremental testing required**: Test each component before building next
- **NO massive file dumps**: Build 1-2 files at a time, then test
- **User confirmation required** before marking any feature complete
- **Commit only after user confirms** feature works 100%
- **Build slowly and intelligently** - this is complex multi-component architecture

## Project Context
This is a voice-controlled browser automation tool consisting of:
- **Desktop Application** (Tauri/Electron): System-level microphone access, voice processing
- **Chrome Extension** (Manifest V3): Browser automation, DOM manipulation
- **Native Messaging Bridge**: Communication between app and extension

**Use Case**: Hands-free browser control for user holding child (or any hands-free scenario)

## Architecture Overview

```
Desktop App (voice input) ←→ Native Messaging ←→ Chrome Extension (browser control)
```

**Key Features:**
1. Voice commands for browser actions (click, scroll, read)
2. Smart element identification from natural language
3. Text-to-speech for reading content
4. Voice dictation for replies
5. Macro system for common responses

## Development Approach
- **Phase-based incremental development**
- **Test after each phase** before moving to next
- **Minimal viable components** first
- **Never build 50 files before testing**
