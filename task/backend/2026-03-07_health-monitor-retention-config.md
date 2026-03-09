# Health Monitor Retention Config

**Date:** 07-03-2026 10:23
**Category:** backend
**Type:** design
**Status:** Planned
**Branch:** develop

---

## Summary

ออกแบบ retention config สำหรับ health_checks table — ให้ปรับได้จาก Admin UI ผ่าน master_configs โดยไม่ต้อง redeploy

---

## Details

### Retention Strategy

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| `retentionDays` | 30 | 7-365 | จำนวนวันที่เก็บ health check records |
| `checkIntervalSeconds` | 60 | 30-300 | ความถี่ในการ check |
| `aggregateAfterDays` | 7 | 1-30 | หลังจากกี่วันให้ aggregate เป็น hourly avg |

### Storage Calculation

```
Raw data (first 7 days):
  4 services x 1/min x 1440 min/day x 7 days = 40,320 rows

Aggregated data (day 8-30):
  4 services x 1/hour x 24 hr/day x 23 days = 2,208 rows

Total: ~42,528 rows/month (~2.5 MB)
```

### Cleanup Approach

```
Daily cron at 3:00 AM GMT+7:
1. DELETE FROM health_checks WHERE checked_at < NOW() - retentionDays
2. Aggregate: INSERT INTO health_checks_hourly
   SELECT service,
          date_trunc('hour', checked_at),
          mode() WITHIN GROUP (ORDER BY status),  -- most frequent status
          AVG(latency_ms),
          COUNT(*)
   FROM health_checks
   WHERE checked_at < NOW() - aggregateAfterDays
   GROUP BY 1, 2
3. DELETE raw records older than aggregateAfterDays
```

### Master Config Key

```json
{
  "configKey": "HEALTH_MONITOR_CONFIG",
  "category": "SUPPORT",
  "subCategory": "MONITORING",
  "value": {
    "enabled": true,
    "checkIntervalSeconds": 60,
    "retentionDays": 30,
    "aggregateAfterDays": 7,
    "alertWebhookUrl": "",
    "alertOnStatusChange": true,
    "services": ["app", "database", "kafka-consumer", "kafka-producer"]
  }
}
```

### Frontend Config UI

Admin Settings page เพิ่ม section:
- Toggle: Enable/Disable monitoring
- Slider: Check interval (30s - 5min)
- Slider: Retention period (7d - 365d)
- Slider: Aggregate after (1d - 30d)
- Input: Alert webhook URL
- Toggle: Alert on status change

---

## Impact

- **Risk:** Low — config changes only, actual implementation in separate task
- **Breaking Changes:** None
- **Affected Areas:** oms-order (master_configs), oms-webapp (Admin page)

---

## Follow-up

- [ ] Implement in `backend/2026-03-07_health-check-server-side-monitoring.md`

---

## Related

- `backend/2026-03-07_health-check-server-side-monitoring.md` — main implementation plan
- `lib/support-api-config.ts` — SUPPORT_API_ENDPOINTS
