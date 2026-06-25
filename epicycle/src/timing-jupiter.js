// timing-jupiter.js — JupiterOccultVert (ดวงจันทร์บังดาวพฤหัสบดี 3 พ.ย. 69 · เช้ามืด ทิศตะวันออก)
// DUR วัดจากเสียงโหราทาส F5 จริง public/vo-jupiter/ (ceil(sec*30)) · 9 ประโยค · verified ephem
const DUR=[159,155,126,153,177,137,175,142,150];
const GAP=6, INTRO=110;
const TEXT=[
  '๓ พ.ย. ดวงจันทร์จะบัง "ดาวพฤหัสบดี"',
  'พฤหัสบดี ดาวที่ใหญ่สุด หายหลังดวงจันทร์',
  'พฤหัสบดีเป็นดาว "วงนอก" ไกลจากดวงอาทิตย์กว่าโลก',
  'เห็นเป็นดวงกลมเต็ม — ไม่เป็นเสี้ยว',
  'ใหญ่กว่าจันทร์ ๔๐ เท่า · แต่ไกลกว่า ๒,๒๐๐ เท่า',
  'ส่องกล้องเห็นบริวาร ๔ ดวง เรียงเป็นแถว',
  'ลับหลังขอบสว่าง → โผล่ด้านมืด ~ตี ๕ ครึ่ง',
  'ภาคใต้เห็นบังเต็มดวง · ภาคกลางเห็นเฉียด',
  '๓ พ.ย. ๒๕๖๙ · เช้ามืด · ทิศตะวันออก',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;     // ~1532
export const DURATION=1770;                    // 59 วิ (Shorts)
export const CREDIT_AT=VO_END+75;              // credit + เพลงหรี่ ~2.5วิ หลังพากย์จบ (พอดี ≤59วิ)
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
export const BEATS={hook:{from:SEG[0].from,to:SEG[1].from},twist:{from:SEG[8].from,to:VO_END}};
