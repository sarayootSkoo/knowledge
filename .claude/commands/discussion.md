# Discussion — Capture Architectural Decisions & Technical Debates

Record the current conversation's discussion into a structured document with objective analysis, decisions made, and action items.

## Input
$ARGUMENTS

**Parse input as:**
- **Topic text**: the subject being discussed (e.g. `notification transaction boundary`, `outbox vs direct kafka`)
- **Missing**: if topic cannot be determined → summarize the current conversation's main discussion point

## Datetime
Get current datetime: run `date '+%d_%m_%Y_%H_%M_%S'` — use result as `{datetime}`.

---

## Process

### Phase 1: Extract from Conversation Context
Review the current conversation and identify:
1. **Topic** — what was being discussed/debated
2. **Trigger** — what prompted this discussion (a code change, a question, a bug, a review)
3. **Positions** — what options/viewpoints were considered
4. **Analysis** — data, code references, and reasoning used to evaluate
5. **Decision** — what was agreed upon and why
6. **Action Items** — concrete next steps

### Phase 2: Research (if needed, ≤ 5 reads)
- Only read files if you need to verify code references mentioned in the discussion
- Do NOT do broad exploration — focus on confirming facts from the conversation

### Phase 3: Write Document
Write the discussion document in Thai + English technical terms (same style as the conversation).

---

## Output File
Path: `discussion/{section}-{datetime}.md`

`{section}` = kebab-case topic derived from the discussion (e.g. `notification-transaction-boundary`, `outbox-retry-strategy`, `cancel-flow-idempotency`)

---

## Document Format

```md
# Discussion: <Topic Title>

**Date:** {dd-mm-yyyy HH:MM}
**Context:** <1 sentence — what triggered this discussion>
**Participants:** Developer + AI Reviewer
**Status:** <Agreed / Open / Needs Follow-up>

---

## Background

<2-4 sentences: สถานการณ์ที่ทำให้เกิดการ discuss — เรากำลังทำอะไร แล้วเจอคำถามอะไร>

---

## Discussion Points

### Question 1: <คำถามหลัก>

**Context:**
<สถานการณ์ที่ทำให้เกิดคำถามนี้>

**Analysis:**
<การวิเคราะห์ พร้อม code reference ถ้ามี>

| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

**Decision:** <สิ่งที่ตกลงกัน พร้อมเหตุผล>

### Question 2: <คำถามรอง (ถ้ามี)>
...

---

## Key Insights

<bullet points — สิ่งที่เรียนรู้จากการ discuss ที่มีค่าสำหรับอนาคต>

---

## Code References

| File | Line | Relevance |
|------|------|-----------|
| `src/path/to/file.ts` | ~123 | <ทำไมเกี่ยว> |

---

## Action Items

- [ ] <action item ที่ต้องทำ>
- [ ] <action item ที่ต้องทำ>

---

## Related

- <link to related specs, docs, or previous discussions>
```

---

## Workflow
When this command completes, include this section in your output:

```
## Workflow Output
artifact_path: {path to discussion file}
card_status: completed
target_column: backlog
suggested_next: /chore '{artifact_path}'
mode: create
```

## After Writing

Report the file path and a 2-line summary of the discussion outcome:

```
File: discussion/{filename}.md

Summary:
- Decision: <1 sentence>
- Next: <1 sentence action>
```
