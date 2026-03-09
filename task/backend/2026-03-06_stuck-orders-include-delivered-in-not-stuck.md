# Stuck Orders API — Include Delivered Orders When includeNotStuck=true

**Date:** 06-03-2026 15:30
**Category:** backend
**Type:** bugfix
**Status:** Done
**Branch:** develop

---

## Summary

เมื่อใช้ `includeNotStuck=true` ผู้ใช้คาดว่าจะเห็น order ทุกสถานะ (รวม Delivered, Cancelled) แต่ query มี hardcoded status exclusion ที่ line 637 ของ `support-view.repository.ts` ทำให้ orders ที่สถานะเป็น terminal states (Delivered, Cancelled, Returned ฯลฯ) ถูกตัดออกเสมอ แม้ค้นหาด้วย orderId ตรง ๆ ก็ไม่เจอ

---

## Details

### What Changed
- `support-view.repository.ts` → `findStuckOrders()`: status exclusion ถูก push เฉพาะเมื่อ `!includeNotStuck && !orderId`, empty conditions ใช้ `1=1` fallback
- `support-view.repository.ts` → `getStuckOrdersStats()`: status exclusion ถูก push เฉพาะเมื่อ `!includeNotStuck`
- `support-view.repository.ts` → `notStuckCount` subquery: ลบ status exclusion ออก เพื่อนับรวม delivered orders

### Why
Support team ต้องการค้นหา order ที่เคย stuck แต่ตอนนี้สถานะเป็น Delivered แล้ว เพื่อยืนยันว่า order กลับมาปกติ ปัจจุบัน UI มี toggle "All Orders" แต่ backend ยังตัด terminal states ออก ทำให้ feature ไม่สมบูรณ์

### Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| เมื่อไหร่ bypass status filter | เมื่อ `includeNotStuck=true` หรือค้นหาด้วย `orderId` | ผู้ใช้ที่ toggle "All Orders" หรือค้นหา orderId ตรง ๆ คาดว่าจะเห็นทุกสถานะ |
| Default behavior ไม่เปลี่ยน | `includeNotStuck=false` (default) ยังตัด terminal states เหมือนเดิม | Backward compatible |
| Stats endpoint | ควร bypass status filter เช่นกันเมื่อ `includeNotStuck=true` | เพื่อให้ `notStuckCount` นับรวม delivered orders ด้วย |

---

## Technical Notes

### Root Cause
`support-view.repository.ts` line 637 มี hardcoded condition:
```sql
"sub.order_status NOT IN ('Delivered', 'Partial Delivered', 'Cancelled', 'Returned', 'Pending Return')"
```
condition นี้ถูก push เข้า `conditions[]` array **เสมอ** ไม่ว่าจะส่ง `includeNotStuck=true` หรือค้นหาด้วย `orderId` ก็ตาม

### Fix Approach
เปลี่ยนให้ condition นี้ถูก push เฉพาะเมื่อ `!includeNotStuck && !orderId`:

```typescript
// Before (line 636-638)
const conditions: string[] = [
  "sub.order_status NOT IN ('Delivered', 'Partial Delivered', 'Cancelled', 'Returned', 'Pending Return')",
];

// After
const conditions: string[] = [];
if (!includeNotStuck && !orderId) {
  conditions.push(
    "sub.order_status NOT IN ('Delivered', 'Partial Delivered', 'Cancelled', 'Returned', 'Pending Return')",
  );
}
```

### Code References

| File | Line | Description |
|------|------|-------------|
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | 636-638 | Hardcoded status exclusion ใน `findStuckOrders()` |
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | ~829 | อาจมี status exclusion เดียวกันใน `findStuckOrderStats()` |
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | ~875 | อาจมี status exclusion ใน stats query อื่น |
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | 158 | `findStuckOrderById()` — อาจมีปัญหาเดียวกัน |
| `src/modules/oms-orders-support/repositories/support-view.repository.ts` | 230 | `findStuckOrdersByIds()` — อาจมีปัญหาเดียวกัน |

### Affected Methods (ต้องตรวจสอบทุกตัว)
1. `findStuckOrders()` (~line 600) — main list query **ต้องแก้**
2. `findStuckOrderStats()` (~line 870) — stats query **ต้องแก้**
3. `findStuckOrderById()` (~line 150) — single order lookup, ควร bypass เพื่อให้ Investigation page ทำงานได้
4. `findStuckOrdersByIds()` (~line 225) — batch lookup, ควร bypass เช่นกัน

---

## Impact

- **Risk:** Low — เปลี่ยนแค่ conditional push ของ WHERE clause
- **Breaking Changes:** None — default behavior (`includeNotStuck=false`) ไม่เปลี่ยน
- **Affected Areas:** Stuck orders list API, stats API, Frontend stuck orders page (ไม่ต้องแก้ frontend เพิ่ม)

---

## Follow-up

- [x] Backend: Bypass status exclusion ใน `findStuckOrders()` เมื่อ `includeNotStuck=true || orderId`
- [x] Backend: Bypass status exclusion ใน `getStuckOrdersStats()` เมื่อ `includeNotStuck=true`
- [x] Backend: ตรวจสอบ `findStuckOrderById()` — ไม่มี status filter อยู่แล้ว (OK)
- [x] Backend: ตรวจสอบ `findStuckOrdersByIds()` — method ไม่มีอยู่ (OK)
- [x] Backend: ลบ status exclusion จาก `notStuckCount` subquery เพื่อนับรวม delivered
- [ ] Backend: เพิ่ม test case — search delivered order with `includeNotStuck=true`
- [ ] Backend: ตรวจ performance — query ที่ไม่มี status exclusion อาจช้ากว่าเดิม (consider LIMIT guard)

---

## Related

- Previous task: `backend/2026-03-06_stuck-orders-include-not-stuck.md` (original includeNotStuck feature)
- Frontend: toggle "All Orders" already implemented in `app/support/stuck-orders/page.tsx`
- User report: search orderId `TFC432260305012935` (Delivered) returns 0 results even with `includeNotStuck=true`
