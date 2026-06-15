// timing-venus.js — VenusPhaseVert / VenusBrightestVert (เฟสดาวศุกร์ · กาลิเลโอ)
const DUR=[104,116,103,95,123,110,85,110,116,139,109];
const GAP=6, INTRO=150;
const TEXT=[
  'ดาวศุกร์ = ดาวที่สว่างที่สุดบนฟ้ายามค่ำ',
  'รู้ไหม? ดาวศุกร์ก็มี "ข้างขึ้น–ข้างแรม" เหมือนจันทร์',
  'เพราะมันโคจรรอบดวงอาทิตย์ วงในใกล้กว่าโลก',
  'เราเห็นด้านสว่างของมัน มาก/น้อย ต่างกัน',
  'ไกล (อีกฟากดวงอาทิตย์) = เต็มดวง แต่เล็ก & จาง',
  'ใกล้โลก = เสี้ยวบาง แต่จานใหญ่ขึ้นมาก',
  'เสี้ยวบางนี่แหละ ดาวศุกร์สว่างที่สุด',
  '400 ปีก่อน กาลิเลโอ ส่องกล้องเห็นเฟสนี้',
  'พิสูจน์ว่า ศุกร์โคจรรอบดวงอาทิตย์ ไม่ใช่รอบโลก',
  'ศุกร์ไม่เคยห่างดวงอาทิตย์มาก → เห็นแค่หัวค่ำ/รุ่งเช้า',
  'คนไทยเรียก "ดาวประจำเมือง" & "ดาวประกายพรึก"',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;
export const DURATION=1770;
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
export const BEATS={hook:{from:SEG[0].from,to:SEG[1].from},twist:{from:SEG[10].from,to:VO_END}};
