import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,SS} from '../physics.js';

// ── Eclipse Phase — กรอบ epicycle เดียวกับ MoonPhase/VenusPhase ──
// ซ้าย: แผนภาพ epicycle (โลก·อาทิตย์·จันทร์) + ราหู/เกตุบนวง
// ขวา: "ภาพที่เห็นจากโลก" จานอาทิตย์=จานจันทร์ (เท่ากัน) → จันทร์เลื่อนผ่าน = เฟสอุปราคา
const W=1080,H=1080;
const SUN=PLANETS.find(p=>p.id==='sun');
const MOON=PLANETS.find(p=>p.id==='moon');
const SYNODIC=360/(MOON.dS-SS);
const SPEED=SYNODIC/900;             // 1 เดือน ≈ 30วิ (ช้าพอเห็นเฟสอุปราคาตอน align)
const INC=5,NODE=-120;               // วงจันทร์เอียง 5° · ทิศราหู (จัดให้เดือนดับแรก ~fr923 ตรงราหู = สุริยุปราคา)
const tr=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const wrap=a=>{a=((a%360)+360)%360;return a>180?a-360:a;};
const STARS=Array.from({length:150},(_,i)=>({x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),r:i%8===0?1.2:.5,tw:i*0.41}));

// สถานะ: ลองจิจูด/ละติจูด ของจันทร์ที่ "เห็นจากโลก"
function st(f){
  const sm=gP(SUN,f),mm=gP(MOON,f);
  const sLon=deg(Math.atan2(sm.y,sm.x)),mLon=deg(Math.atan2(mm.y,mm.x));
  const elong=wrap(mLon-sLon);                       // 0=ดับ, ±180=เพ็ญ
  const lat=INC*Math.sin(tr(mLon-NODE));             // ละติจูด (°) เหนือ/ใต้สุริยวิถี
  return{sm,mm,sLon,mLon,elong,lat};
}

