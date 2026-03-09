# Chore: Knowledge Graph Power Management + Preset Overhaul + Category Colors

## Metadata
adw_id: `knowledge-graph`
prompt: `pnpm dev เพื่อ serve กินพลังงานแบตเตอรี่มากทำไม + preset + category colors`
datetime: `09-03-2026 06:20:43`
updated: `09-03-2026 07:04:22`

---

## Chore Description
Knowledge-graph app ใช้ 3 render loop พร้อมกัน (Three.js + Canvas 2D + 8 sub-effects) ที่วิ่ง 60fps ตลอดเวลา ทำให้กินแบตเตอรี่มาก เพิ่ม power management layer + ปรับ preset system ให้ควบคุม render loop ได้จริง + เพิ่ม interactive energy scale bar + ปรับสี category ให้ฉูดฉาด

## 13 Tasks

| # | Task | Files | Priority |
|---|------|-------|----------|
| 1 | powerState.ts — store + idle + persist | new file | P0 |
| 2 | Visibility API — หยุด render tab ซ่อน | GlobeCanvas | P0 |
| 3 | Frame throttle — Particle + Globe | ParticleBg, GlobeCanvas | P0 |
| 4 | แก้ applyPreset() — reset-first | presetState.ts | P0 |
| 5 | ENERGY_LADDER + interpolate logic | presetState.ts | P1 |
| 6 | ปรับ preset 4 ตัว + เพิ่ม Freeze | presetState.ts | P1 |
| 7 | ปรับ disableAll + reset | presetState.ts | P1 |
| 8 | Keyboard 0/- shortcuts | KeyboardShortcuts | P2 |
| 9 | Energy Scale Bar + smooth transition | PresetSystem.svelte | P1 |
| 10 | Preset buttons + energy dots/bar | PresetSystem.svelte | P1 |
| 11 | Live energy recalculation (Custom) | PresetSystem.svelte | P2 |
| 12 | Battery API auto-suggest | App.svelte | P2 |
| 13 | สี category ฉูดฉาด | constants.ts, graph-config.json | P1 |

## Energy Levels
```
⚪ Freeze     ~1%  CPU  — render loop หยุด, on-demand only
🟢 Low Energy ~10% CPU  — 30/15fps throttle
🟡 Medium     ~25% CPU  — ลด effects, pulse only
🟠 Normal     ~38% CPU  — default settings
🔴 High       ~50% CPU  — bloom + fireworks
🔴 MAX        ~75% CPU  — ทุกอย่างเปิดสูงสุด
```
