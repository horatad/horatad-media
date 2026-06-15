import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

// ── อุปราคาในสายตาคนโบราณ — มองจากโลกขึ้นฟ้า (แผนที่ท้องฟ้า) ──
// อาทิตย์เดินตาม "สุริยวิถี" · จันทร์เดินตามทางของมันที่เอียงเล็กน้อย → ตัดกัน 2 จุด = ราหู(หัว)/เกตุ(หาง)
// อาทิตย์–จันทร์ "ขนาดเท่ากัน" บนฟ้า (~0.5°) · อุปราคาเกิดเมื่อสองดวงมาเจอกันตรงจุดตัด ("ราหูอม")
const W=1080,H=1080,SPEED=2;
const ECY=600;                       // เส้นสุริยวิถี (แนวนอน)
const AMP=120;                       // แอมพลิจูดทางจันทร์ (ขยายจากจริง ~5° ให้เห็นชัด)
const NODE=90;                       // ลองจิจูดราหู (จุดตัดขาขึ้น) · เกตุ = +180
const WM=2.0,WS=WM/13.37;            // จันทร์เร็ว · อาทิตย์ 1 รอบฟ้า = ~13.4 เดือนจันทร์
const SUN_R=23,MOON_R=22;            // ขนาดปรากฏ ~เท่ากัน
const tr=d=>d*Math.PI/180;
const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:200},(_,i)=>({x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),r:i%8===0?1.2:.5,tw:i*0.41}));

const mapX=lon=>{let l=((lon%360)+360)%360;return l/360*W;};
const moonLat=lm=>AMP*Math.sin(tr(lm-NODE));         // px เหนือ/ใต้สุริยวิถี (ขึ้น=ลบ y)
const wrap=a=>{a=((a%360)+360)%360;return a>180?a-360:a;};

function state(f){
  const ls=f*WS,lm=f*WM;
  const dLon=wrap(lm-ls);                            // จันทร์เทียบอาทิตย์
  const latPx=moonLat(lm);
  const nearNode=Math.abs(latPx)<MOON_R*0.9;         // จันทร์ใกล้สุริยวิถี = ใกล้ราหู/เกตุ
  const solar=Math.abs(dLon)<5 && nearNode;          // เดือนดับ ตรงจุดตัด → บังอาทิตย์
  const lunar=Math.abs(Math.abs(dLon)-180)<5 && nearNode; // เพ็ญ ตรงจุดตัด → เข้าเงา
  return{ls,lm,dLon,latPx,solar,lunar};
}

