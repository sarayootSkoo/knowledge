# Investigate Issue — Root Cause Analysis

Investigate all tasks in an issue file, diagnose root causes, and produce a detailed investigation report.

## Input
$ARGUMENTS

**Parse input:**
- **File path** (e.g. `tasks/issue/issue-27_02_2026_18_22.md`): read the file and extract all `TASK` items
- **Missing / not a file path** → **stop and ask the user for the issue file path**

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in the report filename.

---

## Investigation Protocol

**Goal: Diagnose, not implement. Find the exact file:line, explain why it's wrong, map the impact.**

### Phase 0: Parse Issue File
1. Read the issue file at the given path
2. Extract all tasks — each starts with `##### TASK {id}: {title}`
3. For each task, capture:
   - Task ID and title
   - As-is description (current broken behavior)
   - To-be description (expected behavior)
   - Any links or references in the task body

### Phase 1: Context Loading (run once, shared across tasks)
- Read `docs/BUSINESS_OVERVIEW.md` for domain context
- Read `docs/STATUS_REFERENCE.md` if any task mentions order status
- Read `docs/DATABASE_SCHEMA.md` if any task mentions DB fields or models

### Phase 2: Per-Task Investigation (repeat for each TASK)
**Rule: Grep/Glob to locate, Read only targeted sections. Max 8 tool calls per task.**

For each task:
1. **Grep** — search for key symbols from the task description (class names, field names, function names, topic keywords)
2. **Glob** — find files by name pattern if type is mentioned
3. **Read** — read only the relevant sections of shortlisted files (use `offset` + `limit` for large files)
4. **Trace the data flow** — follow the path from entry point to the bug site:
   - Where does the data come from?
   - Where is it transformed?
   - Where does it go wrong?
5. **Find the exact line** — identify the precise `file.ts:line` where the bug lives

### Phase 3: Per-Task Analysis
For each task, answer:
1. **Root Cause** — exact `file.ts:line` + one-sentence explanation
2. **Why it happens** — code-level reason (wrong field, missing conversion, wrong condition, etc.)
3. **Impact Scope** — what else is affected (other services, Kafka messages, DB records, downstream systems)
4. **Fix Direction** — 2-3 bullet points describing the approach (not full implementation steps)
5. **Complexity** — LOW / MEDIUM / HIGH + justification

---

## Report File
Path: `tasks/issue/issue-{datetime}-{issue_filename}.md`

`{issue_filename}` = basename of the issue file without extension (e.g. `issue-27_02_2026_18_22`)

Write the report in **Thai** (English for code/technical terms) using the format below.

---

## Report Format

````md
# Investigation Report — {issue_filename}

## Metadata
issue_file: `{issue_file_path}`
datetime: `{dd-mm-yyyy HH:MM:ss}`
tasks_found: {N}

---

## Summary Table

| Task ID | Title   | Root Cause (สั้น)     | Complexity   | Fix Direction |
| ------- | ------- | ------------------- | ------------ | ------------- |
| {id}    | {title} | {1-line root cause} | LOW/MED/HIGH | {1-line fix}  |

---

## TASK {id}: {title}

### Issue Description
**As-is:** {as-is จาก issue file}
**To-be:** {to-be จาก issue file}

### Root Cause
```
[Entry Point] → [file.ts:line] → wrong_value
เพราะ: {อธิบายสาเหตุ}
```

### Affected Code
- `src/path/to/file.ts:line` — {อธิบาย}
- `src/path/to/file.ts:line` — {อธิบาย}

### Impact Scope
- **Service impact**: {อธิบาย}
- **Downstream impact**: {Kafka / DB / API response ที่ได้รับผล}
- **Other tasks affected**: {ถ้ามี dependency กับ task อื่น}

### AS-IS vs TO-BE

**AS-IS:**
```
{code flow ที่ผิด พร้อม field values}
field = wrong_value  ← เพราะ ...
```

**TO-BE:**
```
{code flow ที่ถูกต้อง}
field = correct_value  ✅
```

### Fix Direction
1. {แนวทางแก้ข้อ 1}
2. {แนวทางแก้ข้อ 2}
3. {แนวทางแก้ข้อ 3 ถ้ามี}

### Complexity: {LOW/MEDIUM/HIGH}
{เหตุผล 1-2 ประโยค}

### Risk if not fixed
{อธิบาย business risk}

---

## TASK {next_id}: ...
{repeat for each task}

---

## Cross-Task Dependencies
{ถ้า task ไหนต้องทำก่อน/หลัง task อื่น ระบุที่นี่}
{ถ้าไม่มี: "ไม่มี dependency ระหว่าง tasks"}

---

## Recommended Fix Order
1. TASK {id} — {เหตุผลที่ควรทำก่อน}
2. TASK {id} — ...

---

## Next Steps
สำหรับแต่ละ task ที่ต้องการ implement ให้รัน:
```
/chore {task_id} {task_title_short}
```
หรือ
```
/chore tasks/issue/{issue_filename}.md
```
````

---

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to created issue investigation file}
card_status: completed
target_column: task
suggested_next: /chore '{artifact_path}'
mode: create
```

## Report

Return:
1. Path to the investigation report
2. Number of tasks investigated
3. Brief summary table (Task ID | Root Cause | Complexity)

---

## Ask me always

After returning the report path, always ask the user:

```
File path - {issue_file_path}
What would you like to do next?

[ ] Create chore spec for a specific task — type task ID (e.g. TASK 61055)
[ ] Create chore specs for all tasks
[ ] No
```

Wait for the user's response before proceeding.


