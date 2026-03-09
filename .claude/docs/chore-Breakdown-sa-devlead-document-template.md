# Chore: Design Breakdown Document Template for SA & Dev Lead Roles

## Metadata
adw_id: `Breakdown`
prompt: `Role : System analyst and Dev Lead`

## Chore Description
ออกแบบเอกสาร **Breakdown Template** สำหรับ 2 บทบาทหลัก:

1. **System Analyst (SA)** — วิเคราะห์ requirements จาก Confluence/Jira specs แล้วแปลงเป็น User Stories พร้อม Acceptance Criteria, Business Rules, Data Flow
2. **Dev Lead** — รับ User Stories จาก SA แล้ว break down เป็น Tasks / SubTasks พร้อม Story Points, Dependencies, Definition of Done, และคำอธิบายรายละเอียดสำหรับ Junior Developer

เอกสารนี้จะถูกใช้เป็น **เทมเพลตมาตรฐาน** ในการ breakdown งานของทีม โดยอ้างอิง:
- Input: Confluence pages, Sequence diagrams, Screenshots, Jira tickets
- Output: Structured work items ที่ Junior Dev สามารถ implement ได้ทันที

### ตัวอย่าง Context ที่ใช้จริง (Sprint 5)
จาก `specs/design/sprint5/sp5.md` — input เป็น list ของ features (Enhance/New) พร้อม Confluence links เช่น:
- `[Enhance] Item Substitute` — POST /v1/orders/substitute
- `[New] Order Cancel` — POST /v1/orders/{{ORDER_ID}}/cancel
- `[New] Reminder Notification` — Pickup Reminder +3 days

ต้องการ template ที่แปลง input แบบนี้ให้เป็นงานที่ชัดเจน มี reference card IDs และอธิบาย acceptance/DoD อย่างละเอียด

---

## Relevant Files
ใช้ไฟล์เหล่านี้เป็นข้อมูลอ้างอิง:

- `.claude/commands/breakdown.md` — เทมเพลต Breakdown command ปัจจุบัน (จะปรับปรุง)
- `.claude/commands/feature.md` — เทมเพลต Feature planning (reference pattern)
- `.claude/commands/chore.md` — เทมเพลต Chore planning (reference pattern)
- `specs/design/sprint5/sp5.md` — ตัวอย่าง input จริงจาก Sprint 5
- `specs/chore-SA-support-api-specification.md` — ตัวอย่าง SA output (API spec)
- `docs/BUSINESS_OVERVIEW.md` — Business flow reference
- `docs/STATUS_REFERENCE.md` — Status codes reference
- `docs/DATABASE_SCHEMA.md` — Database schema reference

### New Files
- `.claude/commands/breakdown.md` — **แก้ไข** ให้รองรับ SA & Dev Lead roles ด้วย template ใหม่
- `docs/BREAKDOWN_GUIDE.md` — **สร้างใหม่** คู่มือการใช้งาน Breakdown Template พร้อมตัวอย่างจริง

---

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. วิเคราะห์ Breakdown Command ปัจจุบัน
- อ่าน `.claude/commands/breakdown.md` ทำความเข้าใจโครงสร้างปัจจุบัน
- อ่าน `specs/design/sprint5/sp5.md` เพื่อเข้าใจ input จริง
- ระบุจุดที่ขาด: ไม่มี User Stories, ไม่มี Acceptance Criteria, ไม่มี DoD, ไม่มี SubTask level

### 2. ออกแบบ Section Structure สำหรับ SA Role
SA ต้องผลิต output ดังนี้:

#### 2.1 Source Analysis Section
```md
## Source Analysis
### Sources Reviewed
| # | Source | Type | Link |
|---|--------|------|------|
| 1 | Impact Analysis I/A | Confluence | [link] |
| 2 | API Specification | Confluence | [link] |
| 3 | Sequence Diagram | Image | [attached] |

### Scope Summary
<สรุปขอบเขตงานทั้งหมดจาก sources ที่อ่าน>

### Assumptions
- <assumption ที่ SA ตั้งขึ้นจาก specs ที่ไม่ชัดเจน>
```

