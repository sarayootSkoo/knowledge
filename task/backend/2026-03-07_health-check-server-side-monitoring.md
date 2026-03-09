# Health Check Server-Side Monitoring (Uptime Kuma Style)

**Date:** 07-03-2026 10:23
**Category:** backend
**Type:** plan, design
**Status:** Planned
**Branch:** develop

---

## Summary

วางแผน migrate health monitoring จาก client-side polling (browser localStorage) ไปเป็น server-side scheduled job ใน oms-order backend เพื่อให้เก็บ health history 24/7 โดยไม่ต้องเปิด browser — แสดงผลแบบ Uptime Kuma ใน Admin Settings page

---

## Details

### Current Architecture (Client-Side)

```
Browser (Admin page open)
  → setInterval(60s) x 4 endpoints
  → save to localStorage (max 90 entries)
  → render UptimeBar
  → close browser = stop monitoring
```

**ข้อจำกัด**:
- ปิด browser = หยุด monitor
- เปลี่ยนเครื่อง = ไม่มี history
- localStorage เก็บได้แค่ 90 entries (~90 นาที)
- ไม่มี alerting

### Proposed Architecture (Server-Side)

```
oms-order (Backend) — runs 24/7
  @Cron('*/60 * * * * *')
  → self-check: DB (SELECT 1+1), Kafka (producer/consumer ping), App health
  → INSERT INTO health_checks table
  → Optional: alert webhook when status changes

oms-webapp (Frontend)
  Admin page opens
  → GET /support/admin/health-history?hours=24
  → render UptimeBar from DB data
  → poll latest status every 60s (lightweight)
```

### Why

- Support team ต้องการดู uptime history ย้อนหลัง 24h/7d/30d
- ต้องการรู้ว่า system down เมื่อไหร่ แม้ไม่มีคนเปิด dashboard
- ลด network traffic จาก browser — ไม่ต้อง poll 4 endpoints ทุก 60s

### Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Storage | PostgreSQL table `health_checks` | อยู่ใน existing DB, query ง่าย, retention ง่าย |
| Scheduling | NestJS `@Cron` decorator | Built-in, ไม่ต้อง external scheduler |
| Check interval | 60 seconds | Balance ระหว่าง freshness กับ DB size |
| Retention | 30 days auto-cleanup | Cron job ลบ records > 30 days |
| Alert | Optional webhook (LINE/Slack) | Phase 2 — เมื่อ status เปลี่ยนจาก HEALTHY → ERROR |

---

## Technical Notes

### Backend: Database Schema

```sql
CREATE TABLE health_checks (
  id SERIAL PRIMARY KEY,
  service VARCHAR(50) NOT NULL,      -- 'app' | 'database' | 'kafka-consumer' | 'kafka-producer'
  status VARCHAR(20) NOT NULL,       -- 'HEALTHY' | 'DEGRADED' | 'ERROR'
  latency_ms INT,                    -- response time in ms
  meta JSONB,                        -- { broker, schema, error, etc. }
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_health_service_time ON health_checks (service, checked_at DESC);

-- Partition by month for easy retention (optional)
```

**Storage estimate**: 4 services x 1 check/min x 60 min x 24 hr x 30 days = ~172,800 rows/month (~10MB)

### Backend: NestJS Service

```typescript
// health-monitor.service.ts
@Injectable()
export class HealthMonitorService {
  @Cron('*/60 * * * * *') // every 60 seconds
  async checkAll() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkKafkaConsumer(),
      this.checkKafkaProducer(),
      this.checkAppHealth(),
    ])
    await this.healthCheckRepository.insert(checks.map(toEntity))
  }

  @Cron('0 3 * * *') // daily at 3am
  async cleanupOldChecks() {
    await this.healthCheckRepository
      .createQueryBuilder()
      .delete()
      .where('checked_at < NOW() - INTERVAL :days DAY', { days: 30 })
      .execute()
  }
}
```

### Backend: API Endpoint

