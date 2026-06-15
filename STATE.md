# STATE — C:\horatad-media · ทำคลิปดาราศาสตร์ (อ่าน 30 วินาที)

> ไฟล์เดียวบอก "โฟลเดอร์นี้คืออะไร ตอนนี้ทำอะไรค้างอยู่" · Claude อ่านก่อนเริ่ม · dashboard ดึง 6 บรรทัดแรก
> ✓ = ตรวจจริงแล้ว · อัปเดต 2026-06-15 · รายละเอียดเต็ม → `CLAUDE.md` + memory `content-backlog.md`

## ▶ ตอนนี้ (สถานะล่าสุด 15 มิ.ย. 2569)
- ✅ **Shorts แนวตั้ง 1080×1920 เสร็จครบ 8/8** — Shorts60, TwoSystemsVert, MoonPhaseVert, MercuryRetroVert, VenusPhaseVert, VenusBrightestVert, OppositionVert, EclipseStoryVert (ทุกตัว voiceover+caption+bgm+credit · ขึ้น Drive `horatad-media/260615 *` + git push ครบ)
- 🔧 **รอพี่รีวิว+ปรับทีเดียว:** เฟส Venus ยังไม่ sync caption · EclipseStoryVert ฉากย่อยมี text baked ซ้อน overlay · เลือกเพลง mood แยกคลิป · credit wording
- ⏸ **ค้างเก่า (รอตัดสินใจ):** EclipsePhase (Eclipse แบบ epicycle) · Adhikamasa (เดือน ๘ สองหน prototype)
- 💭 **ไอเดียยังไม่ทำ (NARIT 2569):** ฝนดาวตก Leonids 17พ.ย. · ดวงอาทิตย์ตั้งฉาก · ดวงจันทร์ใกล้-ไกลโลก

## คืออะไร (1 บรรทัด)
🎬 **โรงงานทำคลิป** — แอนิเมชันอธิบายดาราศาสตร์/ปฏิทิน (Remotion) ลง FB/YouTube Shorts โปรโมทงานโหราฯ Horatad

## นโยบาย/มาตรฐาน
- ปลายทาง **YouTube Shorts → แนวตั้ง 1080×1920 · 30fps · ≤59วิ** (เพลงลิขสิทธิ์ · ดู `SHORTS_TEMPLATE.md`)
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
