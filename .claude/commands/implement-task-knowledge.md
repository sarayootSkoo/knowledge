# Implement Task Knowledge — Execute a Task from Knowledge Hub

Read a task document from the knowledge hub and implement it step by step.

## Input
$ARGUMENTS

**Parse input as one of:**
- **File path** (e.g., `frontend/2026-03-06_ghost-retry-diff-preview.md`): read directly from `../knowledge/task/{path}`
- **Search term** (e.g., `ghost retry`, `api standardization`): search for matching task files
- **Missing**: list recent task files and ask the user to pick one

---

## Process

### Phase 1: Locate Task Document

**If file path provided:**
- Read `../knowledge/task/{path}`

**If search term provided:**
- Glob `../knowledge/task/frontend/*{term}*` and `../knowledge/task/backend/*{term}*`
- If multiple matches, list them and ask the user to pick
- If single match, use it

**If no input:**
- List all files in `../knowledge/task/frontend/` and `../knowledge/task/backend/`
- Show as numbered list with date and name
- Ask user to pick

### Phase 2: Parse Task Document
Read the task file and extract:
1. **Summary** — what needs to be done
2. **Details / What Changed** — files and components involved
3. **Key Decisions** — constraints and choices to follow
4. **Technical Notes** — patterns, gotchas, implementation details
5. **Code References** — exact files to modify
6. **Follow-up** — remaining tasks (these are what we implement)
7. **Status** — skip if already `Done`

### Phase 3: Plan Implementation
Based on the task document:
- Identify all files that need changes
- Read each file (targeted sections only)
- Create an ordered list of changes
- Present the plan to the user for confirmation

### Phase 4: Implement
Execute the changes following:
- The task document's decisions and constraints
- The project's CLAUDE.md conventions
- Build verification after each major change group

### Phase 5: Update Task Document
After implementation:
- Update the task's **Status** to `Done` (or `In Progress` if partial)
- Add implementation notes under **Technical Notes** if needed
- Add any new follow-up items discovered during implementation

---

## Report

After completing:

```
Implemented: {category}/{date}_{name}.md

Changes:
- {file}: {what changed}
- {file}: {what changed}

Status: {Done | In Progress}
Build: {Pass | Fail — reason}
```

---

## Ask User

After showing the plan (Phase 3), always ask:

```
Ready to implement?

[ ] Yes, proceed
[ ] Modify plan — type your changes
[ ] No, cancel
```

Wait for the user's response before proceeding to Phase 4.
