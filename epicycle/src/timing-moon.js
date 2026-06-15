// timing-moon.js — source of truth สำหรับ MoonPhaseVert (เฟสดวงจันทร์ · ซูเปอร์มูน · ปฏิทินจันทรคติ)
// intro เพลง 5วิ → พากย์ 11 ประโยค (gap 0.2วิ) → outro เพลง + credit

const DUR = [83, 101, 106, 103, 111, 107, 106, 101, 95, 95, 119]; // เสียงจริง (เฟรม · วัดด้วย ffprobe)
const GAP = 6;
const INTRO = 150;

const TEXT = [
  'ทำไมดวงจันทร์ เปลี่ยนรูปร่างทุกคืน?',
  'ดวงจันทร์โคจรรอบโลก ~29.5 วัน',
  'รูปร่างที่เปลี่ยน = ด้านสว่างที่เราเห็น มาก/น้อย',
  'หลายคนคิดว่า จันทร์เสี้ยว = เงาโลกบัง — ผิด!',
  'เงาโลกบังจันทร์ = จันทรุปราคา (นานๆ เกิดที)',
  'จันทร์สว่างสุดตอนเพ็ญ · ขนาดแทบไม่เปลี่ยน',
  'บางครั้ง วงโคจรพาจันทร์เข้าใกล้โลกเป็นพิเศษ',
  'เพ็ญ + เข้าใกล้สุด = ซูเปอร์มูน',
  'คนไทยผูกปฏิทินไว้กับดวงจันทร์มานาน',
  'นับ "ขึ้น–แรม" ตามเฟสที่เห็นจริงบนฟ้า',
  'ขึ้น ๑๕ ค่ำ ที่เราไหว้พระจันทร์ = คืนจันทร์เต็มดวง',
];

export const INTRO_FRAMES = INTRO;
export const SEG = [];
{
  let c = INTRO;
  for (let i = 0; i < DUR.length; i++) { SEG.push({from: c, end: c + DUR[i], text: TEXT[i]}); c += DUR[i] + GAP; }
}
export const VO_END = SEG[SEG.length - 1].end;
export const DURATION = 1770;
export const capTo = (i) => (SEG[i + 1] ? SEG[i + 1].from : VO_END);

export const BEATS = {
  hook:  {from: SEG[0].from, to: SEG[1].from},
  twist: {from: SEG[10].from, to: VO_END},
};
