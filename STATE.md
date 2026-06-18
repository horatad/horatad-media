# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม · dashboard ดึง 6 บรรทัดแรก
> ✓ = ตรวจจริงแล้ว · อัปเดต 2026-06-15 · รายละเอียดเต็ม → `CLAUDE.md` + memory `content-backlog.md`

## ▶ ตอนนี้ (สถานะล่าสุด 17 มิ.ย. 2569)
- 📚 **✅ ใหม่ 17 มิ.ย.: คลัง MIDI อ้างอิง `media-sources\` พร้อมใช้ (~5,980 ไฟล์ · 84MB)** — แยกจาก clips · เปียโนคลาสสิก (piano-midi.de · รายละเอียดเต็มจาก .mhtml) + กีตาร์ (classicalguitarmidi.com · **โหลดเพิ่มจากเว็บ 3,712 ไฟล์**) · ดัชนีแบบ hub ค้นหาได้ + เล่น local (`python _gen_media_index.py`) · เก็บ local (เทสเร็ว) → master อนาคตขึ้น Drive
- 🪐 **✅ Mercury Retrograde เสร็จ+ขึ้น YouTube แล้ว (17 มิ.ย.)** — 58วิ (มาตรฐานใหม่) · ดาว/วงโคจรขยายสำหรับมือถือ · caption ขึ้นบน · เสียงพากย์แก้ "พุธพักร/ถอยหลัง" · พี่อัปทับตัวเก่าบน YouTube แล้ว ✓
- 🎹 **✅ เปียโนแล็บ BGM = เลือก 4Front R-Piano (18 มิ.ย.)** — ทดลอง Glass Piano (Splice INSTRUMENT/Glass Grand) แล้ว **เสียงเบามาก → ดร็อป** (master ในปลั๊กสุดแล้วยังเบา = เป็นธรรมชาติ instrument แนวฟุ้ง/กระจก ไม่ใช่ตั้งค่าผิด · ไม่ต้องขุดซ้ำ) · เปลี่ยนเป็น **4Front R-Piano** (VST2 · `C:\Users\user\VSTPlugins\`) เป็นเปียโนหลัก · render ทดสอบ `clips\HoraStaccato.wav` (BBCSO violin + 4Front piano · 106วิ) ดังเต็ม **mean −13.9dB** (ดังกว่า MASTER เดิม ~5dB) ✓ — ⚠️ peak แตะ 0.0dB ถ้า master จริงลด gain ~2–3dB กัน clip · template เปียโนใช้ได้แล้ว ไม่ต้องทำ Glass template
- 🎻 **ใหม่ 16 มิ.ย.: เสียงวงจริง BBCSO + headless render pipeline** — ติดตั้ง BBC Symphony Orchestra Discover + REAPER · `clips/_mid2rpp.py` แปลง MIDI→เสียงวงจริง **ผ่าน command line ไม่เปิดจอ** (`reaper.exe -renderproject` · รักษา timing) · ทดสอบ violin/percussion ✓ · รายงานเต็ม `G:\My Drive\horatad-report\BGM_BBCSO_MASTERPLAN_REPORT.html` · MIDI คลัง `clips/mozart`,`clips/beethoven` + `G:\My Drive\horatad-midi\`
  - **✅ ฟัง BBCSO ครบทุกเครื่อง (palette audition) เสร็จ (18 มิ.ย.)** — render ครบ 18 เครื่อง → `_review/260618 BBCSO palette/` (ไฟล์เดี่ยวชื่อไทย + ไฟล์รวม "00 ฟังรวมทั้งหมดเรียงกัน.mp3" + อ่านก่อน.txt) · ยืนยัน **BBCSO Discover render headless ได้ครบทุกเครื่อง** ✓ · **รอพี่ฟังแล้วเลือกเครื่องไว้ทำ BGM** → ผมทำ template ตัวนั้น
    - **✅ เพลงจริงทั้งวง (18 มิ.ย.):** `_inject_symphony.py` แมปพาร์ท MIDI ออร์เคสตรา→เครื่อง BBCSO ที่ตรงชื่อ → render ทั้งวงเล่นพร้อมกัน · ทำ Beethoven Sym7 ท่อน2 (Allegretto) เล่นโดย BBCSO 12 เครื่อง → `_review/.../เพลงจริง-Beethoven Sym7...mp3` (7.6นาที · mean −20dB) · มี `_Sym5-1.mid` (เบโธเฟน 5 ท่อน1) เป็นทางเลือก · พาร์ทตั้งชื่อตรง BBCSO เป๊ะ (2 Flutes/Oboes/.../Violins 1-2/Violas/Cellos/Basses)
    - **✅ duo ไวโอลิน+เปียโน (18 มิ.ย.):** พี่ชี้ว่า BBCSO Discover เป็น "lite" เหมาะวงเล็ก (โซนาตา/ดูเอ็ต) มากกว่าวงเต็ม · `_inject_duo.py` ประกอบ project 2 track (BBCSO Violins 1 + **4Front piano**) แมปพาร์ทไวโอลิน/เปียโน · ทำ **Beethoven Spring Sonata Op.24 ท่อน1** (โหลด MIDI จาก archive.org · `Beethoven_Spring_Sonata_Op24_mvt1_violin-piano.mid`) → `_review/.../Spring Sonata...mp3` (80วิ) ทดสอบความเข้ากัน BBCSO violin + 4Front piano ✓ · ⚠️ BBCSO Violins = section ไม่ใช่ solo violin (Discover ไม่มี solo) · **ทดสอบพบ: Discover Violins แทบไม่มี dynamic layer** (velocity/CC1 ไม่ทำให้สว่าง/ดังขึ้น) + พาร์ท Spring อยู่ต่ำ (กลาง F4) → ฟังทึบเหมือนวิโอลา + โดนเปียโน 4Front (ดังกว่า ~12dB) mask · balance ด้วย track gain ได้แต่โทนยังทึบ → **สรุป: ต้องใช้ solo violin VST จริง สำหรับงานโซนาตา/ดูเอ็ต**
    - **✅ ติดตั้ง Sonatina Violin (bigcat · ฟรี VST · solo violin จริง) 18 มิ.ย.** — อยู่ `C:\Users\user\VSTPlugins\` (คู่กับ 4Front) · ทำ project `clips\_duo_violinone.rpp` (track1 Sonatina Solo Violin + track2 4Front) · `_inject_duo2.py` แมป Spring → 2 track · `_review/.../Spring Sonata-Sonatina solo violin + 4Front.mp3` (balance ไวโอลิน +6dB/เปียโน −4dB · Sonatina solo สว่างกว่า section ตัดผ่านเปียโนได้) · Sound Magic Violin One (เคยจะใช้) เปลี่ยนเป็นขายแล้ว ไม่ฟรี · MIDI ฟรีติด gate ทุกแหล่ง (MuseScore Pro/kunstderfuge/IMSLP) ยกเว้น archive.org โหลดตรงได้
    - **pipeline (เก็บไว้ใช้ซ้ำ):** พี่ตั้ง multitrack ใน REAPER (1 เครื่อง/track) save `clips/_bbcso_palette.rpp` → `_inject_palette_midi.py` แทรก MIDI ทดสอบเหลื่อมเวลา 13วิ/track + **เลื่อนอ็อกเทฟตามเครื่องให้เล่นช่วงเสียงถนัด** (`shift_for(name)` — ไวโอลิน/ทรัมเป็ต/ฟลุต +12, เชลโล/ทูบา −12, เบส −24, พิคโคโล +24 ฯลฯ · ถ้าทุกเครื่องเล่นช่วงเดียวกัน เครื่องตระกูลเดียวจะฟังเหมือนกัน) → `_render_palette.py` **เปิด REAPER ครั้งเดียว** render master รวมแล้ว ffmpeg ตัดแยกต่อเครื่อง (เลี่ยงเปิด REAPER ซ้ำ 18 รอบ) · MIDI ทดสอบ = `_make_palette_test.py` (legato+swell+staccato+chord)
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
