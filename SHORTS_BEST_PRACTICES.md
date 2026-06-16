# YouTube Shorts Best Practices — Ptolemy / Nawagraha Series
> Source: Research synthesis (Galloway/Gileta 3.3B-view study + Frontiers in Communication + Man from Earth analysis)
> Last updated: 2026-06-14

---

## FORMAT
- Resolution: 1080×1920 (9:16 vertical)
- FPS: 30
- Duration: 1800 frames = 60 seconds
- End frame must loop cleanly back to start (boosts replay → ranking)

---

## HOOK (Frame 0–90 / 0–3s)
- ❌ ห้ามขึ้นต้นด้วย "สวัสดี" หรือ intro ช้า
- ✅ ขึ้นต้นด้วย bold question หรือ provocative claim ทันที
- ✅ Treat first frame like a thumbnail
- Target VVSA (Viewed vs Swiped Away): **70–90%**
  - < 60% = hook ล้มเหลว ต้อง recut

---

## 7-BEAT STRUCTURE
| Beat | Frame | เนื้อหา |
|------|-------|---------|
| 1. Hook | 0–90 | Bold question / claim |
| 2. Setup | 90–360 | บริบท / ตัวละคร |
| 3. Wrong Answer | 360–750 | สิ่งที่คนเชื่อผิด |
| 4. Pattern Interrupt | 750–1050 | Music shift / reframe |
| 5. Slow Reveal | 1050–1500 | เฉลยทีละชั้น |
| 6. Philosophical Twist | 1500–1710 | Silence → ประโยคสรุปที่ implicates viewer |
| 7. Loop End | 1710–1740 | จบด้วยภาพที่ loop กลับ frame 0 ได้ (เพดาน 1740 = 58วิ) |

---

## NARRATIVE TECHNIQUE (Man from Earth Method)
- **Withheld information** = curiosity engine — อย่าเฉลยเร็ว
- **Midpoint flip** = reframe stakes กลางวิดีโอ
- **Closing twist** = implicates viewer's own culture/belief
- One idea per Short only — ห้ามยัดหลาย concept

---

## TEXT OVERLAY RULES
- Font: bold sans-serif
- Color: white + black stroke/shadow
- Position: center horizontal, อยู่ใน **top 80%** ของจอ
- Bottom 20% + Right 10% = ห้ามวางข้อความ (YT UI บัง)
- Max: **≤10 words per block**
- Min duration on screen: **≥2 seconds (60 frames)**
- Transition: fade-in 10f / fade-out 10f

---

## AUDIO PATTERN
```
Frame 0–750:    Low ambient drone (volume ~0.4)
Frame 750–1050: Music shift / beat drop (volume ~0.1) ← Pattern Interrupt
Frame 1500–1800: Silence (volume 0) ← ก่อน Philosophical Twist
```
- Caption ทุกบรรทัด (ส่วนใหญ่ดูแบบ sound-off)

---

## STORY CORE — Ptolemy Series
```
CORE IDEA: "ดาวของโหราศาสตร์ไทย = ดาวของปโตเลมี"

LINEAGE:
กรีก (Ptolemy, ~150 CE)
  → Yavanajataka (Greek→Sanskrit)
  → อินเดีย / Jyotisha / Navagraha
  → โหราศาสตร์ไทย / นพเคราะห์

KEY FACTS:
- โมเดล Epicycle ผิด แต่แม่นยำ 1,400 ปี
- นพเคราะห์ที่ไหว้ทุกวัน = ดาวดวงเดิมที่ปโตเลมีวาด
- 1,900 ปี 2 อารยธรรม 1 ระบบดาวเคราะห์
```

---

## CC PRODUCTION CHECKLIST
- [ ] Composition: Shorts60, 1080×1920, 1800f, 30fps
- [ ] Text overlay component พร้อม timing ตาม 7-beat
- [ ] Audio: music.mp3 ใน public/ พร้อม volume automation
- [ ] End frame loops กลับ frame 0
- [ ] Caption ทุกบรรทัด (ทำหลัง render ใน CapCut)
- [ ] Render: `npx remotion render Shorts60 out/shortsN.mp4`

---

## BENCHMARK — ถ้าตัวเลขไม่ดี
| ปัญหา | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| VVSA < 60% | Hook อ่อน | recut 3s แรก |
| Retention cliff กลางคลิป | Pacing ช้า | ตัด + เพิ่ม pattern interrupt |
| Completion rate ต่ำ | Twist ไม่ compelling | ขัดประโยคสรุป |
