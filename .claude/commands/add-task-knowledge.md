# Add Task Knowledge — Record Work into Knowledge Hub

Capture completed or in-progress work (chore, plan, design, discussion, decision, or any task) into a structured knowledge document for the team.

## Input
$ARGUMENTS

**Parse input as:**
- First token = `category`: `frontend` or `backend` (determines subfolder)
- Remaining text = `description`: what was done, decided, planned, or designed
- **Missing category**: if not specified, infer from the current working directory or conversation context (`oms-webapp` = frontend, `oms-order` = backend)
- **Missing description**: summarize the current conversation's main work

## Datetime
Get current datetime: run `date '+%Y-%m-%d'` for `{date}` and `date '+%d-%m-%Y %H:%M'` for display.

---

## Process

### Phase 1: Classify the Work
Determine the task type from context:

| Type | Trigger |
|------|---------|
| `chore` | Code cleanup, refactoring, dependency updates, standardization |
| `plan` | Implementation spec, architecture proposal, migration plan |
| `design` | UI/UX design decisions, component structure, layout changes |
| `discussion` | Technical debate, trade-off analysis, team alignment |
| `decision` | Final call on architecture, pattern, or approach |
| `feature` | New feature implementation or enhancement |
| `bugfix` | Bug investigation and fix |
| `research` | Exploration, spike, proof-of-concept |

A single task can have multiple types (e.g., `discussion` + `decision`).

### Phase 2: Extract from Conversation
Review the current conversation and gather:
1. **Title** — concise summary of the work
2. **Type(s)** — from the table above
3. **What changed** — files, components, patterns affected
4. **Why** — business reason or technical motivation
5. **Key decisions** — choices made and rationale
6. **Impact** — what is affected, risk level
7. **Status** — Done / In Progress / Planned

### Phase 3: Research (if needed, max 5 reads)
- Only read files to verify references mentioned in conversation
- Do NOT do broad exploration

### Phase 4: Write Document
Write in Thai + English technical terms (matching team convention).

---

## Output File
Path: `../knowledge/task/{category}/{date}_{name}.md`

- `{category}` = `frontend` or `backend`
- `{date}` = `YYYY-MM-DD` format (e.g., `2026-03-06`)
- `{name}` = kebab-case short name (e.g., `ghost-retry-diff-preview`, `api-path-standardization`)

---

## Document Format

```md
# {Title}

**Date:** {dd-mm-yyyy HH:MM}
**Category:** {frontend | backend}
**Type:** {chore | plan | design | discussion | decision | feature | bugfix | research}
**Status:** {Done | In Progress | Planned}
**Branch:** {current git branch}

---

## Summary

<2-4 sentences: what was done and why>

---

## Details

### What Changed
<list of files/components/patterns affected with brief description>

### Why
<business or technical motivation>

### Key Decisions
<decisions made during this work, with rationale>

| Decision | Choice | Reason |
|----------|--------|--------|
| ... | ... | ... |

---

## Technical Notes

<implementation details, patterns used, gotchas to remember>

### Code References

| File | Description |
|------|-------------|
| `path/to/file.ts` | <what and why> |

---

## Impact

- **Risk:** {Low | Medium | High}
- **Breaking Changes:** {None | describe}
- **Affected Areas:** {list pages/services/modules affected}

---

## Follow-up

- [ ] <any remaining tasks or next steps>

---

## Related

- <links to specs, PRs, discussions, or other knowledge docs>
```

---

## After Writing

Report the file path and summary:

```
Task recorded: {category}/{date}_{name}.md

Type: {type}
Summary: {1-2 sentence summary}
Status: {status}
```
