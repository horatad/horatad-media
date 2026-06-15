import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';

const W=1080,H=1080;
const FRAMES=1200, YEARS=8;
const SOLAR=365.24, LUNARY=354.37, MONTH=29.53;
const DRIFT=SOLAR-LUNARY;
const CX=540, CY=548, TAU=Math.PI*2;
const TOP=-Math.PI/2;
const A=m=>TOP + m*(TAU/12);
const pol=(r,a)=>[CX+r*Math.cos(a), CY+r*Math.sin(a)];

const SOL_M=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const SEASONS=[{a:0,b:2,col:'#3f6aa0',n:''},{a:2,b:5,col:'#cf8a3d',n:'ร้อน'},{a:5,b:10,col:'#2f8e6c',n:'ฝน'},{a:10,b:12,col:'#3f6aa0',n:'หนาว'}];
const LEAP19=[1,4,6,9,12,15,18];                      // ตารางอธิกมาส ไทย/พม่า (ไม่ใช่กรีก)

function seg(ctx,r0,r1,a0,a1,fill,al=1){ctx.beginPath();ctx.arc(CX,CY,r1,a0,a1,false);ctx.arc(CX,CY,r0,a1,a0,true);ctx.closePath();ctx.globalAlpha=al;ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=1;}
function moon(ctx,x,y,r,col,glow){if(glow){ctx.shadowColor=glow;ctx.shadowBlur=12;}ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=col;ctx.fill();ctx.shadowBlur=0;}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0a0e18';ctx.fillRect(0,0,W,H);
  const yearF=Math.min(YEARS,frame/(FRAMES/YEARS));
  const driftDays=yearF*DRIFT;
  const leaps=Math.round(driftDays/MONTH);
  const netDrift=driftDays-leaps*MONTH;
  const fpart=driftDays/MONTH-Math.floor(driftDays/MONTH);
  const flash=Math.max(0,1-Math.abs(fpart-0.5)/0.06);
  const m8=6.5, corr=-netDrift/30.4;

  // หัวข้อ
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#e8d08a';ctx.font='700 38px sans-serif';ctx.fillText('เดือน ๘ สองหน',44,60);
  ctx.fillStyle='rgba(232,208,138,.8)';ctx.font='600 18px sans-serif';ctx.fillText('นาฬิกาปฏิทิน 4 วง — ทำไมต้องมีอธิกมาส',44,88);

  const rS0=392,rS1=432, rSe0=320,rSe1=388, rC0=250,rC1=312, rU0=150,rU1=240;

  // วงนอก: เดือนสุริยคติ
  for(let i=0;i<12;i++){
    seg(ctx,rS0,rS1,A(i)+.012,A(i+1)-.012,i%2?'#1b2740':'#223150');
    const [lx,ly]=pol((rS0+rS1)/2,A(i+0.5));
    ctx.fillStyle='rgba(210,225,255,.85)';ctx.font='600 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(SOL_M[i],lx,ly);
  }

  // วง 2: ฤดูกาล
  SEASONS.forEach(s=>{seg(ctx,rSe0,rSe1,A(s.a)+.006,A(s.b)-.006,s.col,.9);
    if(s.n){const[sx,sy]=pol((rSe0+rSe1)/2,A((s.a+s.b)/2));ctx.fillStyle='#fff';ctx.font='700 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ฤดู'+s.n,sx,sy);}});
  // แกนร่วม "เดือน ๘ เริ่มต้น = ต้นหน้าฝน" — เส้นรัศมีทะลุทุกวง (จุดโฟกัส)
  const a8s=A(m8+corr-0.5);
  seg(ctx,rSe0,rSe1,a8s,a8s+(TAU/12)*0.55,'rgba(190,255,225,.5)');
  const[ax0,ay0]=pol(rU0,a8s),[ax1,ay1]=pol(rS1+8,a8s);
  ctx.strokeStyle='rgba(255,216,106,.75)';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);
  ctx.beginPath();ctx.moveTo(ax0,ay0);ctx.lineTo(ax1,ay1);ctx.stroke();ctx.setLineDash([]);
  const[lx,ly]=pol(rS1+34,a8s);
  ctx.fillStyle='#ffe6a0';ctx.font='700 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('▲ เริ่มเข้าพรรษา',lx,ly-2);
  ctx.fillStyle='rgba(255,230,160,.72)';ctx.font='400 13px sans-serif';ctx.fillText('เดือน ๘ = ต้นหน้าฝน',lx,ly+16);

  // วง 3: จันทรคติ "ปรับอธิกมาสแล้ว" = เต็มวง
  seg(ctx,rC0,rC1,TOP,TOP+TAU,'rgba(120,150,210,.18)');
  ctx.beginPath();ctx.arc(CX,CY,rC0,0,TAU);ctx.arc(CX,CY,rC1,0,TAU);ctx.strokeStyle='rgba(150,180,230,.35)';ctx.lineWidth=1;ctx.stroke();
  const THAI=['๘','๙','๑๐','๑๑','๑๒','๑','๒','๓','๔','๕','๖','๗'];   // เดือนจันทรคติไทย เริ่มจากเดือน ๘ (~ก.ค.)
  // เส้นแบ่งขอบเขตเดือนไทย
  for(let k=0;k<12;k++){const a=A(m8+corr+k-0.5);const[x0,y0]=pol(rC0,a),[x1,y1]=pol(rC1,a);ctx.strokeStyle='rgba(185,205,245,.32)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let k=0;k<12;k++){
    const[mx,my]=pol((rC0+rC1)/2,A(m8+corr+k));
    if(k===0){
      moon(ctx,mx,my,16,'#ffd86a','#ffb020');
      ctx.fillStyle='#5a3d00';ctx.font='700 17px sans-serif';ctx.fillText('๘',mx,my+1);
    }else{
      ctx.fillStyle='rgba(238,243,255,.96)';ctx.font='700 19px sans-serif';ctx.fillText(THAI[k],mx,my+1);
    }
  }
  // อธิกมาส: เดือน ๘ สองหน — แทรกระหว่าง ๘(หน้า) กับ ๙ พร้อมเส้นแบ่ง + ไฮไลต์ดวงที่เพิ่ม
  if(flash>0.05){
    ctx.globalAlpha=flash;
    const aIns=A(m8+corr+0.5);
    [0,1].forEach(d=>{const a=A(m8+corr+d);const[x0,y0]=pol(rC0,a),[x1,y1]=pol(rC1,a);ctx.strokeStyle='#ffd86a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();});
    const[gx,gy]=pol((rC0+rC1)/2,aIns);
    ctx.beginPath();ctx.arc(gx,gy,17,0,TAU);ctx.strokeStyle='#ff6a6a';ctx.lineWidth=2.5;ctx.stroke();
    moon(ctx,gx,gy,15,'#ffe08a','#ffb020');ctx.fillStyle='#5a3d00';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('๘',gx,gy+1);
    const[tx,ty]=pol(rC0-14,aIns);ctx.fillStyle='#ff9a9a';ctx.font='700 12px sans-serif';ctx.fillText('หลัง',tx,ty);
    ctx.globalAlpha=1;
  }

  // วงในสุด: จันทรคติ "ไม่ปรับ" = ฟันหลอ (ส่วนต่างสะสม)
  const gap=(driftDays/365)*TAU;                       // ช่องโหว่โตทุกปี
  seg(ctx,rU0,rU1,TOP,TOP+TAU-gap,'rgba(90,150,120,.30)');     // ส่วนที่มีเดือนจันทร์
  seg(ctx,rU0,rU1,TOP+TAU-gap,TOP+TAU,'rgba(255,80,80,.16)');  // ฟันหลอ
  // ฟันเดือน (tick ทุก ~29.5 วัน)
  const teeth=Math.floor((TAU-gap)/(MONTH/365*TAU));
  for(let i=0;i<=teeth;i++){const a=TOP+i*(MONTH/365*TAU);const[x0,y0]=pol(rU0,a),[x1,y1]=pol(rU1,a);ctx.strokeStyle='rgba(180,230,200,.45)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
  // ป้ายฟันหลอ
  const[fx,fy]=pol((rU0+rU1)/2,TOP+TAU-gap/2);
  ctx.fillStyle='#ff8a8a';ctx.font='700 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('ฟันหลอ',fx,fy-9);ctx.font='600 13px sans-serif';ctx.fillText('~'+Math.round(driftDays)+' วัน',fx,fy+9);

  // center
  ctx.fillStyle='rgba(255,255,255,.92)';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='700 34px sans-serif';ctx.fillText('ปีที่ '+Math.floor(yearF+1),CX,CY);

  // วาบอธิกมาส
  if(flash>0.05){ctx.globalAlpha=flash;ctx.fillStyle='#ffe08a';ctx.textAlign='center';ctx.font='700 23px sans-serif';ctx.fillText('+ แทรกเดือน ๘ สองหน → เต็มวง',CX,CY-rS1-16);ctx.globalAlpha=1;}

  // legend (ซ้ายล่าง)
  ctx.textAlign='left';ctx.textBaseline='middle';
  const lg=[['#2f8e6c','วงนอก/ฤดู = สุริยคติ (ตรึง)'],['rgba(235,240,255,.9)','วง 3 = จันทรคติ ปรับอธิกมาส (เต็มวง)'],['rgba(90,200,140,.9)','วงใน = จันทรคติ ไม่ปรับ (ฟันหลอ)'],['#ffd86a','● เดือน ๘ (เข้าพรรษา) อยู่หน้าฝน']];
  lg.forEach((l,i)=>{const y=H-150+i*26;moon(ctx,58,y,7,l[0]);ctx.fillStyle='rgba(255,255,255,.8)';ctx.font='600 14px sans-serif';ctx.fillText(l[1],74,y);});

  // tally 19 ปี (ขวาบน)
  const PX=W-300,PY=120;
  ctx.fillStyle='#cfe0ff';ctx.font='700 17px sans-serif';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText('วัฏจักร 19 ปี = 235 เดือน',PX,PY);
  for(let i=0;i<19;i++){const x=PX+(i%10)*22,y=PY+12+Math.floor(i/10)*22;ctx.fillStyle=LEAP19.includes(i+1)?'#e8b94d':'rgba(255,255,255,.18)';ctx.fillRect(x,y,16,16);}
  ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='600 13px sans-serif';ctx.fillText('12×19=228 + อธิกมาส 7 = 235',PX,PY+72);

  // คำอธิบายล่าง
  ctx.textAlign='center';ctx.fillStyle='rgba(232,208,138,.85)';ctx.font='600 18px sans-serif';
  ctx.fillText('ปีจันทรคติสั้นกว่าสุริยคติ ~11 วัน → ไม่ปรับ "ฟันหลอ" โตทุกปี · อธิกมาสเติมให้ "เต็มวง" ตรงฤดู',W/2,H-26);
  ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.4)';ctx.font='400 13px sans-serif';ctx.fillText('Horatad',W-26,H-8);
}

export function Adhikamasa(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  return(<AbsoluteFill style={{background:'#0a0e18'}}><canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/></AbsoluteFill>);
}
