// timing.js — source of truth สำหรับ Shorts60 (Caption / Narration / TextOverlay / Music sync จากที่นี่ที่เดียว)
// โครง: [intro เพลงเปิด 5วิ] → [เสียงพากย์ 13 ประโยค · เว้นวรรค 0.4วิ] → [outro เพลงดังต่อจนครบ ~59วิ]

const DUR = [90, 98, 72, 119, 116, 49, 62, 114, 83, 88, 78, 87, 119]; // ความยาวเสียงจริง (เฟรม)
const GAP = 6;      // เว้นวรรคระหว่างประโยค = 0.2 วินาที
const INTRO = 150;  // เพลงเปิดดังเต็ม 5 วินาที ก่อนเสียงพูด

// ข้อความ caption (โชว์ตัวเลขปกติ · เสียงพากย์อ่านเป็นคำจาก gen-vo.py · "ทอเลมี")
const TEXT = [
  'ทำไมดาวบนฟ้า ดูเหมือนเดินถอยหลัง?',
  '1,900 ปีก่อน ทอเลมี นักดาราศาสตร์กรีก',
  'อธิบายปริศนานี้ไว้แล้ว',
  'เขาวาดวงโคจรซ้อนวงโคจร = เอพิไซเคิล',
  'ดาวเดินวนในวงเล็ก ขณะวงใหญ่พาโคจรรอบโลก',
  'โมเดลนี้ผิด',
  'โลกไม่ใช่ศูนย์กลาง',
  'แต่แม่นพอทำนายท้องฟ้าได้ 1,400 ปี',
  'ความรู้นี้เดินทางจากกรีก สู่อินเดีย',
  'เติมราหู-เกตุ ครบพระเคราะห์ทั้งเก้า',
  'แล้วส่งต่อมาถึงโหราศาสตร์ไทย',
  'พระเคราะห์ที่นักโหราศาสตร์ไทยใช้ดูดวง',
  'คือดาวดวงเดียวกับที่ทอเลมีวาด เมื่อ 1,900 ปีก่อน',
];

export const INTRO_FRAMES = INTRO;
export const SEG = [];
{
  let c = INTRO;
  for (let i = 0; i < DUR.length; i++) {
    SEG.push({from: c, end: c + DUR[i], text: TEXT[i]});
    c += DUR[i] + GAP;
  }
}

export const VO_END = SEG[SEG.length - 1].end;   // เสียงพูดจบ → เริ่ม outro
export const DURATION = 1740;                     // 58 วิ — ตัดวินาทีสุดท้ายออก (พี่สั่ง · credit/fade ปลาย recalc ปิดเนียนที่ 58วิ)

// caption แสดงต่อเนื่องถึง segment ถัดไป (segment สุดท้ายค้างถึง VO_END)
export const capTo = (i) => (SEG[i + 1] ? SEG[i + 1].from : VO_END);

// ช่วง title 7-beat — ผูกกับ index ของ SEG (13 segments)
export const BEATS = {
  hook:      {from: SEG[0].from,  to: SEG[1].from},
  setup:     {from: SEG[1].from,  to: SEG[3].from},
  wrong:     {from: SEG[3].from,  to: SEG[5].from},
  interrupt: {from: SEG[5].from,  to: SEG[8].from},   // โมเดลผิด + โลกไม่ใช่ศูนย์กลาง + แม่น 1,400 ปี
  lineage:   {from: SEG[8].from,  to: SEG[11].from},  // กรีก-อินเดีย + พระเคราะห์ทั้งเก้า + ไทย
  twist:     {from: SEG[11].from, to: VO_END},        // punchline ค้างถึงเสียงจบ แล้ว outro เพลง
};
