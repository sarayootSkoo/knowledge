# Stuck Orders API — Include Not-Stuck Filter

**Date:** 06-03-2026 14:44
**Category:** backend
**Type:** feature
**Status:** Done
**Branch:** develop

---

## Summary

เพิ่ม `includeNotStuck` parameter ให้ Stuck Orders API (`/support/stuck-orders/list` และ `/support/stuck-orders/stats`) เพื่อให้ Support team ดู orders ทั้งหมด (ทั้ง stuck และ not stuck) ในหน้าเดียวกันได้ พร้อมเพิ่ม `isStuck` boolean field ใน response และ `notStuckCount` ใน stats endpoint

---

## Details

### What Changed

| File | Description |
|------|-------------|
| `src/modules/oms-orders-support/dtos/stuck-order-list.dto.ts` | เพิ่ม `includeNotStuck` query param (boolean, default false), เพิ่ม `isStuck` field ใน `StuckOrderSummaryDto`, เพิ่ม `notStuckCount` ใน `StuckOrdersStatsDto`, ปรับ `priority` เป็น nullable |
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | เพิ่ม `includeNotStuck` ใน `FindStuckOrdersOptions`, bypass time threshold เมื่อ true, เพิ่ม `is_stuck` computed column ผ่าน SQL CASE, เพิ่ม notStuckCount query ใน stats |
| `src/modules/oms-orders-support/services/support-stuck-orders.service.ts` | ส่ง `includeNotStuck` ไป repository, map `is_stuck` จาก DB row, set `priority: null` สำหรับ not-stuck orders |
| `src/modules/oms-orders-support/controllers/support-stuck-orders.controller.ts` | เพิ่ม `includeNotStuck` query param ให้ stats endpoint |

### Why

Support team ต้องการเปรียบเทียบ orders ปกติ vs orders ที่ค้าง ในหน้าเดียวกัน เพื่อตรวจสอบว่า order ที่เคย stuck กลับมาปกติแล้วหรือยัง — ช่วยให้ทำงาน monitor ได้ง่ายขึ้น

### Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| `is_stuck` computed at SQL level | ใช้ SQL CASE WHEN กับ `isStuckSeconds` replacement | ให้ consistent กับ threshold ที่ใช้ filter ไม่ต้อง recompute ใน JS |
| Stats ยังนับเฉพาะ stuck orders | ไม่เปลี่ยน meaning ของ total/critical/high/medium/low | Backward compatible — เพิ่มแค่ `notStuckCount` เป็น field ใหม่ |
| `priority: null` สำหรับ not-stuck | Return null แทนที่จะคำนวณ priority | ตาม spec — orders ที่ไม่ stuck ไม่ต้องมี priority level |
| Default `includeNotStuck=false` | Backward compatible behavior | API เดิมที่ไม่ส่ง param ยังทำงานเหมือนเดิมทุกประการ |

---

## Technical Notes

- `isStuckSeconds` replacement param ถูกส่งเสมอ (ไม่ขึ้นกับ `bypassTimeFilter`) เพราะ SQL CASE ของ `is_stuck` column ต้องใช้ threshold ในทุกกรณี
- เมื่อ `includeNotStuck=true` + `priority=HIGH` filter → จะได้เฉพาะ stuck orders ที่เป็น HIGH เพราะ not-stuck orders มี `computed_priority = 'LOW'` (จาก CASE ELSE) แต่จะถูก map เป็น `null` ใน service layer
- `notStuckCount` ใน stats ใช้ inverted time condition (>=) แทน (<) เพื่อนับ orders ที่ไม่ค้าง
- Test: 243/245 passed — 2 failures เป็น pre-existing issue ใน `tracking.fulfillment.service.spec.ts` (missing `findOneLasted` mock)

### Code References

| File | Description |
|------|-------------|
| `dtos/stuck-order-list.dto.ts:174-185` | `includeNotStuck` param definition กับ Transform decorator |
| `repositories/support-view.repository.ts:624` | `bypassTimeFilter` logic รวม `includeNotStuck` |
| `repositories/support-view.repository.ts:717-726` | `is_stuck` SQL CASE expression ใน SELECT |
| `repositories/support-view.repository.ts:949-968` | `notStuckCount` separate query ใน stats |
| `services/support-stuck-orders.service.ts:235-238` | `isStuck` mapping logic กับ nullable priority |

---

## Impact

- **Risk:** Low
- **Breaking Changes:** None — default behavior ไม่เปลี่ยน, เพิ่มแค่ fields ใหม่
- **Affected Areas:** Support stuck orders page (list + stats), Frontend จะเพิ่ม toggle filter ภายหลัง

---

## Follow-up

- [x] Frontend (oms-webapp): เพิ่ม "Show all orders" toggle ในหน้า `/support/stuck-orders`
- [x] Frontend: เพิ่ม `isStuck` badge (green "Active" vs red "Stuck") ในตาราง
- [x] Frontend: แสดง `notStuckCount` ใน stats card เมื่อ toggle เปิด (mobile: emerald "OK" badge, desktop: "Active (Not Stuck)" count)
- [ ] Performance monitoring: ตรวจสอบ response time เมื่อ `includeNotStuck=true` กับ data จำนวนมาก

---

## Related

- Spec: `backend-stuck-orders-include-not-stuck.md` (root of oms-order repo)
- Existing docs: `docs/OMS_ORDERS_SUPPORT.md`
