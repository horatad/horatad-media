# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม · dashboard ดึง 6 บรรทัดแรก
> ✓ = ตรวจจริงแล้ว · อัปเดต 2026-06-15 · รายละเอียดเต็ม → `CLAUDE.md` + memory `content-backlog.md`

## ▶ ตอนนี้ (สถานะล่าสุด 17 มิ.ย. 2569)
- 📚 **✅ ใหม่ 17 มิ.ย.: คลัง MIDI อ้างอิง `media-sources\` พร้อมใช้ (~5,980 ไฟล์ · 84MB)** — แยกจาก clips · เปียโนคลาสสิก (piano-midi.de · รายละเอียดเต็มจาก .mhtml) + กีตาร์ (classicalguitarmidi.com · **โหลดเพิ่มจากเว็บ 3,712 ไฟล์**) · ดัชนีแบบ hub ค้นหาได้ + เล่น local (`python _gen_media_index.py`) · เก็บ local (เทสเร็ว) → master อนาคตขึ้น Drive
- 🪐 **✅ Mercury Retrograde เสร็จ+ขึ้น YouTube แล้ว (17 มิ.ย.)** — 58วิ (มาตรฐานใหม่) · ดาว/วงโคจรขยายสำหรับมือถือ · caption ขึ้นบน · เสียงพากย์แก้ "พุธพักร/ถอยหลัง" · พี่อัปทับตัวเก่าบน YouTube แล้ว ✓
- 🎹 **ใหม่ 17 มิ.ย.: เพิ่มเครื่องดนตรีให้แล็บ BGM** — ติดตั้ง **Glass Piano** (Splice INSTRUMENT · 8 presets · `C:\Users\user\Splice\INSTRUMENT\LABS - Glass Piano` 485MB) + **4Front R-Piano** (VST2 · `C:\Users\user\VSTPlugins\` · เพิ่ม path ใน REAPER + rescan แล้ว) · ตอนนี้มี Glass/Intimate Grand/Opia/4Front/BBCSO ให้เลือก
  - **⏳ ค้าง (session หน้า): ทำ REAPER template `clips\_glass_piano_template.rpp`** — Track 1 = Splice INSTRUMENT + preset Glass Grand + MIDI item เปล่า → Save (เมื่อกี้โหลด Glass Grand เข้า track ได้แล้วแต่ project ถูก reset · ทำใหม่: Insert virtual instrument→Splice INSTRUMENT→ค้น "Glass Grand" ใน Search ดับเบิลคลิก→เพิ่ม MIDI item→Save As) · แล้วทดสอบ `python _mid2rpp.py x.mid _glass_piano_template.rpp out.rpp out.wav`
- 🎻 **ใหม่ 16 มิ.ย.: เสียงวงจริง BBCSO + headless render pipeline** — ติดตั้ง BBC Symphony Orchestra Discover + REAPER · `clips/_mid2rpp.py` แปลง MIDI→เสียงวงจริง **ผ่าน command line ไม่เปิดจอ** (`reaper.exe -renderproject` · รักษา timing) · ทดสอบ violin/percussion ✓ · **ค้าง:** `clips/_piano_template.rpp` ยังเป็น Percussion → เปิด REAPER ตั้งปลั๊ก track1 เป็น Piano(กด Load) → Ctrl+S ทับ template → rerun script · รายงานเต็ม `G:\My Drive\horatad-report\BGM_BBCSO_MASTERPLAN_REPORT.html` · MIDI คลัง `clips/mozart`,`clips/beethoven` + `G:\My Drive\horatad-midi\`
- 🎧 **กำลังจูน: เพลง Shorts60 = Skaters' Waltz (loop seam)** — ค้างที่ **v03** รอพี่เคาะ
  - bgm `public/audio/skaters-waltz.mp3` (ตัด 0:47–1:34 จาก YouTube wWuccFOyayU · ลิขสิทธิ์-แต่-OK <60วิ) · source เต็มเก็บ `clips/skaters-waltz_yt-source.webm` (ลองตัดท่อนอื่นได้)
  - คลิป **58วิ** (timing.js DURATION 1740) · Music.jsx เพิ่ม params `introFade/outroFade/outroSilence` (default เดิม backward-compat) · Shorts60 ใช้ `introFade=9, outroFade=15, outroSilence=9` → **รอยต่อ loop (ต้น fade-in 0.3 + ท้ายเงียบ 0.3) รวม ~0.5วิ**
  - **ค้าง:** รอพี่ฟัง `out/Shorts60-v03.mp4` (+ wav) ว่ารอยต่อ loop OK → ถ้าโอเค **finalize** = อัปทับ Drive `260615 Ptolemy Shorts` (ตอนนี้ Drive ยังเป็นเวอร์ชันก่อนหน้า) · ถ้าไม่ → ปรับเลข fade แล้ว render เป็น `Shorts60-v04` (ใช้เลขเวอร์ชันในชื่อกัน cache เสมอ)
- ✅ **Shorts แนวตั้ง 1080×1920 เสร็จครบ 8/8** — Shorts60, TwoSystemsVert, MoonPhaseVert, MercuryRetroVert, VenusPhaseVert, VenusBrightestVert, OppositionVert, EclipseStoryVert (ทุกตัว voiceover+caption+bgm+credit · ขึ้น Drive `horatad-media/260615 *` + git push ครบ)
- 🔧 **รอพี่รีวิว+ปรับทีเดียว:** เฟส Venus ยังไม่ sync caption · EclipseStoryVert ฉากย่อยมี text baked ซ้อน overlay · เลือกเพลง mood แยกคลิป · credit wording
- ⏸ **ค้างเก่า (รอตัดสินใจ):** EclipsePhase (Eclipse แบบ epicycle) · Adhikamasa (เดือน ๘ สองหน prototype)
- 💭 **ไอเดียยังไม่ทำ (NARIT 2569):** ฝนดาวตก Leonids 17พ.ย. · ดวงอาทิตย์ตั้งฉาก · ดวงจันทร์ใกล้-ไกลโลก

## คืออะไร (1 บรรทัด)
🎬 **โรงงานทำคลิป** — แอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน (Remotion) ลง FB/YouTube Shorts โปรโมทงานโหราฯ Horatad

## นโยบาย/มาตรฐาน
- ปลายทาง **YouTube Shorts → แนวตั้ง 1080×1920 · 30fps · ≤58วิ = 1740 เฟรม** (เพลงลิขสิทธิ์ · ลดจาก 59วิ เมื่อ 16 มิ.ย. 2569 เพราะ YouTube เตือนคลิป ~1 นาทีอาจเข้าข่ายผิดลิขสิทธิ์ · คลิปเก่ายังไม่แก้ รอดูสถานการณ์ · ดู `SHORTS_TEMPLATE.md`)
- โปรเจกต์จริง = `epicycle\` (Remotion/JSX) · พรีวิว: `cd epicycle` → `npm run dev` → localhost:3000
- render: `cd epicycle && npx remotion render src/index.js <CompId> out/<x>.mp4`
- pipeline reuse: `Caption/Narration/Music/Credit` รับ prop `timing` → คลิปใหม่แค่ทำ `timing-X.js` + `gen-vo-X.py`

## โครงเก็บงาน
```
C:\horatad-media (source · git → github.com/horatad/horatad-media) ──staging──▶ FB-output\YYMMDD ชื่อ\
   ──คัดลอก──▶ G:\My Drive\horatad-media\YYMMDD ชื่อ\ (คลิป mp4 + docx · Drive for Desktop sync)
```
- ✓ git: epicycle source รวมเข้า root repo แล้ว (15 มิ.ย.) · commit+push ครบ
- ✓ แล็บเพลง BGM = `clips\` (โน้ต→OMR→MIDI→soundfont · master ขึ้น Drive `horatad-media/_BGM-lab`)

## งงตรงไหนดูที่ไหน
- scene/นโยบาย/สถานะเต็ม → `CLAUDE.md` · backlog → memory `content-backlog.md` · Shorts recipe → `SHORTS_TEMPLATE.md` · BGM lab → `clips/README.md`
