# Discussion: Demo Dashboard — 3D Globe HUD & Vector Knowledge Map

**Date:** 04-03-2026 14:46
**Context:** ต้องการสร้าง demo dashboard 2 แบบ เพื่อแสดง IoT realtime data บน 3D globe และ visualize vector embeddings เป็น knowledge map
**Participants:** Developer + AI Reviewer
**Status:** Open — รอเลือกว่าจะเริ่มสร้าง demo ตัวไหนก่อน

---

## Background

ระหว่าง prime session ของ knowledge center มีการเสนอไอเดีย demo dashboard 2 รูปแบบ:
1. **3D Globe Dashboard** สไตล์ Quantum Oracle HUD — แสดงข้อมูล IoT sensor (PM2.5, PM10, อุณหภูมิ, ความชื้น) บนลูกโลก 3D แบบ realtime
2. **Vector Database Knowledge Map** — แปลงข้อมูลเป็น vector embeddings แล้ว plot เป็น constellation map ใน 2D/3D

เป้าหมายคือสร้าง working demo ที่แสดงศักยภาพของแต่ละ approach

---

## Discussion Points

### Question 1: เลือก tech stack อะไรสำหรับ 3D Globe Dashboard?

**Context:**
ต้องการ globe ที่หมุนได้ วาง sensor node ตาม lat/lng พร้อม HUD overlay สไตล์ sci-fi และรับข้อมูล IoT แบบ realtime

**Analysis:**

| Option | Pros | Cons |
|--------|------|------|
| **Three.js (raw)** | ควบคุมได้เต็มที่, flexible สุด | ต้องเขียน sphere geometry + lat/lng math เอง, boilerplate เยอะ |
| **globe.gl** (wrap Three.js) | ลด boilerplate มหาศาล, lat/lng → 3D ให้อัตโนมัติ, point/arc/label built-in | customization อาจถูกจำกัดในบาง case |
| **CesiumJS** | แม่นยำระดับ GIS, terrain data | หนักมาก, overkill สำหรับ demo |

**HUD Overlay:**

| Option | Pros | Cons |
|--------|------|------|
| **Pure CSS** (`position: fixed` + `backdrop-filter`) | เบา, ไม่ต้องพึ่ง library, sci-fi effect ทำได้ด้วย `box-shadow` + glow | ต้อง design เอง |
| **React + Tailwind** | component reuse, responsive ง่าย | อาจ overkill สำหรับ static HUD panels |

**Realtime Data:**

| Option | Pros | Cons |
|--------|------|------|
| **MQTT over WebSocket** (`mqtt.js`) | standard IoT protocol, connect ตรงจาก browser ได้ | ต้องมี MQTT broker (Mosquitto / HiveMQ) |
| **WebSocket (raw / Socket.IO)** | simple, ไม่ต้องมี MQTT broker | ไม่ใช่ IoT standard, ต้องเขียน relay server |

**Decision:** แนะนำ **globe.gl** + **Pure CSS HUD** + **MQTT over WebSocket** — เป็น sweet spot ระหว่างความง่ายและ visual impact

---

### Question 2: เลือก tech stack อะไรสำหรับ Vector Knowledge Map?

**Context:**
ต้องการ embed ข้อมูลเป็น vector แล้วลด dimension ด้วย UMAP/t-SNE แล้ว plot เป็น constellation-style graph

**Analysis:**

**Backend (Embedding + Dimension Reduction):**

| Option | Pros | Cons |
|--------|------|------|
| **Python** (`umap-learn` + `scikit-learn`) | standard pipeline, documentation เยอะ, model เลือกได้หลากหลาย | ต้องรัน Python server แยก |
| **Node.js** (`@xenova/transformers`) | อยู่ใน JS ecosystem เดียวกัน | UMAP library ใน JS ยังไม่ mature เท่า Python |

**Frontend (Visualization):**

