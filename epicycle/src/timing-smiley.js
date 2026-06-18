// timing-smiley.js — source of truth สำหรับ SmileyFace (จันทร์ยิ้ม)
// intro เพลง 2.5วิ → พากย์ 11 ประโยค (gap 6f) → outro + credit
// REVEAL = ช่วงเฉลยเส้นเล็ง/ระยะจริง (seg4–6) · ก่อน/หลัง = ภาพท้องฟ้าหน้ายิ้ม

const DUR = [111, 114, 134, 90, 86, 140, 98, 124, 110, 147, 161]; // เฟรม (วัดจริง ffprobe)
const GAP = 6;
const INTRO = 75;

const TEXT = [
  'ท้องฟ้า...ยิ้มให้เรา?',
  'ดาวสว่าง ๒ ดวง = ตา · จันทร์เสี้ยว = รอยยิ้ม',
  'ดวงตา = ดาวศุกร์ + ดาวพฤหัส (สว่างสุดบนฟ้า)',
  'เรียงใกล้กัน จนดูเป็นใบหน้ายิ้ม',
  'แต่จริงๆ ทั้งสามไม่ได้อยู่ใกล้กันเลย!',
  'จันทร์ ๓๘๔,๐๐๐ กม. · ศุกร์–พฤหัส ไกลกว่าหลายร้อยเท่า',
  'แค่บังเอิญอยู่ "ทิศเดียวกัน" เมื่อมองจากโลก',
  'ไทยใกล้เส้นศูนย์สูตร จันทร์หงายเป็นเรือ = ยิ้มชัด',
  'รอยยิ้ม = ด้านสว่างของจันทร์ ที่หันรับแสงอาทิตย์',
  'กลางเดือน มิ.ย. ๒๕๖๙ · ทิศตะวันตก หลังตะวันตกดิน',
  'โหราศาสตร์: จันทร์-ศุกร์-พฤหัส กุมกัน = ดาวศุภเคราะห์',
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

// ช่วงเฉลยเส้นเล็ง (overlay โลก+เส้น+ระยะ) — seg4 ("ไม่ได้อยู่ใกล้") → seg7 (กลับสู่ภาพท้องฟ้า)
export const REVEAL_FROM = SEG[4].from;
export const REVEAL_TO = SEG[7].from;
