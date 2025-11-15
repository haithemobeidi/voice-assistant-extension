---
description: End the session properly with documentation and git commit
---

# End Session Protocol

You are ending a development session for **EmuSave**.

Follow these steps **in exact order**:

## Step 1: Update Documentation (If Needed)

**Only update if significant changes were made:**

### Files to Consider:
- **`CODEBASE_INDEX.md`** - Update if files added/removed or major structural changes
- **`plan/outline.md`** - Update phase status if phase completed or major milestone reached
- **`CLAUDE.md`** - Update if project scope/tech stack changed

**Skip this step if:** Only bug fixes, minor tweaks, or no new files added.

## Step 2: Create Session Handoff Document (ALWAYS)

### File Naming Format:
`handoff/MM-DD-YYYY_HH-MM-SS_EST.md` (or EDT/UTC as appropriate)

### Use This Template:

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

**Next Phase Prerequisites:**
- [What needs to be done before next phase]

## Files Modified This Session

### Added:
- `path/to/file.ts` - [Brief description]

### Modified:
- `path/to/file.ts` - [What changed and why]

### Deleted:
- `path/to/file.ts` - [Why it was removed]

## Technical Notes

**Dependencies Added:**
- `package-name@version` - [Why it was added]

**Configuration Changes:**
- [Any config changes]

**Server/Sync Testing:**
- [Status, any errors encountered]

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

## Step 3: Update Master Handoff Index (ALWAYS)

**File:** `handoff/MASTER_HANDOFF_INDEX.md`

Add new entry at the **TOP** in this format:

```markdown
**Handoff MM-DD-YYYY_HH-MM-SS_EST** - [Brief 1-sentence summary], build status: [working/broken], user confirmed: [yes/no]
```

## Step 4: Git Commit (ALWAYS)

### Stage All Changes:
```bash
git add handoff/
git add plan/ (if updated)
git add CODEBASE_INDEX.md (if updated)
git add [any other modified files]
```

### Commit with Descriptive Message:
```bash
git commit -m "Session end [MM/DD/YYYY]: [Brief session summary]

- [Key accomplishment 1]
- [Key accomplishment 2]
- [Files modified count]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**DO NOT push unless user explicitly requests it.**

## Quality Verification Before Ending

- [ ] Code compiles without errors
- [ ] Server/app runs without errors
- [ ] All TODOs either completed or documented
- [ ] User confirmed features work
- [ ] All changes staged
- [ ] Handoff document is thorough
- [ ] Master index updated
- [ ] Commit message is clear

---

**Session end protocol complete!** All changes have been documented and committed.
