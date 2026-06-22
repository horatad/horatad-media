// timing-opp.js — OppositionVert (ดาวเสาร์ใกล้โลก/opposition)
const DUR=[119,94,120,91,99,121,93,100,89,97,133];
const GAP=6, INTRO=150;
const TEXT=[
  'บางคืน ดาวเสาร์สว่างพิเศษ + เห็นได้ทั้งคืน',
  'ช่วงนั้น = ดาวเสาร์ "ตรงข้ามดวงอาทิตย์"',
  'โลกโคจรมาอยู่กลาง ระหว่างดวงอาทิตย์–เสาร์',
  'ดาวเสาร์จึงใกล้โลกที่สุดในรอบปี',
  'ใกล้สุด → ดูใหญ่สุด & สว่างสุด',
  'อาทิตย์ตก เสาร์ขึ้นพอดี → เห็นทั้งคืน',
  'ช่วงนี้เอง เสาร์ดูเหมือน "เดินถอยหลัง"',
  'เพราะโลกวงในกว่า วิ่งแซงมันไป',
  'โหราศาสตร์เรียกการถอยหลังนี้ว่า "พักร"',
  'แต่จริงๆ = จังหวะที่ดาวใกล้เราที่สุด',
  'ปีนี้ เสาร์ใกล้โลกสุด ๔ ต.ค. ๒๕๖๙',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;
export const DURATION=1770;
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
export const BEATS={hook:{from:SEG[0].from,to:SEG[1].from},twist:{from:SEG[10].from,to:VO_END}};
