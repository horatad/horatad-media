# SHORTS_TEMPLATE — มาตรฐานการผลิต YouTube Shorts

> **คลิปต้นแบบ: `Shorts60` (ปโตเลมี/epicycle)** · ตั้งเป็นมาตรฐาน 15 มิ.ย. 2569
> ใช้ recipe นี้ทำคลิปถัดไปให้ได้คุณภาพ/จังหวะเดียวกัน
> หลักการทั่วไป (7-beat, hook, VVSA) → `SHORTS_BEST_PRACTICES.md` · **recipe + ค่าจริง → ไฟล์นี้**
> ไฟล์ทั้งหมดอยู่ใน `epicycle/src/` · ต้นแบบ preview: `shorts60-preview.mp4`

---

## สเปคพื้นฐาน
- **แนวตั้ง 1080×1920 · 30fps · ≤ 59 วินาที** (เพลง < 60วิ เลี่ยง YouTube auto-block · ดู [[video-length-standard]])

## TIMELINE มาตรฐาน
```
0–5วิ      intro เพลงเปิด (ดังเต็ม ยังไม่พูด)
5–48.7วิ   เสียงพากย์ (gap 0.2วิ/ประโยค) + caption ล่าง + title เฉพาะจุด impact
48.7–53.7วิ เพลง outro ดังต่อ + epicycle (เว้น 5วิ หลังพูดจบ)
53.7–59วิ   Credit end-card
```

## โครงไฟล์ (epicycle/src/)
| ไฟล์ | หน้าที่ |
|---|---|
| **`timing.js`** | ⭐ SOURCE OF TRUTH — DUR[] (เสียงจริง), GAP, INTRO, SEG, BEATS, VO_END, DURATION · แก้จังหวะ**ที่เดียว** |
| `TextOverlay.jsx` | title overlay (keyword เด่น) — เฉพาะ hook/lineage/twist |
| `Caption.jsx` | subtitle เต็มประโยคล่าง (sound-off) |
| `Narration.jsx` | voiceover sync (Sequence per-segment) |
| `Music.jsx` | bgm + volume automation |
| `Credit.jsx` | end-card ตอน outro |
| `scenes/Shorts60.jsx` | ประกอบทั้งหมด (epicycle bg + overlay + เสียง) |
| `gen-vo.py` | generate voiceover (edge-tts) |

---

## 1. SCRIPT / บท — 7-beat
`hook → setup → wrong answer → pattern interrupt → slow reveal (lineage) → philosophical twist`
- เขียน **2 ชุดแยก**: caption (โชว์บนจอ — ใช้ตัวเลข "1,900") + บทเสียง (อ่าน — ใช้คำ "พันเก้าร้อย")
- **ตรวจความถูกต้องเนื้อหาเสมอ** ก่อนผลิต (บทเรียนต้นแบบ: "พระเคราะห์ทั้งเก้า" = 7 ดาวกรีก + ราหู/เกตุ ที่อินเดียเพิ่ม — อย่าเหมารวมว่าเป็นของทอเลมีทั้งหมด)

## 2. VOICEOVER / เพลงบรรยาย
- **เครื่องมือ:** `edge-tts` (ฟรี · ไม่ใช่ Anthropic API) · เสียง `th-TH-NiwatNeural` (ชาย) · `rate="+6%"`
- `gen-vo.py` → `SEGMENTS[]` (บทเสียง) → `public/vo/segNN.mp3`
- **คำอ่านพิเศษ:** เขียนให้ TTS ออกเสียงถูก เช่น Ptolemy→`"ทอเลมี"`, ตัวเลข→คำ · แยกประโยคสั้นๆ (1 idea/segment)
- หลัง gen → **วัด duration (ffprobe) → ใส่ `DUR[]` ใน timing.js** (หน่วยเฟรม = `int(วิ×30)+1`)

