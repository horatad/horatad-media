# CLAUDE.md — โปรเจกต์ทำคลิปดาราศาสตร์ Horatad (C:\horatad-media)

โปรเจกต์ทำ **คลิปแอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน** ลง FB/Social เพื่อสนับสนุนงาน **Horatad** (โหราศาสตร์/ปฏิทินไทย — ดูได้ที่ `C:\horatad`) · ตอบ/คอมเมนต์เป็นภาษาไทย (พี่ปีเตอร์)
## References
- Shorts best practices (หลักการ 7-beat/hook): C:\horatad-media\SHORTS_BEST_PRACTICES.md
- **Shorts production recipe + ค่าจริง (ต้นแบบมาตรฐาน `Shorts60`): C:\horatad-media\SHORTS_TEMPLATE.md** — ใช้ทำคลิป Shorts ถัดไปทุกตัว (script/voiceover/bgm/timing/caption/credit/epicycle props)
- **แล็บผลิตเพลงประกอบ (BGM): `clips\README.md`** — pipeline โน้ต→OMR(Audiveris)→MIDI→render soundfont (fluidsynth) · ⚠️ สคริปต์ hardcode path `clips\` ห้าม rename · master เก็บ Drive `horatad-media\_BGM-lab\` · เพลงที่ใช้จริงไป `epicycle\public\audio\`
## โปรเจกต์ Remotion ที่ใช้งานจริง: `epicycle\` (JSX)
- **พรีวิว:** `cd epicycle` แล้ว `npm run dev` → http://localhost:3000 (dev server หยุดเมื่อเครื่อง sleep → สตาร์ทใหม่ได้เลย)
- **render:** จากโฟลเดอร์ `epicycle\` → `npx remotion still src/index.js <CompId> out/<x>.png --frame=N` (เช็คภาพนิ่ง) หรือ `npx remotion render src/index.js <CompId> out/<x>.mp4` (เต็ม)
- **นโยบายคลิป — YouTube Shorts (ตั้ง 14 มิ.ย. 2569 · ดู memory `video-length-standard`):**
  - **รูปแบบ: แนวตั้ง 9:16 = `1080×1920` · 30fps** · ⚠️ scenes ปัจจุบันยังเป็น `1080×1080` (จัตุรัส) → ต้อง **re-layout เป็นแนวตั้ง** (ไม่ใช่แค่เปลี่ยนเลข: ขยับ diagram กลาง CY≈960 + ใช้พื้นที่บน/ล่างสำหรับ title/caption)
  - **ความยาว: ถ้าใช้เพลงมีลิขสิทธิ์ → ห้ามเกิน 60 วินาที** (เพดาน ~59วิ = 1770 เฟรม · เลี่ยง copyright claim) · ไม่มีเพลง/ปลอดลิขสิทธิ์ → ยาวได้ (Shorts ≤3นาที) · sync เพลง fade out ลงพอดีปลายคลิป
- ฟิสิกส์อยู่ที่ `epicycle\src\physics.js` (`gP`,`isRetro` — โมเดล geocentric epicycle; อัตราส่วน `epiR/defR` = รัศมีวงโคจรจริง (AU) → **เทียบเท่า heliocentric** ดึงตำแหน่ง Sun-centered จากข้อมูลชุดเดิมได้)
- scenes (ใน `epicycle\src\scenes\`): FullEpicycle, FullEpicycleInner, VenusPhase, MoonPhase, AllTrails, Adhikamasa, HelioRetro, HelioDual, TwoSystems, Eclipse, EclipseGround, EclipseSaros, EclipseStory, EclipsePhase, MercuryRetro, VenusBrightest, Opposition · register ใน `Root.jsx`
- docx generator (โทน "ที่หลายคนเข้าใจผิด" + emoji + โยงโหราศาสตร์): `epicycle\gen-docx-*.mjs` (mercury/venus/eclipse/opposition) — `node gen-docx-X.mjs <out.docx>` · ใช้ docx-js ที่ `epicycle\node_modules\docx`
- เสียง/รูปวางใน `epicycle\public\` อ้างด้วย `staticFile()` · สคริปต์ .docx ทำด้วย docx-js (อีโมจิหลากสี, ~A4)

## การจัดเก็บงาน
- staging ในเครื่อง: `C:\horatad-media\FB-output\YYMMDD <ชื่อ>\` (คลิป `.mp4` + สคริปต์ `.docx`)
- ขึ้น Drive ส่วนตัว: คัดลอกเข้า `G:\My Drive\horatad-media\YYMMDD <ชื่อ>\` (Google Drive for Desktop sync เอง — ไม่ใช้ MCP connector ซึ่งเป็นบัญชีงาน uchujaro5) · YYMMDD = วันที่ทำงาน
  - โครง Drive `horatad-media\`: `YYMMDD <ชื่อ>\` (คลิปแต่ละชิ้น) · `_BGM-lab\` (master เพลง) · `manual-report\` (งานเกี่ยวเนื่องที่พี่ปีเตอร์ทำเอง) · `processed\`, `voice_prototypes\`
- **❗ มาตรฐาน (ตั้ง 15 มิ.ย. 2569): หลังอัพขึ้น Drive ทุกครั้ง → อัปเดตสถานะใน `CLAUDE.md` (## สถานะงาน) + memory `content-backlog.md` ทันที** (ระบุคลิปที่ขึ้นแล้ว · ชื่อ folder Drive · ย้ายจาก "ค้าง"→"เสร็จ") — กันสถานะล้าสมัย/สับสนข้าม session

## สถานะงาน (อัพเดต 14 มิ.ย. 2026 · รายละเอียดเต็มใน auto-memory `content-backlog.md`)
- **⚠️ ค้างเพลงประกอบ (เฉพาะตัวจัตุรัสเดิม 14 มิ.ย.):** `EclipseStory`, `Opposition` ยัง**เงียบ** — แต่จะใส่เพลงตอน migrate แนวตั้งเลย (ไม่ทำซ้ำ) · `MercuryRetro` ✅ มีเพลงแล้ว (เวอร์ชันแนวตั้ง MercuryRetroVert · waltz) · `VenusBrightest` มีเพลง dream-island ติดจาก VenusPhase
- **เสร็จ render+docx+Drive แล้ว (`horatad-media`):** Venus Phase (260609), Moon Phase (260611), Epicycle vs Heliocentric (260611 · **= `TwoSystems`** — ปรับเหลือ 53 วิ เมื่อ 14 มิ.ย. ให้เข้ามาตรฐาน ≤59วิ · backup 72วิ เดิมอยู่ใน FB-output) · **ชุด 14 มิ.ย.:** ดาวพุธพักร `MercuryRetro` (260614 Mercury Retrograde), ดาวศุกร์สว่างสุด `VenusBrightest` (260614 Venus Brightest), ราหูอม-อุปราคา `EclipseStory` (260614 Eclipse Rahu-Om), ดาวเคราะห์ใกล้โลก `Opposition` (260614 Opposition)
- **Shorts แนวตั้ง 1080×1920 (YouTube · มาตรฐาน `SHORTS_TEMPLATE.md`) — เสร็จ+ขึ้น Drive:** `Shorts60` ปโตเลมี→พระเคราะห์ทั้งเก้า (`260615 Ptolemy Shorts`) · `TwoSystemsVert` Epicycle-vs-Helio (`260615 Epicycle vs Heliocentric Vert`) · `MoonPhaseVert` เฟสดวงจันทร์/ซูเปอร์มูน/ปฏิทินจันทรคติ (`260615 Moon Phase Vert` · vo-moon 11 ประโยค · เพลง lunar-bgm · 59วิ) · `MercuryRetroVert` ดาวพุธพักร=ภาพลวงตา (`260615 Mercury Retrograde Vert` · vo-merc 11 ประโยค · waltz · 59วิ · SPEED 0.45+PHASE_ME -357 → retro window sync กับพากย์ seg5–6 · credit "HELIOCENTRIC/Copernicus") — มี voiceover ไทย+caption+bgm+credit · component (`Caption/Narration/Music/Credit`) รับ prop `timing` → reuse คลิปถัดไป
  - 📌 `Credit.jsx` รับ props `label/source/sub` แล้ว (backward-compat · MoonPhaseVert ใช้ "based on OBSERVATION" แทน ALMAGEST) · ป้าย perigee/apogee ใน MoonPhaseVert ใช้ "ใกล้สุด/ไกลสุด" (เลี่ยงเคลม อุจ/นิจ=ระยะทาง ที่ยังไม่ยืนยัน — ของเดิม square 260611 ใช้ นิจ/อุจ)
- **▶ ค้าง: migrate คลิปเก่าเหลืออีก 4 เป็นแนวตั้ง** (VenusPhase/VenusBrightest/EclipseStory/Opposition) ตามมาตรฐาน Shorts
- **ค้างเก่า:** `EclipsePhase` (ทางเลือก Eclipse แบบ epicycle — ยังไม่ตัดสินว่าใช้) · `Adhikamasa` (เดือน ๘ สองหน — prototype)

## 💾 จบงาน → commit + push เสมอ (กันงานหาย/ค้าง — ตั้ง 15 มิ.ย. 2569)

**กฎเหล็ก:** ทำงานในโฟลเดอร์นี้เสร็จเป็นหน่วย (verify แล้วใช้ได้) → **commit + push `main` ทันที**
- งานที่ยังไม่ commit = **ยังไม่ถูก backup** (อยู่บนดิสก์เครื่องเดียว · ดิสก์พัง = หาย) + ไม่ขึ้น dashboard ศูนย์บัญชาการ (`C:\horatad-control`)
- อัปเดต `STATE.md`/`CLAUDE.md` ใน commit เดียวกัน → ภาพรวมที่ control สดเสมอ
- **ห้าม commit ของ runtime/generated** ที่ `.gitignore` กันไว้ (`node_modules`, `out/`, `.mp4` ใหญ่, render cache) — commit แค่ source/scripts/docs
- identity: ใช้ git config global (GitHub noreply) — ห้ามใส่ email ตรงๆ (โดน push block)
- คลิปใหญ่/asset เก็บที่ Drive `horatad-media` ตามเดิม ไม่ commit เข้า git
