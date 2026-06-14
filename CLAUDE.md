# CLAUDE.md — โปรเจกต์ทำคลิปดาราศาสตร์ Horatad (C:\horatad-media)

โปรเจกต์ทำ **คลิปแอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน** ลง FB/Social เพื่อสนับสนุนงาน **Horatad** (โหราศาสตร์/ปฏิทินไทย — ดูได้ที่ `C:\horatad`) · ตอบ/คอมเมนต์เป็นภาษาไทย (พี่ปีเตอร์)

## โปรเจกต์ Remotion ที่ใช้งานจริง: `epicycle\` (JSX)
- **พรีวิว:** `cd epicycle` แล้ว `npm run dev` → http://localhost:3000 (dev server หยุดเมื่อเครื่อง sleep → สตาร์ทใหม่ได้เลย)
- **render:** จากโฟลเดอร์ `epicycle\` → `npx remotion still src/index.js <CompId> out/<x>.png --frame=N` (เช็คภาพนิ่ง) หรือ `npx remotion render src/index.js <CompId> out/<x>.mp4` (เต็ม)
- ทุกคลิป **1080×1080 · 30fps** · ฟิสิกส์อยู่ที่ `epicycle\src\physics.js` (`gP`,`isRetro` — โมเดล geocentric epicycle; อัตราส่วน `epiR/defR` = รัศมีวงโคจรจริง (AU) → **เทียบเท่า heliocentric** ดึงตำแหน่ง Sun-centered จากข้อมูลชุดเดิมได้)
- scenes (ใน `epicycle\src\scenes\`): FullEpicycle, FullEpicycleInner, VenusPhase, MoonPhase, AllTrails, Adhikamasa, HelioRetro, HelioDual, TwoSystems, Eclipse, EclipseGround, EclipseSaros, EclipseStory, EclipsePhase, MercuryRetro, VenusBrightest, Opposition · register ใน `Root.jsx`
- docx generator (โทน "ที่หลายคนเข้าใจผิด" + emoji + โยงโหราศาสตร์): `epicycle\gen-docx-*.mjs` (mercury/venus/eclipse/opposition) — `node gen-docx-X.mjs <out.docx>` · ใช้ docx-js ที่ `epicycle\node_modules\docx`
- เสียง/รูปวางใน `epicycle\public\` อ้างด้วย `staticFile()` · สคริปต์ .docx ทำด้วย docx-js (อีโมจิหลากสี, ~A4)

## การจัดเก็บงาน
- staging ในเครื่อง: `C:\horatad-media\FB-output\YYMMDD <ชื่อ>\` (คลิป `.mp4` + สคริปต์ `.docx`)
- ขึ้น Drive ส่วนตัว: คัดลอกเข้า `G:\My Drive\_FB&Social\YYMMDD <ชื่อ>\` (Google Drive for Desktop sync เอง — ไม่ใช้ MCP connector ซึ่งเป็นบัญชีงาน uchujaro5) · YYMMDD = วันที่ทำงาน

## สถานะงาน (อัพเดต 14 มิ.ย. 2026 · รายละเอียดเต็มใน auto-memory `content-backlog.md`)
- **⚠️ ค้างเดียวของ 4 คลิปชุด 14 มิ.ย.: เพลงประกอบ** — `MercuryRetro`, `EclipseStory`, `Opposition` ยัง**เงียบ (ไม่มี bgm)** · พี่ปีเตอร์ต้องเลือกเพลง mood ที่เหมาะแล้วเสียบ (เพิ่ม `<Audio>` ใน scene → render ใหม่) ก่อนโพสต์จริง. `VenusBrightest` มีเพลง dream-island ติดมาจาก VenusPhase แล้ว
- **เสร็จ render+docx+Drive แล้ว (`_FB&Social`):** Venus Phase (260609), Moon Phase (260611), Epicycle vs Heliocentric (260611) · **ชุด 14 มิ.ย.:** ดาวพุธพักร `MercuryRetro` (260614 Mercury Retrograde), ดาวศุกร์สว่างสุด `VenusBrightest` (260614 Venus Brightest), ราหูอม-อุปราคา `EclipseStory` (260614 Eclipse Rahu-Om), ดาวเคราะห์ใกล้โลก `Opposition` (260614 Opposition)
- **ค้างเก่า (render mp4 แล้ว ยังไม่ส่ง):** `TwoSystems` (2172f) — เทียบ geo/helio พุธ+ศุกร์ · มี `out/two-systems.mp4`. เช็คว่าซ้อนกับ Epicycle-vs-Helio ที่ส่งแล้วไหม
- **ค้างเก่า:** `EclipsePhase` (ทางเลือก Eclipse แบบ epicycle — ยังไม่ตัดสินว่าใช้) · `Adhikamasa` (เดือน ๘ สองหน — prototype)