#### 2.2 User Stories Section
```md
## User Stories

### US-001: <User Story Title>
**Epic**: <Epic/Feature ที่เกี่ยวข้อง>
**Priority**: Critical / High / Medium / Low
**Ref Card**: <Jira Card ID ถ้ามี>

**As a** <role>
**I want to** <action>
**So that** <benefit>

#### Business Rules
- BR-001: <business rule>
- BR-002: <business rule>

#### Acceptance Criteria (Given/When/Then)
- **AC-001**: Given <precondition>, When <action>, Then <expected result>
- **AC-002**: Given <precondition>, When <action>, Then <expected result>

#### Data Flow
```
Input → Processing → Output
<อธิบาย data flow ของ user story นี้>
```

#### Edge Cases & Error Scenarios
- EC-001: <edge case + expected behavior>

#### Related Specs
- Confluence: <link>
- API Spec: <link>
```

#### 2.3 Impact Analysis Section
```md
## Impact Analysis

### Affected Systems
| System | Impact | Description |
|--------|--------|-------------|
| OMS Order | Direct | <description> |
| Kafka | Direct | <new topic or message change> |
| Braze | Indirect | <notification template change> |

### Affected APIs
| API | Method | Change Type | Description |
|-----|--------|-------------|-------------|
| /v1/orders/substitute | POST | Enhance | <description> |

### Database Changes
| Table | Change | Description |
|-------|--------|-------------|
| order_lines | ALTER | <new column or index> |

### Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| <risk> | High/Med/Low | High/Med/Low | <mitigation> |
```

### 3. ออกแบบ Section Structure สำหรับ Dev Lead Role
Dev Lead รับ User Stories จาก SA แล้วผลิต output ดังนี้:

#### 3.1 Technical Design Section
```md
## Technical Design

### Architecture Decision Records (ADR)
| # | Decision | Options Considered | Chosen | Rationale |
|---|----------|-------------------|--------|-----------|
| ADR-001 | <decision topic> | A, B, C | A | <why> |

### Component Diagram
<อธิบาย components ที่เกี่ยวข้อง>

### Sequence Flow
<อธิบาย sequence ของ technical implementation>
```

#### 3.2 Task Breakdown Section
```md
## Task Breakdown

### US-001: <User Story Title>

#### Task T-001: <Task Name>
**Type**: create / update / refactor / test
**Story Point**: <1/2/3/5/8>
**Assignee Level**: Junior / Mid / Senior
**Ref Card**: <Jira SubTask ID>
**Blocked By**: - (or T-xxx)
**Sprint**: <sprint number>

**Description (สำหรับ Developer)**:
<อธิบายงานอย่างละเอียดให้ Junior Dev เข้าใจ>
- ไฟล์ที่ต้องแก้: `src/modules/.../xxx.ts`
- Function ที่เกี่ยวข้อง: `methodName()`
- Pattern ที่ต้องใช้: Builder / Transformer / Repository
- ตัวอย่าง code ที่คล้ายกัน: `src/modules/.../yyy.ts` (line xx-yy)

**Definition of Done (DoD)**:
- [ ] Code implemented ตาม spec
- [ ] Unit tests ครอบคลุม Happy Path + Edge Cases
- [ ] Code review ผ่าน
- [ ] Build สำเร็จ ไม่มี lint errors
- [ ] PR created พร้อม description ที่ชัดเจน

**Sub-Tasks**:
| # | SubTask | SP | Description |
|---|---------|-----|-------------|
| ST-001-1 | <subtask name> | 1 | <detail> |
| ST-001-2 | <subtask name> | 1 | <detail> |
```

#### 3.3 Task Dependency Graph
```md
## Task Dependencies

### Dependency Graph
```
T-001 (DB Migration)
  └── T-002 (Model + Repository)
        ├── T-003 (Service Layer)
        │     └── T-005 (Controller)
        └── T-004 (Transformer)
              └── T-006 (Integration Test)
```

### Critical Path
T-001 → T-002 → T-003 → T-005 → T-006 (estimated: X SP)
```

#### 3.4 Dev Lead Notes & Recommendations
```md
## Dev Lead Notes

### Technical Recommendations
- <recommendations สำหรับทีม>

### Open Questions for SA/PM
- <questions ที่ต้องถาม SA/PM ก่อน implement>

### Non-Functional Requirements
- Performance: <requirements>
- Security: <requirements>
- Monitoring: <requirements>

### Sprint Capacity Planning
| Sprint | Total SP | Available SP | Buffer |
|--------|----------|-------------|--------|
| S5     | XX       | YY          | ZZ     |
```