function disc(ctx,x,y,r,c0,c1,glow,blur){
  ctx.shadowColor=glow;ctx.shadowBlur=blur;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c0);g.addColorStop(1,c1);
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');const f=frame*SPEED;
  const {ls,lm,dLon,latPx,solar,lunar}=state(f);

  // พื้นฟ้ากลางคืน
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#070a1c');bg.addColorStop(1,'#02030a');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  STARS.forEach(st=>{ctx.globalAlpha=.07+Math.abs(Math.sin(st.tw+frame*.015))*.26;ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(st.x*W,st.y*H,st.r,0,7);ctx.fill();});ctx.globalAlpha=1;

  // ราศี 12 ตามสุริยวิถี
  for(let i=0;i<12;i++){const x=mapX(i*30);ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,ECY-150);ctx.lineTo(x,ECY+150);ctx.stroke();
    ctx.fillStyle='rgba(200,210,255,.4)';ctx.font='500 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ZS[i],mapX(i*30+15),ECY-135);}

  // เส้นสุริยวิถี (ทางเดินดวงอาทิตย์)
  ctx.beginPath();ctx.moveTo(0,ECY);ctx.lineTo(W,ECY);
  ctx.strokeStyle='rgba(255,200,110,.55)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='rgba(255,200,110,.8)';ctx.font='600 15px sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText('ทางเดินดวงอาทิตย์ (สุริยวิถี)',16,ECY-6);

  // ทางเดินดวงจันทร์ (เอียง — คลื่นไซน์)
  ctx.beginPath();for(let x=0;x<=W;x+=6){const lon=x/W*360;const y=ECY-moonLat(lon);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
  ctx.strokeStyle='rgba(150,190,255,.6)';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(150,190,255,.85)';ctx.textBaseline='top';ctx.fillText('ทางเดินดวงจันทร์ (เอียง)',16,ECY-moonLat(0)+8);

  // จุดตัด ราหู / เกตุ
  [[NODE,'ราหู','หัว'],[NODE+180,'เกตุ','หาง']].forEach(([lon,nm,tag])=>{
    const x=mapX(lon);
    ctx.beginPath();ctx.arc(x,ECY,7,0,7);ctx.fillStyle='rgba(120,90,200,.9)';ctx.fill();
    ctx.strokeStyle='rgba(190,160,255,.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,ECY,12,0,7);ctx.stroke();
    ctx.fillStyle='#c4a8ff';ctx.font='700 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(nm,x,ECY+16);
    ctx.fillStyle='rgba(196,168,255,.6)';ctx.font='400 12px sans-serif';ctx.fillText('('+tag+')',x,ECY+38);
  });

  // เงาโลกบนฟ้า (จุดตรงข้ามดวงอาทิตย์) — สำหรับจันทรุปราคา
  const antiX=mapX(ls+180);
  ctx.beginPath();ctx.arc(antiX,ECY,MOON_R+10,0,7);ctx.fillStyle='rgba(60,30,40,.35)';ctx.fill();

  // ดวงอาทิตย์ (บนสุริยวิถี)
  const sx=mapX(ls),sy=ECY;
  // ดวงจันทร์
  const mx=mapX(lm),my=ECY-latPx;

  if(!solar)disc(ctx,sx,sy,SUN_R,'#fff6d8','#ff9a14','#ffb23a',34);
  else{ // สุริยุปราคา: จานสว่าง + โคโรนา (จะถูกจันทร์บัง)
    ctx.shadowColor='#fff2c0';ctx.shadowBlur=46;ctx.beginPath();ctx.arc(sx,sy,SUN_R+8,0,7);ctx.fillStyle='rgba(255,240,190,.5)';ctx.fill();ctx.shadowBlur=0;
    disc(ctx,sx,sy,SUN_R,'#fff6d8','#ffb020','#ffd060',30);
  }
  ctx.fillStyle='rgba(255,210,140,.95)';ctx.font='600 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  if(!solar)ctx.fillText('ดวงอาทิตย์',sx,sy+SUN_R+6);

  // ดวงจันทร์ (วาดทับ — อยู่ใกล้โลกกว่า)
  if(lunar)disc(ctx,mx,my,MOON_R,'#ff7a68','#b22216','#ff4530',24);          // จันทร์สีเลือด
  else if(solar)disc(ctx,mx,my,MOON_R,'#1a1a24','#000','#000',0);             // จานมืดบังอาทิตย์
  else disc(ctx,mx,my,MOON_R,'#ffffff','#d7e0f5','#cdd9ff',14);              // จันทร์ปกติ
  ctx.fillStyle='rgba(225,232,255,.95)';ctx.font='600 15px sans-serif';ctx.textBaseline='bottom';
  if(!solar)ctx.fillText('ดวงจันทร์',mx,my-MOON_R-6);

  // หัวเรื่อง
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#e8d08a';ctx.font='700 31px Georgia,serif';ctx.fillText('อุปราคาในสายตาคนโบราณ',40,62);
  ctx.fillStyle='rgba(230,208,138,.78)';ctx.font='500 18px sans-serif';ctx.fillText('ที่ "ทางเดินอาทิตย์" กับ "ทางเดินจันทร์" ตัดกัน — คือ ราหู–เกตุ',40,92);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='400 15px sans-serif';ctx.fillText('Horatad created · 11 June 2026',W-40,58);

  // แคปชันล่าง
  ctx.textAlign='center';
  if(solar){ctx.fillStyle='#ffd24a';ctx.font='700 31px sans-serif';ctx.fillText('🌞 สุริยุปราคา — "ราหูอมตะวัน"',W/2,H-74);
    ctx.fillStyle='rgba(255,225,150,.92)';ctx.font='500 18px sans-serif';ctx.fillText('จันทร์ดับเดินมาถึงจุดตัดพอดี → จานจันทร์บังจานอาทิตย์ (ขนาดเท่ากัน)',W/2,H-42);}
  else if(lunar){ctx.fillStyle='#ff7a68';ctx.font='700 31px sans-serif';ctx.fillText('🌑 จันทรุปราคา — "ราหูอมจันทร์"',W/2,H-74);
    ctx.fillStyle='rgba(255,180,160,.92)';ctx.font='500 18px sans-serif';ctx.fillText('จันทร์เพ็ญเดินมาถึงจุดตัดพอดี → เข้าไปในเงาโลก (ตรงข้ามดวงอาทิตย์)',W/2,H-42);}
  else{ctx.fillStyle='rgba(190,205,255,.82)';ctx.font='500 19px sans-serif';ctx.fillText('ปกติจันทร์ผ่านเหนือ/ใต้ดวงอาทิตย์ — ไม่ตรงจุดตัด จึงไม่เกิดอุปราคา',W/2,H-48);}
}

export function Eclipse({offset=0}={}){
  const frame=useCurrentFrame()+offset;const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  return(<AbsoluteFill style={{background:'#02030a'}}><canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/></AbsoluteFill>);
}
