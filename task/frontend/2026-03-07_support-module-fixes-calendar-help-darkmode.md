# Support Module Fixes: CalendarAdvanceFilter, HelpPanel, Dark Mode

**Date:** 07-03-2026 10:23
**Category:** frontend
**Type:** bugfix, feature
**Status:** Done
**Branch:** develop

---

## Summary

แก้ไขหลายปัญหาใน Support module: (1) CalendarAdvanceFilter แสดงวันที่ผิด (อนาคต, startDate > endDate) ใน Data Management, Analytics, Ghost Logging (2) HelpPanel ไม่แสดงเนื้อหาบน deployed site เพราะ fs.readFileSync อ่านไฟล์ไม่ได้ใน Docker container (3) Login page dark mode ไม่สมบูรณ์ (4) เพิ่ม CalendarAdvanceFilter แทน date input ใน 4 pages

---

## Details

### What Changed

#### 1. CalendarAdvanceFilter Date Correctness (bugfix)

**ปัญหา**: Data Management แสดงวันที่ "2029-03-06 ~ 2027-03-06" — startDate อยู่หลัง endDate และเป็นอนาคต

**สาเหตุ 3 อย่าง**:
- `previewRange` state เริ่มเป็น `{ startDate: '', endDate: '' }` ไม่ sync กับ default TimeRange
- `toISOString().split('T')[0]` ใช้ UTC — ใน GMT+7 ก่อน 07:00 จะได้วันเมื่อวาน
- `resolveRelativeExpr()` ไม่รองรับ absolute ISO string — fallback เป็น `now` ทำให้ absolute range ผิด

**แก้ไข**:
- Initialize resolved date strings ด้วย `useState(() => timeRangeToDateStrings(DEFAULT_TIME_RANGE))`
- เปลี่ยนจาก `toISOString().split('T')[0]` เป็น local date formatting (`getFullYear/getMonth/getDate`)
- Handle `tr.type === 'absolute'` ด้วย `new Date(tr.from)` แทน `resolveRelativeExpr`
- เพิ่ม `if (e > now) e = now` cap endDate ไม่ให้เกินวันนี้ (backend reject future dates)
- เพิ่ม swap guard `if (startDate > endDate)` ทุก page

#### 2. HelpPanel Static File Fetch (bugfix)

**ปัญหา**: บน deployed site (oms-dev.central.co.th) HelpPanel แสดง "No help content available" ทุก section

**สาเหตุ**: API route ใช้ `fs.readFileSync(process.cwd() + '/help-docs/...')` แต่ Dockerfile copy เฉพาะ `.next/` กับ `public/` ไป runner — `help-docs/` ไม่มีใน container

**แก้ไข**: เปลี่ยน HelpPanel จาก fetch API route → fetch static file จาก `public/` ตรง:
```typescript
// เดิม: fetch(`/api/support/help/${section}`).then(r => r.json())
// ใหม่: fetch(`/help-docs/help-${section}.md`).then(r => r.text())
```

#### 3. CalendarAdvanceFilter Integration (feature)

เพิ่ม CalendarAdvanceFilter แทน `<Input type="datetime-local">` ใน 4 pages:
- Ghost Logging: แทน startDate/endDate inputs
- Analytics: แทน dateFrom/dateTo inputs + Refresh button
- Dashboard: แทน Refresh button (ใช้ `onRefresh` prop)
- Data Management: แทน date inputs ทั้ง 4 sections (Preview, Soft Delete, Purge, Log Viewer)

#### 4. Login Page Dark Mode (bugfix)

เพิ่ม `dark:` Tailwind variants ให้ background, title, subtitle, hints, footer ของ login page

#### 5. Help Documentation (feature)

- เพิ่ม `ghost-logging`, `view-config` เข้า `VALID_SECTIONS` ใน help API route
- สร้าง/update help docs 16 ไฟล์ ใน `help-docs/` และ `public/help-docs/`
- Rewrite help page (`app/support/help/page.tsx`) ให้ครอบคลุมทุก 15 support pages