### 4. ปรับปรุง `.claude/commands/breakdown.md`
- แก้ไขไฟล์ `.claude/commands/breakdown.md`
- เพิ่ม Role variable (SA / DevLead / Both)
- ปรับ Output Format ให้รวม sections จาก Step 2 และ Step 3
- เพิ่ม Task Estimation Guide พร้อม Sub-Task level
- เพิ่ม Definition of Done template
- เพิ่ม Acceptance Criteria format (Given/When/Then)
- รักษา backward compatibility กับ format เดิม

#### Template ใหม่ที่ต้องใส่ใน breakdown.md:

```md
# Design & Business Breakdown

Analyze design and business specifications, then break down work items.

## Variables
sprint: $1
sources: $2
context: $3

## Instructions
- Read and interpret all provided sources (Confluence, Jira, Images, Specs)
- Assume incomplete specs — explicitly call out assumptions
- Create output in `specs/design/{sprint}/` directory

## Output Format

### Part 1: SA Analysis (System Analyst)
<Source Analysis + User Stories + Impact Analysis + Risk>

### Part 2: Dev Lead Breakdown
<Technical Design + Task Breakdown with SubTasks + Dependencies + DoD>

### Part 3: Summary
<Sprint Planning + Capacity + Critical Path + Open Questions>
```

### 5. สร้าง `docs/BREAKDOWN_GUIDE.md`
- สร้างคู่มือการใช้งาน Breakdown Template
- อธิบาย workflow: Input → SA Analysis → Dev Lead Breakdown → Output
- ตัวอย่างจริงจาก Sprint 5 (Item Substitute, Order Cancel, Reminder Notification)
- อธิบายแต่ละ section พร้อม tips
- เพิ่ม Story Point estimation guide ที่ละเอียดกว่าเดิม:

| SP | Description | Time Estimate | Example |
|----|-------------|---------------|---------|
| 1  | แก้ config, เพิ่ม constant, simple fix | < 2 ชม. | เพิ่ม enum value |
| 2  | CRUD ง่าย, เพิ่ม field | 2-4 ชม. | เพิ่ม column + migration |
| 3  | Logic ปานกลาง, multiple files | 4-8 ชม. | สร้าง transformer ใหม่ |
| 5  | Cross-module, complex logic | 1-2 วัน | สร้าง workflow service |
| 8  | High complexity, design needed | 2-3 วัน | Notification system ใหม่ |
| 13 | Epic-level, ต้อง split | 1 sprint | ควร break down เพิ่ม |

### 6. Validate & Review
- ตรวจสอบว่า template ครอบคลุม input format จาก `sp5.md`
- ตรวจสอบว่า template สามารถ reference Jira cards ได้
- ตรวจสอบว่า DoD และ Acceptance Criteria ชัดเจนพอสำหรับ Junior Dev
- ตรวจสอบว่า Sub-Task level มีรายละเอียดเพียงพอ (ระบุไฟล์, function, pattern)
- ทดลองรัน `/breakdown` ด้วย input จาก Sprint 5 เพื่อตรวจสอบ output

---

## Validation Commands
Execute these commands to validate the chore is complete:

- `cat .claude/commands/breakdown.md` — ตรวจสอบว่า template มี SA + Dev Lead sections
- `cat docs/BREAKDOWN_GUIDE.md` — ตรวจสอบว่าคู่มือมี examples และ estimation guide
- `ls specs/design/sprint5/` — ตรวจสอบว่ามี example output
- ทดลองรัน: `/breakdown S5 "specs/design/sprint5/sp5.md" "Backend Service"` — ตรวจสอบ output format

---

## Notes

### Design Principles
1. **Two-Pass Workflow**: SA ทำ analysis ก่อน → Dev Lead ทำ breakdown ทีหลัง (แต่ทำพร้อมกันใน 1 document ก็ได้)
2. **Junior-Friendly**: ทุก Task/SubTask ต้องมีรายละเอียดพอให้ Junior Dev implement ได้โดยไม่ต้องถามเพิ่ม
3. **Traceable**: ทุก Task ต้อง trace กลับไปหา User Story → Confluence Spec → Jira Card ได้
4. **OMS-Specific**: Template ต้องเข้าใจ domain เฉพาะ (Order Status Flow, Kafka Topics, Outbox Pattern, Transformer/Builder patterns)

### Integration with Existing ADWs
- `/breakdown` → สร้าง breakdown document
- `/implement` → ใช้ breakdown document เป็น input เพื่อ implement task

### Future Enhancements
- เชื่อม Jira API เพื่อสร้าง cards อัตโนมัติ
- เชื่อม Confluence API เพื่อดึง specs อัตโนมัติ
- สร้าง burndown chart จาก SP estimates
