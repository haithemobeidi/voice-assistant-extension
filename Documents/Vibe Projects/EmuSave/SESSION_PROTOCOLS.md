# EmuSave - Development Session Protocols

## Overview
This document defines the mandatory session protocols for all Claude Code development sessions on the EmuSave project. These protocols ensure continuity, quality, and proper documentation across sessions.

---

## 📋 Session Start Protocol (MANDATORY)

Each Claude session must begin by following this checklist:

### 1. Context Loading
- [ ] Read `CLAUDE.md` in full for project overview
- [ ] Review `plan/outline.md` for current phase status
- [ ] Read current phase file (e.g., `plan/phase1.md`) for detailed context
- [ ] Check `git log --oneline -10` for recent commits
- [ ] Review any `handoff/` documents from previous sessions

### 2. Environment Verification
- [ ] Verify working directory: `/mnt/c/Users/haith/Documents/Vibe Projects/EmuSave`
- [ ] Check which project component is the focus (PC server vs Android app)
- [ ] Verify Node.js/npm installed (for PC server)
- [ ] Verify Android Studio/Kotlin setup (for Android app when needed)

### 3. Current State Assessment
- [ ] Run `git status` to see uncommitted changes
- [ ] Check if dev server is running (PC server)
- [ ] Identify any blocking issues from previous session
- [ ] Review TodoWrite list for active tasks

### 4. Planning Before Action
- [ ] Use TodoWrite to create task list for this session
- [ ] Confirm user's goals for this session
- [ ] Break complex tasks into manageable steps
- [ ] Proactively identify which specialized agents may be needed

---

## 🔄 During Session Best Practices

### Code Quality Standards
- [ ] **TypeScript strict mode** - No `any` types without justification
- [ ] **Comments for handoffs** - Explain complex logic for future Claude sessions
- [ ] **Consistent formatting** - Use project's ESLint/Prettier config
- [ ] **Test before committing** - Verify features work end-to-end
- [ ] **Library-first approach** - Use existing packages, don't reinvent

### Documentation Standards
- [ ] Update relevant markdown files when adding/changing features
- [ ] Keep `plan/outline.md` current with phase progress
- [ ] Document architectural decisions in appropriate plan files
- [ ] Add comments explaining "why" not just "what"

### Communication Standards
- [ ] Update TodoWrite frequently - mark completed immediately
- [ ] Use AskUserQuestion when requirements are unclear
- [ ] Provide clear status updates as work progresses
- [ ] Be honest about limitations or uncertainties

---

## 🏁 End Session Protocol (MANDATORY)

When user confirms work is complete and says **"end session"**, **"session end"**, or **"end protocol"**, Claude must follow this exact order:

### Step 1: Update Documentation (If Needed)
**Only update if significant changes were made:**
- [ ] **CODEBASE_INDEX.md** - Update if files added/removed or major structural changes
- [ ] **plan/outline.md** - Update phase status if phase completed or major milestone reached
- [ ] **CLAUDE.md** - Update if project scope/tech stack changed

**Skip this step if:** Only bug fixes, minor tweaks, or no new files added.

### Step 2: Create Session Handoff Document (ALWAYS)
**File naming format:** `handoff/MM-DD-YYYY_HH-MM-SS_EST.md`

Use the template below (adapt timezone as needed: EST/EDT/UTC).

### Step 3: Update Master Handoff Index (ALWAYS)
**File:** `handoff/MASTER_HANDOFF_INDEX.md`

Add new entry at the TOP in this format:
```markdown
**Handoff MM-DD-YYYY_HH-MM-SS_EST** - [Brief 1-sentence summary of session], build status: [working/broken], user confirmed: [yes/no]
```

Keep existing formatting style - this is a catalog of all handoffs.

### Step 4: Git Commit (ALWAYS)
**Commit everything from this session:**
```bash
git add handoff/
git add plan/ (if updated)
git add CODEBASE_INDEX.md (if updated)
git add [any other modified files]

git commit -m "Session end [MM/DD/YYYY]: [Brief session summary]

- [Key accomplishment 1]
- [Key accomplishment 2]
- [Files modified count]

🤖 Generated with Claude Code"

# DO NOT push unless user explicitly requests it
```

---

## 📄 Handoff Document Template