## 3. จังหวะเวลา (timing.js)
- `GAP = 6` (0.2วิ เว้นวรรคระหว่างประโยค)
- `INTRO = 150` (5วิ เพลงเปิด ก่อนเสียงพูด)
- `DURATION = 1770` (59วิ · เพดาน)
- credit delay = `VO_END + 150` (5วิ หลังพากย์จบ — ใน Credit.jsx)
- `SEG` from-frame คำนวณอัตโนมัติ: เริ่มที่ INTRO → +DUR+GAP ต่อประโยค → Caption/Narration/Title/Music ดึงจากนี้ทั้งหมด

## 4. BGM / เสียงประกอบ
- `Music.jsx` → ตัวแปร `MUSIC` ชี้ไฟล์ใน `public/`
- **volume automation:** intro เต็ม `0.85` (5วิ) → duck `0.16` (ใต้ voiceover) → outro `0.80` → fade ปลาย
- **royalty-free** (Pixabay / YouTube Audio Library — ฟรี ไม่ต้องเครดิต) · ต้นแบบ demo = `shostakovich-waltz2-loop.wav`
- คลิป < 60วิ ใช้เพลงลิขสิทธิ์ได้ (YouTube ไม่ block · อาจ Content ID claim ถ้า monetize → ค่อยสลับ royalty-free)
- **กลยุทธ์เพลง (ตั้ง 15 มิ.ย. 2569):** ช่องมี "signature เสียง" = **voiceover เสียง Niwat คงที่ทุกคลิป** → bgm จึง **เปลี่ยนตาม mood เรื่องได้** แต่**คุมแนวให้ consistent** (classical/orchestral/cinematic — อย่าหลุดไป EDM/ป๊อป) เพื่อยังรู้สึกเป็นช่องเดียวกัน:
  - ปโตเลมี/Epicycle → วอลทซ์/คลาสสิก · ราหูอม/อุปราคา → ขรึม-ลึกลับ-ออร์เคสตรา · ศุกร์/จันทร์ → ambient/dreamy · นพเคราะห์/โหราศาสตร์ไทย → **ดนตรีไทยเดิม (เช่น ลาวสนามหลวง — เพลง MoonPhase)**
  - (optional) ทำ **intro sting สั้น 2-3วิ ประจำช่อง** เหมือนกันทุกคลิป → เพิ่ม brand recognition โดยไม่เสียความหลากหลาย

## 5. CAPTION + TITLE (ลดความเกะกะ)
- **Caption** (`Caption.jsx`): subtitle เต็มประโยคล่าง (y≈1410) · bg strip `rgba(6,10,24,.66)` · ขาว + stroke · sound-off
- **Title** (`TextOverlay.jsx`): keyword เด่น **เฉพาะ hook / lineage / twist** เท่านั้น (ไม่ใส่ทุก beat — ปล่อยให้ caption เล่า ไม่ซ้ำ/ไม่รก)
- กฎ: bold sans (Tahoma/Leelawadee) · ขาว + black stroke · top 80% (เว้น bottom 20% = YT UI) · fade 10f

## 6. CREDIT (end-card)
- `Credit.jsx`: โผล่ช่วง outro · ALMAGEST/แหล่งอ้างอิง + "Horatad" + "ดาราศาสตร์ พบ โหราศาสตร์"
- dim epicycle เป็น bg ให้เครดิตเด่น · delay = พากย์จบ + 5วิ · โชว์จนจบคลิป (~5วิ)

## 7. EPICYCLE BG — `FullEpicycle` props (ไม่กระทบ comp เดิม)
| prop | ค่า Shorts | ผล |
|---|---|---|
| `hideHeadline` | true | ซ่อนหัวเรื่องมุมเดิม (ใช้ TextOverlay แทน) |
| `speed` | `3` | จันทร์ ๒ กระพริบช้า (default 14 เร็วไป) |
| `hideRetro` | true | เอาสัญลักษณ์ ℞ + วงพัลส์แดงออก |
| `outerScale` | `1.69` | ดาววงนอก ๓·๕·๗ ใหญ่ |
| `innerScale` | `1.3` | ดาววงใน ๑·๒·๔·๖ |
| `zodiacScale` | `1.5` | จักรราศีไทยรอบวง |
- วาง epicycle: `EPI_TOP = 330` (กึ่งกลางค่อนบน · ใต้ ring เหนือโซน YT UI)