```
GET /support/admin/health-history
  ?service=all|app|database|kafka-consumer|kafka-producer
  &hours=24       (default 24, max 720 = 30 days)
  &granularity=1m|5m|1h  (optional — aggregate for long ranges)

Response:
{
  "services": {
    "app": {
      "current": "HEALTHY",
      "uptimePercent": 99.95,
      "checks": [
        { "status": "HEALTHY", "latencyMs": 12, "checkedAt": "2026-03-07T10:00:00+07:00" },
        ...
      ]
    },
    "database": { ... },
    "kafka-consumer": { ... },
    "kafka-producer": { ... }
  },
  "summary": {
    "overallStatus": "HEALTHY",
    "since": "2026-03-06T10:23:00+07:00",
    "totalChecks": 5760
  }
}
```

### Frontend: Admin Page Changes

```typescript
// แทนที่ 4 useEffect polling + localStorage
// ด้วย 1 API call + lightweight poll

const [healthHistory, setHealthHistory] = useState(null)

// Initial load — fetch 24h history from DB
useEffect(() => {
  fetch('/api/support/admin/health-history?hours=24')
    .then(r => r.json())
    .then(setHealthHistory)
}, [])

// Poll latest status only (1 lightweight call vs 4 heavy calls)
useEffect(() => {
  const id = setInterval(async () => {
    const res = await fetch('/api/support/admin/health-history?hours=0.02') // last ~1 min
    const data = await res.json()
    setHealthHistory(prev => mergeLatest(prev, data))
  }, 60_000)
  return () => clearInterval(id)
}, [])
```

### Retention Config (Master Config)

เพิ่ม config key ใน master_configs เพื่อให้ปรับได้จาก UI:

```json
{
  "configKey": "HEALTH_MONITOR_CONFIG",
  "value": {
    "enabled": true,
    "checkIntervalSeconds": 60,
    "retentionDays": 30,
    "alertWebhookUrl": "",
    "alertOnStatusChange": true
  }
}
```

Admin page เพิ่ม section "Health Monitor Settings" สำหรับ toggle enabled, ปรับ retention days, ตั้ง webhook URL

### Code References

| File | Description |
|------|-------------|
| `app/support/admin/page.tsx` | Current client-side polling (lines 606-738) — จะ refactor |
| `app/api/support/admin/database-health/route.ts` | Existing health proxy — จะถูกแทนที่ด้วย history API |
| `app/api/support/admin/kafka-consumer-health/route.ts` | Existing Kafka health proxy |
| `app/api/support/admin/kafka-producer-health/route.ts` | Existing Kafka health proxy |
| `app/api/support/dashboard/health/route.ts` | Existing app health proxy |
| `lib/support-api-config.ts` | Endpoint config — เพิ่ม health-history endpoint |

---

## Impact

- **Risk:** Medium — ต้องเพิ่ม DB table + cron job ใน backend
- **Breaking Changes:** None — frontend จะ fallback ไป client-side polling ถ้า history API ไม่พร้อม
- **Affected Areas:** oms-order (new service + migration), oms-webapp (Admin page refactor)

---

## Follow-up

- [ ] **Backend**: สร้าง DB migration สำหรับ `health_checks` table
- [ ] **Backend**: สร้าง `HealthMonitorService` with `@Cron` scheduled checks
- [ ] **Backend**: สร้าง `GET /support/admin/health-history` endpoint
- [ ] **Backend**: เพิ่ม `HEALTH_MONITOR_CONFIG` master config key
- [ ] **Backend**: Retention cleanup cron (daily)
- [ ] **Frontend**: Refactor Admin page จาก 4x polling + localStorage → 1x history API fetch
- [ ] **Frontend**: เพิ่ม Health Monitor Settings section ใน Admin page
- [ ] **Phase 2**: Alert webhook เมื่อ status change (LINE Notify / Slack / MS Teams)

---

## Related

- Admin Settings page: `app/support/admin/page.tsx`
- Existing health endpoints: `app/api/support/admin/*-health/`
- NestJS scheduling: `@nestjs/schedule` package
- Uptime Kuma reference: open-source monitoring tool for UX inspiration
