# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม · dashboard ดึง 6 บรรทัดแรก
> ✓ = ตรวจจริงแล้ว · อัปเดต 2026-06-15 · รายละเอียดเต็ม → `CLAUDE.md` + memory `content-backlog.md`

## ▶ ตอนนี้ (สถานะล่าสุด 17 มิ.ย. 2569)
- 📚 **✅ ใหม่ 17 มิ.ย.: คลัง MIDI อ้างอิง `media-sources\` พร้อมใช้ (~5,980 ไฟล์ · 84MB)** — แยกจาก clips · เปียโนคลาสสิก (piano-midi.de · รายละเอียดเต็มจาก .mhtml) + กีตาร์ (classicalguitarmidi.com · **โหลดเพิ่มจากเว็บ 3,712 ไฟล์**) · ดัชนีแบบ hub ค้นหาได้ + เล่น local (`python _gen_media_index.py`) · เก็บ local (เทสเร็ว) → master อนาคตขึ้น Drive
- 🪐 **✅ Mercury Retrograde เสร็จ+ขึ้น YouTube แล้ว (17 มิ.ย.)** — 58วิ (มาตรฐานใหม่) · ดาว/วงโคจรขยายสำหรับมือถือ · caption ขึ้นบน · เสียงพากย์แก้ "พุธพักร/ถอยหลัง" · พี่อัปทับตัวเก่าบน YouTube แล้ว ✓
- 🎹 **✅ เปียโนแล็บ BGM = เลือก 4Front R-Piano (18 มิ.ย.)** — ทดลอง Glass Piano (Splice INSTRUMENT/Glass Grand) แล้ว **เสียงเบามาก → ดร็อป** (master ในปลั๊กสุดแล้วยังเบา = เป็นธรรมชาติ instrument แนวฟุ้ง/กระจก ไม่ใช่ตั้งค่าผิด · ไม่ต้องขุดซ้ำ) · เปลี่ยนเป็น **4Front R-Piano** (VST2 · `C:\Users\user\VSTPlugins\`) เป็นเปียโนหลัก · render ทดสอบ `clips\HoraStaccato.wav` (BBCSO violin + 4Front piano · 106วิ) ดังเต็ม **mean −13.9dB** (ดังกว่า MASTER เดิม ~5dB) ✓ — ⚠️ peak แตะ 0.0dB ถ้า master จริงลด gain ~2–3dB กัน clip · template เปียโนใช้ได้แล้ว ไม่ต้องทำ Glass template
- 🎻 **ใหม่ 16 มิ.ย.: เสียงวงจริง BBCSO + headless render pipeline** — ติดตั้ง BBC Symphony Orchestra Discover + REAPER · `clips/_mid2rpp.py` แปลง MIDI→เสียงวงจริง **ผ่าน command line ไม่เปิดจอ** (`reaper.exe -renderproject` · รักษา timing) · ทดสอบ violin/percussion ✓ · **ค้าง:** `clips/_piano_template.rpp` ยังเป็น Percussion → เปิด REAPER ตั้งปลั๊ก track1 เป็น Piano(กด Load) → Ctrl+S ทับ template → rerun script · รายงานเต็ม `G:\My Drive\horatad-report\BGM_BBCSO_MASTERPLAN_REPORT.html` · MIDI คลัง `clips/mozart`,`clips/beethoven` + `G:\My Drive\horatad-midi\`
- 🎬 **✅ Shorts60 (ปโตเลมี) ขึ้น YouTube แล้ว (18 มิ.ย.)** — เพลง Skaters' Waltz v03 FINALIZE · พี่เคาะ OK · อัปทับ Drive `260615 Ptolemy Shorts\ปโตเลมี-Shorts60 15Jun26.mp4` (md5 915adac0 ตรง v03) + อัปขึ้น YouTube แล้ว ✓ — คลิป Shorts แนวตั้งตัวที่ 2 ที่ publish (ตามหลัง Mercury Retrograde)
  - bgm `public/audio/skaters-waltz.mp3` (ตัด 0:47–1:34 จาก YouTube wWuccFOyayU · ลิขสิทธิ์-แต่-OK <60วิ) · source เต็มเก็บ `clips/skaters-waltz_yt-source.webm` · คลิป **58วิ** (timing.js DURATION 1740) · `introFade=9, outroFade=15, outroSilence=9`
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
