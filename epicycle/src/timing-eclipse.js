// timing-eclipse.js — EclipseStoryVert (อุปราคา · ราหู→เงา→ซารอส)
const DUR=[134,74,98,145,84,141,126,119,124,119,145];
const GAP=6, INTRO=150;
const TEXT=[
  'คนโบราณเห็นกลางวันมืดลง ดาวโผล่กลางวัน',
  'เชื่อกันว่า "ราหูอมดวงอาทิตย์"',
  'ภาพจริง: ดวงจันทร์เลื่อนมาบังดวงอาทิตย์พอดี',
  'จานจันทร์–จานอาทิตย์ ดูโตเท่ากัน → บังสนิท',
  'นี่คือ "สุริยุปราคา" ไม่ใช่ราหู',
  'ราหู–เกตุ จริงๆ = จุดตัดวงโคจร (โหนด)',
  'อุปราคาเกิด เมื่อจันทร์มาอยู่ตรงจุดนั้นพอดี',
  'เงาโลกทาบดวงจันทร์ = "จันทรุปราคา"',
  'อุปราคาวนซ้ำเป็นวงรอบ เรียก "ซารอส"',
  'ทุกๆ ~18 ปี รูปแบบเดิมกลับมาอีก',
  '"ราหู" ที่จริง = เรขาคณิตของเงา',
];
export const INTRO_FRAMES=INTRO;
export const SEG=[];
{let c=INTRO;for(let i=0;i<DUR.length;i++){SEG.push({from:c,end:c+DUR[i],text:TEXT[i]});c+=DUR[i]+GAP;}}
export const VO_END=SEG[SEG.length-1].end;
export const DURATION=1770;
export const capTo=(i)=>(SEG[i+1]?SEG[i+1].from:VO_END);
// ช่วงเวลาแต่ละฉากย่อย (sync กับ narration): ground→solar→lunar→saros
export const SCENES={
  ground:{from:0,           to:SEG[5].from}, // intro+seg0-4: ราหูอม→จันทร์บัง→จานโตเท่ากัน→สุริยุปราคา (ภาพจริง)
  solar: {from:SEG[5].from, to:SEG[7].from}, // seg5-6: "ไม่ใช่ราหู" + ราหู-เกตุ=จุดตัด (node map)
  lunar: {from:SEG[7].from, to:SEG[9].from}, // seg7-8: เกิดเมื่อตรงจุด + เงาโลกทาบจันทร์=จันทรุปราคา
  saros: {from:SEG[9].from, to:DURATION},    // seg9-10: ซารอส 18ปี + เรขาคณิตของเงา
};
export const BEATS={hook:{from:SEG[0].from,to:SEG[1].from},twist:{from:SEG[10].from,to:VO_END}};
