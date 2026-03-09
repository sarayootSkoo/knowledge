# Discussion: Knowledge Graph — Royal Theme Redesign

**Date:** 05-03-2026 13:08
**Context:** ปรับ theme ของ Knowledge Graph จาก Cyber/Sci-fi (cyan glow) เป็น Royal (navy + gold)
**Participants:** Developer + AI Reviewer
**Status:** Agreed

---

## Background

หลังจากสร้าง Knowledge Graph visualization ด้วย D3.js พร้อม Canvas-based glow rendering (ย้ายจาก SVG blur filters เพื่อ performance) — ต้องการปรับ visual theme ใหม่ให้เป็นสไตล์ "Royal" ตามตัวอย่าง Landing Oracle website ที่มี dark navy background, golden amber accent, และ colorful vibrant dots

---

## Discussion Points

### Question 1: Theme Style — เปลี่ยน theme ให้เป็นแบบไหน?

**Context:**
ผู้ใช้แชร์ screenshot ของ Landing Oracle website ที่มีสไตล์:
- Dark navy background (`~#1a1a2e`)
- Golden/amber accent สำหรับ headings และ highlights
- Colorful vibrant dots เป็น grid (orange, green, cyan, pink, purple, yellow)
- Clean card-style panels กับ subtle warm borders
- Typography สะอาดตา ไม่ใช่ neon glow

**Analysis:**

| Aspect | Current (Cyber) | Target (Royal) |
|--------|-----------------|----------------|
| Background | Pure black `#030508` | Dark navy `#1a1a2e` |
| Accent | Cyan `#00d4ff` | Golden `#d4a574` |
| Borders | Cyan glass | Warm amber subtle |
| Text | Cool gray | Warm light |
| Node colors | Cyan-centric | Multi-color vibrant |
| Vibe | Sci-fi / Matrix | Elegant / Premium |

**Decision:** เปลี่ยน CSS variables + category colors ทั้งหมดเป็น Royal palette โดยไม่แก้ functionality

### Question 2: Scope of Changes

**Decision:** แก้แค่ CSS variables, CATEGORIES colors, และ hardcoded color references — ไม่ต้องเปลี่ยน rendering pipeline (Canvas), layout logic, หรือ interactions

---

## Key Insights

- CSS custom properties ทำให้ theme change เป็นแค่เปลี่ยนค่า variables ~20 ค่า
- Canvas glow sprites rebuild อัตโนมัติจาก CATEGORIES colors — ไม่ต้องแก้ rendering code
- มี hardcoded `rgba(0,212,255,...)` หลายจุดใน CSS ที่ต้อง update ด้วยมือ

---

## Technical Evolution (Session Summary)

ตลอด session นี้ Knowledge Graph ผ่านการพัฒนา:

1. **V1: Static D3.js** — hardcoded 31 nodes
2. **V2: Auto-scan** — `build-graph-data.mjs` สแกน 133 markdown files
3. **V3: Features** — click, path, impact, minimap, search, export, preview
4. **V4: Cosmos style** — SVG glow filters (ช้า)
5. **V5: Canvas rendering** — pre-rendered sprites + additive blending (เร็ว)
6. **V6: Controls** — layout dropdown, theme toggle, glow slider
7. **V7: Royal theme** ← current

---

## Action Items

- [x] สร้าง discussion document
- [ ] Update CSS variables เป็น Royal palette
- [ ] Update CATEGORIES colors
- [ ] Update hardcoded color references
- [ ] Test all interactions ยังทำงานถูกต้อง

---

## Related

- `knowledge/demo/knowledge-graph.html` — main visualization file
- `knowledge/scripts/build-graph-data.mjs` — data scanner
- `knowledge/discussion/demo-dashboard-globe-vectormap-04_03_2026_14_46_26.md` — original dashboard discussion