| Option | Pros | Cons |
|--------|------|------|
| **D3.js** (force-directed / scatter) | 2D constellation ทำได้สวย, interactive, lightweight | ไม่รองรับ 3D natively |
| **Three.js** (3D scatter) | หมุน 3D ได้, immersive | complex กว่า, อาจไม่จำเป็นสำหรับ knowledge map |
| **deck.gl** (WebGL scatter) | รองรับหลายพัน points ได้ลื่น, map overlay ได้ | learning curve สูงกว่า D3 |

**Decision:** แนะนำ **Python backend** (pre-compute embeddings → UMAP → export JSON) + **D3.js frontend** (2D constellation scatter plot) — เร็วที่สุดในการสร้าง demo ที่ดูดี

---

### Question 3: ควรเริ่มสร้าง demo ตัวไหนก่อน?

**Context:**
ทั้ง 2 dashboard มีความซับซ้อนต่างกัน ต้องเลือกว่าจะ focus ตัวไหนก่อน

**Analysis:**

| Dashboard | ความซับซ้อน | Visual Impact | ความต้องการ Infrastructure |
|-----------|:-----------:|:------------:|:-------------------------:|
| 3D Globe HUD | ปานกลาง | สูงมาก | ต้องมี MQTT broker |
| Vector Knowledge Map | สูง (ต้อง embed + UMAP) | สูง | ต้องมี Python + AI model |

**Decision:** ยังไม่ตัดสินใจ — รอ developer เลือก

---

## Key Insights

- **globe.gl** ลดงาน Three.js boilerplate ได้ 70-80% สำหรับ globe + point visualization — ไม่ต้องเขียน sphere geometry หรือ lat/lng conversion เอง
- **MQTT over WebSocket** เป็นทางเลือกที่ดีที่สุดสำหรับ IoT data ใน browser เพราะเป็น standard protocol และ `mqtt.js` รองรับได้โดยตรง
- **UMAP ดีกว่า t-SNE** สำหรับ knowledge map เพราะรักษา global structure ของ data ได้ดีกว่า (t-SNE เน้น local structure)
- สำหรับ demo ทั้ง 2 แบบ ควร pre-compute data ไว้เป็น JSON เพื่อให้ frontend load ได้เร็ว แล้วค่อยต่อ realtime ทีหลัง
- CSS `backdrop-filter: blur()` + `box-shadow` สี neon ให้ sci-fi HUD effect ได้โดยไม่ต้องใช้ canvas overlay เพิ่ม

---

## Code References

| File | Line | Relevance |
|------|------|-----------|
| `knowledge/.vitepress/config.ts` | — | VitePress config ปัจจุบัน — ถ้าจะ embed demo เข้า knowledge center |
| `knowledge/package.json` | — | dependencies ปัจจุบัน — อาจต้องเพิ่ม three.js / d3 |
| `knowledge/ARCHITECTURE.md` | — | architecture diagrams — vector map อาจ visualize ข้อมูลจากนี้ |

---

## Action Items

- [ ] เลือกว่าจะสร้าง demo ตัวไหนก่อน (3D Globe หรือ Vector Map)
- [ ] ถ้าเลือก Globe → เตรียม MQTT broker (Mosquitto local หรือ HiveMQ Cloud free tier)
- [ ] ถ้าเลือก Vector Map → เตรียม Python environment + เลือก embedding model (OpenAI / local model)
- [ ] ตัดสินใจว่าจะ host demo เป็น standalone app หรือ embed ใน VitePress knowledge center
- [ ] หา sample data สำหรับ demo (IoT sensor data / knowledge documents)

---

## Related

- `knowledge/ARCHITECTURE.md` — system architecture diagrams ที่อาจใช้เป็น data source สำหรับ vector map
- `knowledge/.vitepress/config.ts` — VitePress config ถ้าจะ integrate demo เข้า knowledge site
- ADR-001: `knowledge/decisions/001-kafka-event-driven.md` — event-driven pattern ที่อาจเกี่ยวข้องกับ realtime data flow