---

## 8. SCRIPT โพสต์ FB/YouTube (.docx) — ทำคู่ทุกคลิป
> generator: `epicycle/gen-docx-*.mjs` (docx-js) · helper `H()/P()/B()/HL()` · font `TH Sarabun New`
> ต้นแบบรูปแบบ: `gen-docx-ptolemy.mjs` + `Epicycle-vs-Heliocentric-FB.docx`

**รูปแบบ (โครงโพสต์ยาว FB/YT):**
1. **หัวข้อชวนคิด/provocative** 2 บรรทัด (hook + เฉลยย่อ · ตัวใหญ่ สี)
2. บรรทัด **icon สรุปหัวข้อ** (emoji · คั่นด้วย ·)
3. **intro 1 ย่อหน้า** — ตั้งคำถาม/ปริศนา ดึงเข้าเรื่อง
4. แบ่ง **"ตอนที่ N — ..."** (emoji นำ) · `B()` ตัวหนาชื่อ/ปี/คำสำคัญ · `HL()` ไฮไลต์สีเน้น · เฉลยทีละขั้น
5. **✨ สรุป** — twist/ประเด็นปิดที่ implicates ผู้อ่าน
6. **hashtags** `#Horatad ...`
7. ปิด: `🎬 คลิปประกอบ: ... · Horatad`

**โทน:** เล่าเรื่องวิทย์/ประวัติศาสตร์ + มุม "ที่หลายคนเข้าใจผิด" → เฉลย → โยงโหราศาสตร์/ปฏิทินไทย
**ขยายความเกินคลิป:** ทำ research เพิ่มใส่รายละเอียด (เช่น Yavanajataka, lineage กรีก→อินเดีย→ไทย) — โพสต์ลึกกว่าคลิป
**รัน:** `node gen-docx-X.mjs "<out.docx>"` → วาง `FB-output/YYMMDD <ชื่อ>/`

## ♻️ Reuse component ข้ามคลิป (ตั้งแต่ TwoSystemsVert)
`Caption / Narration / Music / Credit` รับ prop **`timing`** (default = `timing.js` · backward-compat) → **คลิปใหม่ไม่ต้องเขียน component ซ้ำ** แค่:
1. ทำ `src/timing-<ชื่อ>.js` (DUR/TEXT/INTRO/SEG/BEATS/VO_END/DURATION) + `gen-vo-<ชื่อ>.py` → `public/vo-<ชื่อ>/`
2. scene ส่ง props: `<Caption timing={t}/> <Narration timing={t} voDir="vo-xxx"/> <Music timing={t} music="..."/> <Credit timing={t}/>`
3. title overlay (ถ้ามี) ทำต่อคลิป — ดู `TextOverlay.jsx`(Shorts60) · บางคลิปไม่ต้องมี (เช่น TwoSystemsVert ใช้ป้ายในภาพ+caption)

## วิธีทำคลิปใหม่ (checklist)
1. เขียนบท 7-beat → ใส่ `gen-vo.py` SEGMENTS (เสียง) + `timing.js` TEXT (caption)
2. `python gen-vo.py` → วัด duration ทุก seg → อัปเดต `DUR[]` ใน timing.js
3. ปรับ `BEATS` (map index segment → title hook/lineage/twist)
4. เลือกเพลง royalty-free → วาง `public/` → แก้ `MUSIC` ใน Music.jsx
5. ปรับ scene bg (ถ้าเปลี่ยนจาก epicycle) หรือ props FullEpicycle
6. render: `cd epicycle && node setup5.js --render`
7. **ตรวจ still ทุก beat** (hook/lineage/twist/credit) → ปรับ → render เต็ม
8. คุม ≤59วิ · ตรวจ audio (ffprobe volumedetect mean ≈ -25dB = มีเสียง)
9. **เขียน script โพสต์ FB/YT (.docx) คู่ทุกคลิป** — ดู §8 · `gen-docx-X.mjs` → วาง FB-output (ทำเองได้เลย ไม่ต้องรอสั่ง)
