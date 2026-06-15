import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── ฉากปิด: Saros — คนโบราณ(บาบิโลน)ทำนายอุปราคาได้ "ด้วยรูปแบบซ้ำ" โดยไม่ต้องเข้าใจกลไก ──
const W=1080,H=1080;
const STARS=Array.from({length:160},(_,i)=>({x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),r:i%8===0?1.2:.5,tw:i*0.41}));
// ตำแหน่งอุปราคาในหนึ่งชุด Saros (รูปแบบเดียวกัน 2 ชุด)
const PAT=[0.04,0.13,0.27,0.30,0.46,0.59,0.62,0.78,0.91];
const KIND=[1,0,1,0,1,0,1,0,1];      // 1=สุริยะ 0=จันทร

function glyph(ctx,x,y,solar,a){
  ctx.globalAlpha=a;
  if(solar){ctx.shadowColor='#ffc234';ctx.shadowBlur=12;ctx.fillStyle='#ffc234';ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#0a0a12';ctx.beginPath();ctx.arc(x+1.5,y,5,0,7);ctx.fill();}
  else{ctx.shadowColor='#ff6a5a';ctx.shadowBlur=12;ctx.fillStyle='#ff6a5a';ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();ctx.shadowBlur=0;}
  ctx.globalAlpha=1;
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#04050e';ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.22;ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});ctx.globalAlpha=1;

  // หัวเรื่อง
  ctx.textAlign='left';ctx.fillStyle='#e8d08a';ctx.font='700 32px Georgia,serif';ctx.fillText('แล้วคนโบราณ "ทำนาย" อุปราคาได้ยังไง?',40,72);
  ctx.fillStyle='rgba(230,208,138,.8)';ctx.font='500 19px sans-serif';ctx.fillText('คำตอบที่น่าทึ่ง — โดยไม่ต้องเข้าใจกลไกเลย',40,104);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 15px sans-serif';ctx.fillText('Horatad created · 11 June 2026',W-40,60);

  const y1=380,y2=620,x0=90,x1=W-90;
  const map=(t,base)=>x0+(t)* (x1-x0);
  const rev=t=>interpolate(frame,[20+t*120,55+t*120],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

  // แถบ 1 — ชุดที่ผ่านมา
  ctx.strokeStyle='rgba(150,170,230,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y1);ctx.lineTo(x1,y1);ctx.stroke();
  ctx.fillStyle='rgba(200,210,255,.7)';ctx.font='600 16px sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText('รอบอุปราคาที่บันทึกไว้',x0,y1-14);
  PAT.forEach((t,i)=>glyph(ctx,map(t),y1,KIND[i],rev(i*0.3)));

  // แถบ 2 — ทำนายชุดถัดไป (รูปแบบ "เดียวกัน")
  ctx.strokeStyle='rgba(150,170,230,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y2);ctx.lineTo(x1,y2);ctx.stroke();
  ctx.fillStyle='rgba(200,210,255,.7)';ctx.font='600 16px sans-serif';ctx.fillText('ทำนายล่วงหน้า → รูปแบบ "ซ้ำเดิม"',x0,y2-14);
  const r2=interpolate(frame,[150,210],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  PAT.forEach((t,i)=>glyph(ctx,map(t),y2,KIND[i],r2));

  // ลูกศรเชื่อม +1 Saros
  const aa=interpolate(frame,[210,250],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  if(aa>0){ctx.globalAlpha=aa;ctx.strokeStyle='#7fd0ff';ctx.lineWidth=2;ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.moveTo(map(PAT[0]),y1+14);ctx.lineTo(map(PAT[0]),y2-14);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#9fe0ff';ctx.font='700 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('+ 1 รอบ Saros',map(PAT[0])+150,(y1+y2)/2);
    ctx.fillStyle='rgba(159,224,255,.8)';ctx.font='500 16px sans-serif';ctx.fillText('= 18 ปี 11 วัน (223 เดือนจันทร์)',map(PAT[0])+150,(y1+y2)/2+24);
    ctx.globalAlpha=1;}

  // ข้อความปิด
  const tx=interpolate(frame,[250,290],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  ctx.globalAlpha=tx;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#ffe6a0';ctx.font='700 24px sans-serif';ctx.fillText('บาบิโลนจดบันทึกท้องฟ้าเป็นร้อยปี → พบว่าอุปราคา "วนซ้ำ"',W/2,y2+150);
  ctx.fillStyle='rgba(220,230,255,.9)';ctx.font='500 19px sans-serif';
  ctx.fillText('ทำนายได้แม่น — ทั้งที่ยังไม่รู้ว่าโลกโคจรรอบอะไร หรือเงาตกอย่างไร',W/2,y2+184);
  ctx.fillStyle='rgba(200,170,255,.85)';ctx.font='500 18px sans-serif';
  ctx.fillText('🌑 และมองอุปราคาเป็น "ลางร้าย" — ลางกษัตริย์สิ้น',W/2,y2+218);
  ctx.globalAlpha=1;
}

export function EclipseSaros({offset=0}={}){
  const frame=useCurrentFrame()+offset;const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  return(<AbsoluteFill style={{background:'#04050e'}}><canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/></AbsoluteFill>);
}
