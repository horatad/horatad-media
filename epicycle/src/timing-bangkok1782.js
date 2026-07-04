// timing-bangkok1782.js — Bangkok1782Vert (ท้องฟ้าคืนสถาปนากรุงเทพ ๖ เม.ย. ๒๓๒๕)
// verified ephem: ฤกษ์ 06:54 BKK LMT → sun alt=9.7° (กลางวัน) · Jupiter-Saturn 2.44° · Venus alt32°
// plot twist: ดาวมองไม่เห็นตาเปล่าตอนพิธี → โหราจารย์ใช้คัมภีร์สุริยยาตร์คำนวณ
// DUR measured from actual F5-TTS output (30fps) — updated 2026-07-03
const DUR=[135,106,107,128,191,170,136,119,128,170,151];
const GAP=7, INTRO=80;
const TEXT=[
  'ก่อนรุ่ง วันหกเมษายน สองพันสามร้อยยี่สิบห้า ฟ้ายังมืดอยู่',
  'รัชกาลที่หนึ่งกำลังจะสถาปนากรุงรัตนโกสินทร์',
  'ทางตะวันออก ดาวศุกร์ส่องสว่าง ดาวพุธอยู่ข้างๆ',
  'ดาวพฤหัสบดีกับดาวเสาร์กุมกันอยู่ ห่างกันไม่ถึงสามองศา',
  'แต่ฤกษ์พิธีอยู่ที่หกโมงห้าสิบสี่นาที ดวงอาทิตย์ขึ้นแล้ว ดาวทั้งหมดหายไปจากสายตา',
  'ในปี ๒๓๒๕ ยังไม่มีเวลามาตรฐาน แต่ละเมืองใช้เวลาสุริยะ',
  'กรุงเทพที่ร้อยองศาครึ่งตะวันออก ช้ากว่าเวลาโซนสิบแปดนาที',
  'รัชกาลที่หกประกาศเวลามาตรฐาน ปีสองพันสี่ร้อยหกสาม',
  'หกโมงห้าสิบสี่ เวลาสุริยะ คือเจ็ดโมงสิบสอง เวลามาตรฐาน',
  'โหราจารย์ใช้คัมภีร์สุริยยาตร์คำนวณ รู้ว่าดาวพฤหัสกับเสาร์ยังกุมกันอยู่',
  'ดาวสองดวงนี้กุมกันทุกยี่สิบปี และทุกครั้ง ก็มีบางอย่างเปลี่ยนไป',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;   // 1691f = 56.4วิ
export const DURATION=1770;
export const CREDIT_AT=VO_END+34;            // 1725f (Music: >VO_END+30 ✓ · Credit: +20=1745 < DUR-20=1750 ✓)
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
export const BEAT={
  hook:    SEG[0].from,    // 80:   ก่อนรุ่ง (ฟ้ามืด)
  date:    SEG[1].from,    // 222:  การ์ดวันที่
  venus:   SEG[2].from,    // 335:  ดาวศุกร์+พุธ ปรากฏ
  jupiter: SEG[3].from,    // 449:  Jupiter-Saturn กุมกัน
  dawn:    SEG[4].from,    // 584:  ฟ้าสว่าง ดาวหาย (plot twist)
  time:    SEG[5].from,    // 782:  Shot B-TIME — เรื่องเวลาท้องถิ่น
  astro:   SEG[9].from,    // 1363: Shot C — สุริยยาตร์คำนวณ
  payoff:  SEG[10].from,   // 1540: Shot E — ครุฑ + payoff
};
