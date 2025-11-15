---
description: Begin a new development session with proper context loading and planning
---

# Start Session Protocol

You are starting a new development session for **EmuSave**.

## Context Loading Checklist

### 1. Read Project Documentation
- Read `CLAUDE.md` in full for project overview
- Review `plan/outline.md` for current phase status
- Read current phase file (e.g., `plan/phase1.md`) for detailed context
- Review `handoff/MASTER_HANDOFF_INDEX.md` for recent session summaries
- Read the most recent handoff document for detailed last session context

### 2. Check Git Status
- Run `git log --oneline -10` for recent commits
- Run `git status` to see uncommitted changes
- Identify any blocking issues from previous session

### 3. Environment Verification
- Verify working directory: `/mnt/c/Users/haith/Documents/Vibe Projects/EmuSave`
- Check which project component (PC server vs Android app) is the focus
- For PC server: Verify Node.js/npm installed and server can start
- For Android app: Verify Android Studio/Kotlin setup (when needed)

### 4. Create Session Plan
- Use TodoWrite to create task list for this session
- Confirm user's goals for this session
- Break complex tasks into manageable steps
- Proactively identify which specialized agents may be needed

## Session Started

**Current Phase:** [Read from plan/outline.md]
**Recent Activity:** [Summarize from MASTER_HANDOFF_INDEX.md]
**Ready to work on:** [Confirm with user]

What would you like to work on this session?
