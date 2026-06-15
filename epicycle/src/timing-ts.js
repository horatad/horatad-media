// timing-ts.js — source of truth สำหรับ TwoSystemsVert (เทียบ geo/helio)
// intro เพลง 5วิ → พากย์ 14 ประโยค (gap 0.2วิ) → outro เพลง

const DUR = [121, 70, 93, 81, 111, 96, 78, 76, 99, 83, 84, 57, 120, 111]; // เสียงจริง (เฟรม)
const GAP = 6;
const INTRO = 150;

const TEXT = [
  'ทำไมคนโบราณวาดจักรวาลผิด มา 1,400 ปี?',
  'เมื่อราว 1,900 ปีก่อน',
  'ทอเลมีให้โลกเป็นศูนย์กลางจักรวาล',
  'แต่ดาวเคราะห์ดูเดินถอยหลัง',
  'แก้ด้วยเอพิไซเคิล — วงโคจรซ้อนวงโคจร',
  'ความจริง: ดวงอาทิตย์เป็นศูนย์กลาง',
  'ย้ายดวงอาทิตย์มาไว้ตรงกลาง',
  'ทุกอย่างเรียบง่ายขึ้นทันที',
  'ดาวถอยหลัง = ภาพลวงตาตอนโลกแซง',
  'บน = แบบทอเลมี (วงยุ่บยั่บ)',
  'ล่าง = แบบจริง (เรียบกว่ามาก)',
  'ทอเลมีไม่ได้โง่',
  'แบบจำลองของเขาถูกใช้นานกว่า 1,400 ปี',
  'แต่คำอธิบายที่เรียบง่ายกว่า มักใกล้ความจริงที่สุด',
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
  hook:  {from: SEG[0].from,   to: SEG[1].from},
  twist: {from: SEG[13].from,  to: VO_END},
};
