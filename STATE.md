# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม
> ✓ = ตรวจจริงแล้ว · ⚠️ = ยังเดา · อัปเดต 2026-06-14 · รายละเอียดเต็ม → `CLAUDE.md` + auto-memory `content-backlog.md`

---

## คืออะไร (1 บรรทัด)
🎬 **โรงงานทำคลิป** — แอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน (Remotion) ลง FB/YouTube Shorts เพื่อโปรโมทงานโหราฯ Horatad

## นโยบายคลิป (ตั้ง 14 มิ.ย. 2569)
- ✓ ปลายทาง **YouTube Shorts → แนวตั้ง 1080×1920 · 30fps**
- ✓ เพลง**มีลิขสิทธิ์ → คลิป ≤ 60 วินาที** (royalty-free ไม่ติด claim · ดู `SHORTS_BEST_PRACTICES.md`)

## สถานะ
- ✓ โปรเจกต์จริง = `epicycle\` (Remotion/JSX) · พรีวิว: `cd epicycle` → `npm run dev` → localhost:3000
- ✓ **เสร็จ+ขึ้น Drive (จัตุรัส 1080×1080):** Venus Phase · Moon Phase · Epicycle-vs-Helio (ปรับ 53วิ) · ชุด 14มิ.ย.: MercuryRetro · VenusBrightest · EclipseStory · Opposition
- ✓ **`Shorts60` (แนวตั้ง 1080×1920 · 59วิ · 1770f) — ใหม่ล่าสุด** → `out/shorts60.mp4` · reuse FullEpicycle (bg) + TextOverlay 7-beat (ทอเลมี → พระเคราะห์ทั้งเก้า → ไทย) · โครง: **intro เพลง 5วิ → พากย์ 13 ประโยค (เว้นวรรค 0.4วิ) → outro เพลงดังต่อจนครบ 59วิ** · **timeline จาก `src/timing.js` (source of truth — แก้ GAP/INTRO/DUR ที่เดียว)**
- ✓ **เสร็จ+ขึ้น Drive (แนวตั้ง 1080×1920):** **TwoSystemsVert** (Epicycle-vs-Helio · 59วิ · `out/twosystems-vert.mp4`) → `_FB&Social\260615 Epicycle vs Heliocentric Vert\` (15 มิ.ย. · mp4+docx) — คลิปแรกที่ใช้ reusable components (Caption/Narration/Music/Credit รับ prop `timing`)
- ▶ **กำลังทำ:** migrate คลิปเก่าทั้งหมดเป็นแนวตั้ง (MercuryRetro + TwoSystems แนวตั้งแล้ว · รออีก 5) + ใส่เพลง royalty-free 3 คลิปที่เงียบ
- ⏸ **ค้างเก่า:** EclipsePhase · Adhikamasa (prototype)
- ⚠️ ไม่มี git · โค้ดแยกอิสระจาก engine horatad

## งาน Shorts60 — ทำถึงไหน
- ✓ `src/scenes/Shorts60.jsx` · `src/TextOverlay.jsx` (title เฉพาะ hook/lineage/twist — ที่เหลือใช้ caption เล่า ลดเกะกะ) · `src/Caption.jsx` (subtitle เต็มล่าง sound-off) · `src/Credit.jsx` (end-card ALMAGEST·Ptolemy·Horatad ตอน outro) · `FullEpicycle` props `hideHeadline`+`speed` · `epicycle/setup5.js`
- ✓ render แล้ว (ตรวจภาพนิ่งทุก beat — title keyword + caption เต็ม เสริมกันไม่ซ้ำ · ฟอนต์ไทย/stroke ครบ)
- ✓ end-loop: fade content ผ่านพื้นดำ ต้น(0–15)/ปลาย(1785–1800) → วนไม่กระตุก (position-perfect loop ทำไม่ได้กับ epicycle หลายดาวคาบไม่ลงตัว)
- ✓ **voiceover ไทย** — `Narration.jsx` + `gen-vo.py` (edge-tts `th-TH-NiwatNeural` · ฟรี) · 13 segs ใน `public/vo/seg00–12.mp3` · sync ตรง Caption timing
- ✓ **epicycle bg ใน Shorts:** `FullEpicycle` props `speed={3}` (จันทร์ ๒ กระพริบช้า) · `hideRetro` (เอา ℞ ออก) · `outerScale={1.3}` (ดาววงนอก ๓๕๗ font +30%)
- ✓ ก๊อป preview ไว้หาง่ายที่ `C:\horatad-media\shorts60-preview.mp4` (มี voiceover แล้ว)
- ✓ **bgm:** `src/Music.jsx` — เปิดเต็ม 5วิ (vol 0.85) → duck ใต้ voiceover (0.16) → **outro ดังต่อ (0.80) จนครบ 59วิ** → fade · credit end-card โผล่ตอน outro (หลังพากย์จบ 5วิ) · **demo = shostakovich-waltz** · เปลี่ยนเพลง: แก้ `MUSIC` ใน Music.jsx บรรทัดเดียว
- ✓ **บทแม่นยำ:** "ทอเลมี" · แยก "โมเดลนี้ผิด"/"โลกไม่ใช่ศูนย์กลาง" · seg9 = "เติมราหู-เกตุ ครบพระเคราะห์ทั้งเก้า" (ชี้ว่าราหู/เกตุเป็นส่วนที่อินเดียเพิ่ม ไม่ใช่ 7 ดาวของทอเลมี — แก้ความขัดแย้ง 9 vs 7)
- ▶ render: `cd epicycle && node setup5.js --render`

## เชื่อมกับระบบยังไง
```
C:\horatad-media (คลิป) ──staging──▶ FB-output\YYMMDD ชื่อ\ ──คัดลอก──▶ G:\My Drive\_FB&Social\
```
- ❗ เก็บงานเสร็จขึ้น `G:\My Drive\_FB&Social\` เสมอ (ไม่ใช้ MCP Drive connector = คนละบัญชี)

## งงตรงไหนดูที่ไหน
- render/scene/นโยบาย → `CLAUDE.md` · backlog เต็ม → auto-memory `content-backlog.md` · Shorts spec → `SHORTS_BEST_PRACTICES.md` · ecosystem → `C:\horatad\ECOSYSTEM.md`