// วาดเสี้ยวที่ถูกบัง: จานฐาน c0 ถูกจานบัง (occulter) ที่เลื่อน (ox,oy) รัศมี ro
function drawBitten(ctx,x,y,r,baseFill,glow,ox,oy,ro,occFill){
  ctx.save();
  if(glow){ctx.shadowColor=glow;ctx.shadowBlur=40;}
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=baseFill;ctx.fill();ctx.shadowBlur=0;
  // ตัดส่วนที่ถูกบัง
  ctx.beginPath();ctx.arc(x+ox,y+oy,ro,0,7);ctx.fillStyle=occFill;ctx.fill();
  ctx.restore();
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');const f=frame*SPEED;
  const {sm,mm,sLon,mLon,elong,lat}=st(f);

  ctx.fillStyle='#03050e';ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.22;ctx.fillStyle='#bcd0ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});ctx.globalAlpha=1;

  // ===== ซ้าย: แผนภาพ epicycle =====
  const cx=300,cy=560,sc=2.0;
  ctx.beginPath();ctx.arc(cx,cy,SUN.defR*sc,0,7);ctx.strokeStyle='rgba(255,180,80,.16)';ctx.lineWidth=1;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(cx,cy,MOON.defR*sc,0,7);ctx.strokeStyle='rgba(170,190,235,.22)';ctx.lineWidth=1;ctx.setLineDash([3,6]);ctx.stroke();ctx.setLineDash([]);
  // ราหู/เกตุ บนวงจันทร์
  [[NODE,'ราหู'],[NODE+180,'เกตุ']].forEach(([lo,nm])=>{const a=tr(lo);const x=cx+Math.cos(a)*MOON.defR*sc,y=cy+Math.sin(a)*MOON.defR*sc;
    ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fillStyle='rgba(150,110,230,.9)';ctx.fill();
    ctx.fillStyle='#c4a8ff';ctx.font='600 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(nm,x,y-13);});
  const sx=cx+sm.x*sc,sy=cy+sm.y*sc,mx=cx+mm.x*sc,my=cy+mm.y*sc;
  ctx.strokeStyle='rgba(255,180,80,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(sx,sy);ctx.stroke();
  ctx.strokeStyle='rgba(190,205,255,.4)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(mx,my);ctx.stroke();
  // โลก
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,12);eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
  ctx.beginPath();ctx.arc(cx,cy,11,0,7);ctx.fillStyle=eg;ctx.fill();
  ctx.fillStyle='rgba(190,220,255,.9)';ctx.font='600 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+13);
  // ดวงอาทิตย์ (ในแผนภาพ — ใหญ่กว่าตามจริงในอวกาศ)
  ctx.shadowColor='#ff8a2a';ctx.shadowBlur=24;const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,16);sg.addColorStop(0,'#ffe7a0');sg.addColorStop(1,'#ff6a18');
  ctx.beginPath();ctx.arc(sx,sy,14,0,7);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  // ดวงจันทร์ (ในแผนภาพ)
  ctx.beginPath();ctx.arc(mx,my,7,0,7);ctx.fillStyle='#dfe6f5';ctx.fill();
  ctx.fillStyle='rgba(180,200,240,.7)';ctx.font='500 13px sans-serif';ctx.textBaseline='top';ctx.fillText('① กลไก (มองจากนอก)',cx,cy-MOON.defR*sc-30);

  // ===== ขวา: ภาพที่เห็นจากโลก =====
  const px=760,py=560,RSKY=300;
  ctx.save();ctx.beginPath();ctx.arc(px,py,RSKY,0,7);ctx.clip();
  ctx.fillStyle='#060912';ctx.fillRect(px-RSKY,py-RSKY,RSKY*2,RSKY*2);
  const KX=150,KY=42,RD=70;                          // px/° · รัศมีจาน (อาทิตย์≈จันทร์)
  const near=Math.abs(elong)<90;                     // โหมดสุริยะ(ดับ)/จันทร(เพ็ญ)
  if(near){
    // ฟ้ากลางวันมืดลงตามการบัง
    const cov=Math.max(0,1-Math.hypot(elong*KX,lat*KY)/(RD*2));
    const dk=Math.pow(cov,2);
    ctx.fillStyle=`rgb(${Math.round(60-50*dk)},${Math.round(110-95*dk)},${Math.round(190-160*dk)})`;ctx.fillRect(px-RSKY,py-RSKY,RSKY*2,RSKY*2);
    // ดวงอาทิตย์ (กลาง) ถูกจันทร์(จานมืดเท่ากัน)เลื่อนทับ
    const ox=elong*KX,oy=-lat*KY;
    if(cov>0.985){ // โคโรนา
      const cg=ctx.createRadialGradient(px,py,RD,px,py,RD*2.3);cg.addColorStop(0,'rgba(255,250,225,.6)');cg.addColorStop(1,'rgba(255,250,225,0)');
      ctx.fillStyle=cg;ctx.beginPath();ctx.arc(px,py,RD*2.3,0,7);ctx.fill();}
    drawBitten(ctx,px,py,RD,'#ffd23a',cov>0.6?null:'#ffae20',ox,oy,RD,'#0a0a12');
  }else{
    ctx.fillStyle='#060912';ctx.fillRect(px-RSKY,py-RSKY,RSKY*2,RSKY*2);
    // จันทร์เพ็ญ (กลาง) · เงาโลก(จานคล้ำใหญ่กว่า)เลื่อนเข้า
    const e2=wrap(elong-180);                        // ระยะจากตรงข้ามอาทิตย์
    const ox=e2*KX,oy=-lat*KY,inShadow=Math.hypot(ox,oy)<RD*1.3;
    drawBitten(ctx,px,py,RD,inShadow?'#c43a2a':'#e9eefc',inShadow?'#ff4530':'#cdd9ff',ox,oy,RD*1.45,'rgba(40,16,24,.92)');
  }
  ctx.restore();
  ctx.strokeStyle='rgba(150,170,230,.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,py,RSKY,0,7);ctx.stroke();
  ctx.fillStyle='rgba(180,200,240,.7)';ctx.font='500 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('② ภาพที่เห็นจากโลก',px,py-RSKY-10);

  // หัวเรื่อง + แคปชัน
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#e8d08a';ctx.font='700 30px Georgia,serif';ctx.fillText('เฟสอุปราคา — ในระบบ Epicycle',40,60);
  ctx.fillStyle='rgba(230,208,138,.78)';ctx.font='500 17px sans-serif';ctx.fillText('จานอาทิตย์ = จานจันทร์ (เท่ากัน) → จันทร์เลื่อนผ่าน = เฟสการบัง',40,88);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 15px sans-serif';ctx.fillText('Horatad created · 11 June 2026',W-40,56);

  const atNode=Math.abs(lat)<0.55;
  ctx.textAlign='center';
  if(Math.abs(elong)<90&&atNode){ctx.fillStyle='#ffd24a';ctx.font='700 27px sans-serif';ctx.fillText('🌞 สุริยุปราคา — ผ่านราหู/เกตุพอดี จึงบัง',W/2,H-42);}
  else if(Math.abs(elong)>90&&atNode){ctx.fillStyle='#ff7a68';ctx.font='700 27px sans-serif';ctx.fillText('🌑 จันทรุปราคา — เพ็ญตรงราหู/เกตุ เข้าเงาโลก',W/2,H-42);}
  else{ctx.fillStyle='rgba(190,205,255,.82)';ctx.font='500 18px sans-serif';ctx.fillText('จันทร์อยู่สูง/ต่ำกว่าแนว (ลาดติจูด '+lat.toFixed(1)+'°) — ไม่บัง',W/2,H-42);}
}

export function EclipsePhase({offset=0}={}){
  const frame=useCurrentFrame()+offset;const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  return(<AbsoluteFill style={{background:'#03050e'}}><canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/></AbsoluteFill>);
}
