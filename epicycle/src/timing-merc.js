// timing-merc.js — source of truth สำหรับ MercuryRetroVert (ดาวพุธพักร = ภาพลวงตา)
// intro เพลง 5วิ → พากย์ 11 ประโยค (gap 0.2วิ) → outro เพลง + credit

const DUR = [127, 143, 132, 85, 124, 106, 124, 157, 85, 99, 111]; // เสียงจริง (เฟรม · ffprobe)
const GAP = 6;
const INTRO = 150;

const TEXT = [
  'ทำไมพอ "ดาวพุธพักร" ทุกคนถึงกังวล?',
  'โหราศาสตร์: ช่วงพักร = การสื่อสาร/สัญญาติดขัด',
  'บนฟ้าจริง พุธดู "หยุด" แล้วเดินถอยหลังจริงๆ',
  'แต่...ดาวพุธเดินถอยหลังจริงหรือ?',
  'พุธอยู่วงใน โคจรเร็วกว่าโลก ~4 เท่า',
  'พอพุธแซงโลก มาอยู่ระหว่างโลก–ดวงอาทิตย์',
  'เส้นเล็ง โลก→พุธ บนหมู่ดาว เลย "วกถอย"',
  'เหมือนขับรถแซงคันอื่น — คันนั้นดูเหมือนถอยหลัง',
  'ดาวพุธไม่ได้เดินถอยจริงสักนิด',
  'เป็นภาพลวงตา จากมุมมองบนโลก',
  '"พักร" = เรขาคณิต ไม่ใช่ลางร้าย',
];

export const INTRO_FRAMES = INTRO;
export const SEG = [];
{
  let c = INTRO;
  for (let i = 0; i < DUR.length; i++) { SEG.push({from: c, end: c + DUR[i], text: TEXT[i]}); c += DUR[i] + GAP; }
}
export const VO_END = SEG[SEG.length - 1].end;
export const DURATION = 1740; // 58วิ (มาตรฐานใหม่ 16 มิ.ย. — เลี่ยงเตือนลิขสิทธิ์ YouTube · เดิม 1770)
export const capTo = (i) => (SEG[i + 1] ? SEG[i + 1].from : VO_END);

export const BEATS = {
  hook:  {from: SEG[0].from, to: SEG[1].from},
  twist: {from: SEG[10].from, to: VO_END},
};
