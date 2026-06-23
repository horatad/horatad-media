// timing-occult.js — OccultationVert (ดวงจันทร์บังดาวศุกร์ 14 ก.ย. 69)
// DUR วัดจากเสียงจริง public/vo-occult/ (ceil(sec*30))
const DUR=[115,128,85,111,142,126,87,103,118,96,159];
const GAP=6, INTRO=150;
const TEXT=[
  '๑๔ ก.ย. ดวงจันทร์จะบัง "ดาวศุกร์"',
  'ดาวศุกร์ที่สว่างสุด หายไปหลังดวงจันทร์',
  'ปรากฏการณ์ "ดวงจันทร์บังดาวศุกร์"',
  'ดวงจันทร์ใกล้โลก แค่ ๓๘๐,๐๐๐ กม.',
  'ดาวศุกร์ไกลกว่าเกือบ ๒๐๐ เท่า — แต่ดูซ้อนกัน',
  'จันทร์โคจรเร็ว เคลื่อนไปบังดาวที่ไกลกว่า',
  'ทำไมเห็นแค่หัวค่ำ ทางทิศตะวันตก?',
  'เพราะศุกร์เป็นดาว "วงใน" ใกล้ดวงอาทิตย์เสมอ',
  'จึงเห็นแค่หัวค่ำ–เช้ามืด ใกล้ดวงอาทิตย์',
  'ดาวศุกร์ก็เป็น "เสี้ยว" เหมือนดวงจันทร์',
  '๑๔ ก.ย. ๒๕๖๙ · เริ่มบัง ๑๙:๒๘ น. · ทิศตะวันตก',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;
export const DURATION=1770;
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
export const BEATS={hook:{from:SEG[0].from,to:SEG[1].from},twist:{from:SEG[10].from,to:VO_END}};