```markdown
# Session Handoff - [MM/DD/YYYY HH:MM:SS EST]

## Session Summary
[2-3 sentence overview of session goals and what was accomplished]

## Accomplishments This Session
- [Feature 1 completed - specific files/functionality]
- [Feature 2 implemented - what it does]
- [Bug fix 1 - what was wrong, how fixed]
- [Documentation updated - which files]

## Current Project Status
**Phase:** [Current phase number and name]
**Build Status:** [✅ Working / ⚠️ Issues / ❌ Broken]
**Tests Passing:** [Yes/No/N/A]
**User Confirmation:** [User confirmed feature works: Yes/No]

**Active Issues:**
- [Any known bugs or incomplete features]
- [Blockers for next session]

**Next Phase Prerequisites:**
- [What needs to be done before next phase]

## Files Modified This Session
### Added:
- `path/to/file.ts` - [Brief description of what this file does]

### Modified:
- `path/to/file.ts` - [What changed and why]

### Deleted:
- `path/to/file.ts` - [Why it was removed]

## Technical Notes
**Dependencies Added:**
- `package-name@version` - [Why it was added]

**Configuration Changes:**
- [Any vite.config.ts, tailwind.config.js, etc. changes]

**Build/Dev Server:**
- [Status of server, any errors encountered]

**Network/Sync Testing:**
- [Tested on: LAN/Remote, any sync issues encountered]

## Agent Coordination (If Applicable)
**Agents Used This Session:**
- [Agent name]: [What they did, outcome]

**Agents Recommended for Next Session:**
- [Agent name]: [Why they'd be helpful]

## Next Session Recommendations

### Priority 1 (Must Do Next):
1. [Most important task]
2. [Second most important]

### Priority 2 (Should Do Soon):
1. [Important but not urgent]

### Priority 3 (Future Enhancement):
1. [Nice to have]

### Specific Notes for Next Claude:
- [Anything the next session should know]
- [Gotchas, edge cases discovered]
- [Design decisions made and rationale]

## User Feedback
**User Said:**
- "[Direct quotes if user gave specific feedback]"

**User Requested:**
- [Any feature requests or changes user mentioned]

---

*Session concluded successfully. All changes documented and committed.*
```

---

## 🚨 Critical Rules

### Never Skip These:
1. ✅ **Always create handoff document** - Even for "quick fixes"
2. ✅ **Always update master index** - Maintains session history
3. ✅ **Always commit handoff files** - Ensures continuity
4. ✅ **Always test before ending** - User confirms it works
5. ✅ **Always use TodoWrite** - Track progress visibility

### Never Do These:
1. ❌ **Never commit without user confirmation** - User must verify it works
2. ❌ **Never push to remote without explicit request** - User decides when to push
3. ❌ **Never mark phase complete without all deliverables** - Be thorough
4. ❌ **Never skip documentation** - Future Claude sessions depend on it
5. ❌ **Never batch multiple sessions into one handoff** - One session = one handoff

---

## 📊 Quality Checklist (Before Session End)

### Code Quality
- [ ] TypeScript compiles without errors (if using TypeScript)
- [ ] Server runs without errors
- [ ] No console errors
- [ ] All TODOs either completed or documented
- [ ] Code follows project style guide

### Testing
- [ ] Manual testing completed (user tried the feature)
- [ ] Edge cases considered (what if user does X?)
- [ ] Network scenarios tested (LAN/remote if applicable)
- [ ] No regressions (old features still work)

### Documentation
- [ ] Comments added for complex logic
- [ ] README/CLAUDE.md updated if needed
- [ ] Phase files reflect current state
- [ ] Handoff document is thorough

### Git
- [ ] All changes staged (nothing left uncommitted)
- [ ] Commit message is clear and descriptive
- [ ] Handoff files included in commit
- [ ] User approved committing

---

## 🎯 Success Criteria

A session is considered successful when:
1. ✅ User confirms features work as expected
2. ✅ Build/server runs without errors
3. ✅ All session goals from TodoWrite completed
4. ✅ Handoff document comprehensively documents session
5. ✅ All files committed with clear message
6. ✅ Master index updated with session summary

---

## 📝 Example Session Flow

```
[SESSION START]
Claude: Reading CLAUDE.md and plan/outline.md...
Claude: Current phase is 1, status is IN_PROGRESS
Claude: Creating TodoWrite list for session goals
User: "Let's build the PC sync server"
Claude: [Uses TodoWrite, builds feature, tests with user]
User: "Great! It works. End session."

[SESSION END PROTOCOL TRIGGERED]
Claude:
1. No CODEBASE_INDEX.md changes needed (files added but structure same)
2. Creating handoff/11-14-2025_18-30-45_EST.md...
3. Updating handoff/MASTER_HANDOFF_INDEX.md...
4. Committing all changes...
Done! Session documented and committed.
```

---

*These protocols ensure high-quality development and seamless handoffs between Claude sessions. Follow them strictly for project success.*
