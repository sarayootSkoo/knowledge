# Power Chore — Precision Planning

Generate a targeted, implementation-ready plan. Every research step must be purposeful.

## Input
$ARGUMENTS

**Parse input as one of:**
- **File path** (e.g. `focus '/path/spec.md'` or just `/path/spec.md`): read the file and treat its full content as the prompt
- **Inline text**: first word = `adw_id`, remaining = `prompt`
- **Missing**: if `adw_id` or `prompt` cannot be determined → **stop and ask the user**

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}` in the spec filename.

---

## Research Protocol — Targeted Only

**Rule: Grep/Glob to locate, Read only targeted sections. NO broad exploration. Max 10 file reads.**

### Phase 1: Locate (≤ 5 tool calls)
- `Grep` — search for key symbols from the prompt (class names, field names, function names)
- `Glob` — find files by name pattern if type is mentioned (`*transformer*`, `*builder*`, `*service*`, `*dto*`)
- Build a shortlist of ≤ 10 files from results

### Phase 2: Read (≤ 10 targeted reads)
- Read only files from Phase 1 shortlist
- For large files, use `offset` + `limit` — read only the relevant section
- Focus on: current implementation of affected logic, its callers, and direct usages

### Phase 3: Analyze — Answer with exact `file.ts:line` references
1. **Root cause** — what exactly is wrong or missing?
2. **Impact scope** — what else breaks or is affected?
3. **Change surface** — which files change, and what exactly in each?

---

## Required Analysis (must appear in the plan)

### Business Flow
Write actual data/code flow — not prose.

#### AS-IS — current (buggy/incomplete) state
```
[Caller] → [file.ts:line] → result: field = wrong_value
reason: why it's wrong
```
**Score: X/5** — one-line reason

#### TO-BE — target state after fix
```
[Caller] → [file.ts:line*] → result: field = correct_value
```
**Score: X/5** — one-line reason

### Risk Matrix (required)
| #   | Risk | Severity | Business Impact | Mitigation |
| --- | ---- | -------- | --------------- | ---------- |

### Promise.all Impact (required, even if none)
State: **YES — affects [service/flow] because [reason]** OR **NO — no async ordering impact.**

---

## Spec File
Path: `specs/chore-{datetime}-{adw_id}-{descriptive-name}.md`

`{descriptive-name}` = short kebab-case (e.g. `allocation-weight-fix`, `t1-null-coerce`, `publish-price-convert`)

Write the plan in **Thai** using the plan format below.

---

## Plan Format

````md
# Chore: <ชื่องาน>

## Metadata
adw_id: `{adw_id}`
prompt: `{prompt}`
datetime: `{dd-mm-yyyy HH:MM:ss}`

---

## Chore Description
<2-4 ประโยค: ปัญหาคืออะไร ทำไมสำคัญ จะแก้อะไร>

---

## AS-IS vs TO-BE

### AS-IS — Current State
```
<data flow หรือ code flow แสดง behavior ปัจจุบัน>
field = wrong_value   ← เพราะ ...
```
**Score: X/5** — เหตุผลสั้นๆ

### TO-BE — Target State
```
<data flow หรือ code flow แสดง behavior ที่ถูกต้อง>
field = correct_value  ✅
```
**Score: X/5** — เหตุผลสั้นๆ

---

## Risk Matrix

| #   | Risk | Severity | Business Impact | Mitigation |
| --- | ---- | -------- | --------------- | ---------- |

---

## Relevant Files

- `src/path/to/file.ts` — หน้าที่และเหตุที่เกี่ยวข้อง

### New Files (ถ้ามี)
- `src/path/to/new.ts` — จุดประสงค์

---

## Step by Step Tasks
IMPORTANT: ทำตามลำดับจากบนลงล่าง เริ่มจาก foundational changes

### 1. Task Name
**File:** `src/path/to/file.ts` (line X-Y ถ้าระบุได้)
- action ที่เจาะจง พร้อม before/after snippet ถ้าเปลี่ยนแปลงซับซ้อน

```typescript
// Before
field = wrong

// After
field = correct
```

### 2. Task Name
**File:** `src/path/to/file.ts`
- action ที่เจาะจง

---

## Validation Commands

```bash
# Grep ยืนยัน pattern ที่ถูกต้อง
grep -n "pattern" src/path/to/file.ts

# Build
pnpm run build 2>&1 | tail -20

# Tests
pnpm run test -- --testPathPattern="relevant" 2>&1 | tail -20
```

---

## Notes
<related specs, conventions, caveats>
````

---

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to created spec file}
card_status: completed
target_column: design
suggested_next: /breakdown '{artifact_path}'
mode: create
```

## Report

Return the path to the created spec file.


---

## Ask me always

After returning the spec path, always ask the user:

```
File path - {spec_file_path}
What would you like to do next?

[ ] Yes, implement
[ ] Add condition — type your changes
[ ] No
```

Wait for the user's response before proceeding.