### Why

- CalendarAdvanceFilter ให้ UX ดีกว่า native datetime-local (preset buttons, persistence, refresh)
- Help docs ต้องทำงานบน deployed site ไม่ใช่แค่ localhost
- Dark mode ต้อง consistent ทั้ง module

### Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Date formatting | Local `getFullYear/getMonth/getDate` | `toISOString()` ใช้ UTC ทำให้วันที่ผิดใน GMT+7 |
| Help content delivery | Static file from `public/` | `fs.readFileSync` ไม่ทำงานใน Docker runner |
| Future date cap | `if (e > now) e = now` | Backend reject "endDate cannot be in the future" |
| Default TimeRange | Module-level constant `DEFAULT_TIME_RANGE` | ใช้ร่วมกันทุก section, ไม่ recreate ทุก render |

---

## Technical Notes

### CalendarAdvanceFilter Pattern
```typescript
// Correct initialization — resolve dates on mount
const DEFAULT_TIME_RANGE: TimeRange = { type: 'relative', from: 'now-30d', to: 'now', label: 'Last 30 days' }
const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE)
const [resolved, setResolved] = useState(() => timeRangeToDateStrings(DEFAULT_TIME_RANGE))

// onChange handler
<CalendarAdvanceFilter
  value={timeRange}
  onChange={(v) => { setTimeRange(v); setResolved(timeRangeToDateStrings(v)) }}
  pageKey="/support/data-management/preview"
/>
```

### resolveRelativeExpr Limitation
`resolveRelativeExpr()` ใน `components/shared/calendar-advance/utils.ts` รองรับเฉพาะ:
- `"now"`, `"now/d"`, `"now/w"`, `"now/M"`, `"now/y"`
- `"now-7d"`, `"now+2h"` etc.
- **ไม่รองรับ** absolute ISO strings → fallback เป็น `now`

ต้อง check `tr.type === 'absolute'` ก่อนเรียก resolve

### Code References

| File | Description |
|------|-------------|
| `app/support/data-management/page.tsx` | CalendarAdvanceFilter x4, timeRangeToDateStrings fix, future date cap |
| `app/support/analytics/page.tsx` | CalendarAdvanceFilter, absolute range + local date fix |
| `app/support/ghost-logging/page.tsx` | CalendarAdvanceFilter, absolute range fix |
| `app/support/dashboard/page.tsx` | CalendarAdvanceFilter with onRefresh |
| `components/shared/HelpPanel.tsx` | Static file fetch from public/ |
| `app/api/support/help/[section]/route.ts` | Added ghost-logging, view-config to VALID_SECTIONS |
| `app/support/login/page.tsx` | Dark mode Tailwind variants |
| `app/support/help/page.tsx` | Complete rewrite with comprehensive docs |
| `public/help-docs/*.md` | 16 help documentation files |
| `components/shared/calendar-advance/utils.ts` | resolveRelativeExpr — reference only |

---

## Impact

- **Risk:** Low — UI fixes only, no backend changes
- **Breaking Changes:** None — HelpPanel fetch URL changed but same behavior
- **Affected Areas:** Support module (Data Management, Analytics, Ghost Logging, Dashboard, Help, Login)

---

## Follow-up

- [ ] Deploy และ verify HelpPanel ทำงานบน oms-dev.central.co.th
- [ ] Clear corrupted localStorage ของ CalendarAdvanceFilter ถ้า user ยังเจอวันที่ผิด
- [ ] พิจารณา clear localStorage key เก่า (`cal-adv:recent:/support/data-management/*`) ที่อาจมี corrupted values

---

## Related

- `components/shared/calendar-advance/` — CalendarAdvanceFilter component
- `hooks/use-recent-date-ranges.ts` — localStorage persistence for recent date ranges
- `Dockerfile` — explains why fs.readFileSync fails in production (line 51-52)
