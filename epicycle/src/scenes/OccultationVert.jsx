import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-occult.js';

// ── ดวงจันทร์บังดาวศุกร์ — มองจากพื้นโลก (ฟ้าหัวค่ำ ทิศตะวันตก) ──
// มาตรฐาน from-Earth (ต้นแบบ VenusBrightVert/JupiterOccultVert): timeline + แกนมุมเงย + ตำแหน่งจริงตามเวลา + ฟ้าตามเวลาจริง
// verified ephem (2026-09-14 กรุงเทพ lat 13.75 · uniform-time 18:30→20:25 · เริ่มหลังอาทิตย์ตก 18:20):
//   จันทร์เสี้ยว 12.6% · ศุกร์เฟส 29% (คงที่ทั้งช่วง) · ทั้งคู่ "ตก" alt 24°→0° (ตก ~20:24) · az 244°→252° (WSW เลื่อนใต้ = ลงขวา)
//   เริ่มคลิปศุกร์สูง+ห่างจันทร์มาก (sep 38′) → จันทร์คืบเข้าหา · เริ่มบัง ~19:29 (sep ผ่าน moon radius 15.3′) · ตกลับขอบฟ้าขณะยังบัง ~20:24 (ไม่โผล่กลับ)
//   ดวงอาทิตย์ alt −2°→−31° (az 274° = ตะวันตก) → ส้มสนธยาจาง "เฉพาะช่วงต้น (18:30–19:30) ที่ขอบฟ้าตะวันตก" แล้วฟ้ามืดสนิท (sun < −18°)
const W=1080,H=1920;
// ── ไทม์แทร็ก verified ephem (นาทีจาก 18:30 · จันทร์ alt/az · ศุกร์เทียบจันทร์ daz/dalt arcmin · sunAlt) ──
const TRACK=[
 {m:0, malt:24.49,maz:243.68,daz:-21.46,dalt:30.99,salt:-1.9},
 {m:5, malt:23.42,maz:244.19,daz:-19.82,dalt:29.89,salt:-3.0},
 {m:10, malt:22.35,maz:244.69,daz:-18.20,dalt:28.74,salt:-5.3},
 {m:15, malt:21.27,maz:245.16,daz:-16.62,dalt:27.53,salt:-6.8},
 {m:20, malt:20.19,maz:245.63,daz:-15.06,dalt:26.27,salt:-8.0},
 {m:25, malt:19.11,maz:246.08,daz:-13.53,dalt:24.95,salt:-9.2},
 {m:30, malt:18.02,maz:246.52,daz:-12.02,dalt:23.59,salt:-10.5},
 {m:35, malt:16.93,maz:246.94,daz:-10.55,dalt:22.17,salt:-11.7},
 {m:40, malt:15.84,maz:247.36,daz:-9.09,dalt:20.71,salt:-12.9},
 {m:45, malt:14.75,maz:247.76,daz:-7.67,dalt:19.22,salt:-14.1},
 {m:50, malt:13.65,maz:248.15,daz:-6.26,dalt:17.64,salt:-15.3},
 {m:55, malt:12.55,maz:248.53,daz:-4.89,dalt:16.04,salt:-16.5},
 {m:60, malt:11.45,maz:248.89,daz:-3.53,dalt:14.39,salt:-17.7},
 {m:65, malt:10.35,maz:249.25,daz:-2.20,dalt:12.70,salt:-18.9},
 {m:70, malt:9.25,maz:249.60,daz:-0.90,dalt:10.96,salt:-20.1},
 {m:75, malt:8.15,maz:249.94,daz:0.38,dalt:9.19,salt:-21.3},
 {m:80, malt:7.06,maz:250.27,daz:1.64,dalt:7.37,salt:-22.5},
 {m:85, malt:5.96,maz:250.59,daz:2.88,dalt:5.52,salt:-23.7},
 {m:90, malt:4.87,maz:250.91,daz:4.10,dalt:3.64,salt:-24.9},
 {m:95, malt:3.78,maz:251.21,daz:5.29,dalt:1.74,salt:-26.1},
 {m:100, malt:2.71,maz:251.51,daz:6.46,dalt:-0.16,salt:-27.3},
 {m:105, malt:1.67,maz:251.80,daz:7.61,dalt:-2.00,salt:-28.5},
 {m:110, malt:0.66,maz:252.08,daz:8.74,dalt:-3.67,salt:-29.7},
 {m:115, malt:-0.28,maz:252.36,daz:9.85,dalt:-5.02,salt:-30.8},
];
const T_MIN=90;                              // ช่วงเวลา (นาที) 18:30→20:00 · จบตอนจันทร์ยังเหนือขอบฟ้า (alt ~5° กำลังลับ · ไม่จมจอ) · เคลื่อนช้าลง
const ILLUM_M=0.126, ILLUM_V=0.29;          // เฟสจันทร์/ศุกร์ (verified ephem)
const MOON_R_ARCMIN=15.3;                    // รัศมีจันทร์จริง (size 30.6′)
const RM=80;                                 // จานจันทร์วาด (สเกลภาพ)
const PXPM=RM/MOON_R_ARCMIN;                 // px ต่อ arcmin → offset จันทร์-ศุกร์ เป็นสัดส่วนจริง
const RV=12;                                 // จานศุกร์ (ขยาย ~7x ให้เห็นเฟส · exception อนุมัติ)
const BRIGHT_ANG=0.92;                       // ขอบสว่างเสี้ยวหันลง-ขวา (เข้าหาดวงอาทิตย์ az 274° ใต้ขอบฟ้าขวา)
const HZ=1600;                               // เส้นขอบฟ้า (ทิศตะวันตก)
// alt 0°=ขอบฟ้า · กึ่งกลาง ~24.75°→520 (ศุกร์ที่ offset/2 อยู่ใต้ caption) → ดาวตกเต็มจอ
function altToY(alt){return interpolate(alt,[0,25],[HZ,520],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});}
function azToX(az){return 540+(az-248)*40;}  // az 244→252 → เคลื่อนซ้าย→ขวา (ตกลงขวา)
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.92,
  r:i%11===0?1.5:i%3===0?.7:.35,tw:i*0.41
}));
function lerp(a,b,t){return a+(b-a)*t;}
function mix(c1,c2,t){return `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;}
function track(min){
  const A=TRACK;
  if(min<=A[0].m)return A[0];
  if(min>=A[A.length-1].m)return A[A.length-1];
  let i=0;while(min>A[i+1].m)i++;
  const t=(min-A[i].m)/(A[i+1].m-A[i].m),k=(p,q)=>lerp(p,q,t);
  return {malt:k(A[i].malt,A[i+1].malt),maz:k(A[i].maz,A[i+1].maz),
          daz:k(A[i].daz,A[i+1].daz),dalt:k(A[i].dalt,A[i+1].dalt),salt:k(A[i].salt,A[i+1].salt)};
}
function tLabel(min){const tot=18*60+30+min;const h=Math.floor(tot/60),m=Math.round(tot%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}

function drawPhase(ctx,x,y,r,illum,ang,litA,litB,darkFill){
  const cosA=2*illum-1;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle=darkFill;ctx.fill();
  const xt=r*cosA;
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,litA);g.addColorStop(1,litB);
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}

function drawVenus(ctx,vx,vy,mx,my,labelOp){
  // clip: ทั้งจอ "ลบ" วงจานดวงจันทร์ → ขอบจันทร์บังจานศุกร์ทีละนิด (ค่อยๆ หาย/โผล่ ตามจริง · ไม่วับทันที)
  ctx.save();
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(mx,my,RM,0,Math.PI*2);ctx.clip('evenodd');
  const halo=ctx.createRadialGradient(vx,vy,RV*0.5,vx,vy,RV*2.8);
  halo.addColorStop(0,'rgba(215,238,255,0.6)');halo.addColorStop(0.5,'rgba(150,195,255,0.18)');halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,RV*2.8,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,vx,vy,RV,ILLUM_V,BRIGHT_ANG,'#bfe0ff','#ffffff','rgba(15,22,38,0.92)');
  ctx.restore();
  if(labelOp>0.01){
    ctx.globalAlpha=labelOp;
    ctx.fillStyle='rgba(210,232,255,.95)';ctx.font='600 25px sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ดาวศุกร์',vx+RV+14,vy);
    ctx.globalAlpha=1;
  }
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const prog=Math.max(0,Math.min(1,frame/timing.VO_END));   // uniform time 19:05→20:25
  const min=prog*T_MIN;
  const s=track(min);
  const dusk=Math.max(0,Math.min(1,(s.salt+18)/9));         // ส้มสนธยา: 1 ที่ -9° → 0 ที่ -18° (มืดสนิท)

  // ── ท้องฟ้าหัวค่ำ: น้ำเงินเข้ม-ดำ (โทนเย็น · ไม่ส้มกลางฟ้า) ──
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,   '#03040c');
  sky.addColorStop(0.5, '#06091a');
  sky.addColorStop(0.82,mix([10,16,38],[20,26,50],dusk));
  sky.addColorStop(1,   mix([16,24,48],[44,40,60],dusk));    // ขอบฟ้า: น้ำเงินอมเทา (อุ่นขึ้นนิดตอนสนธยาต้น)
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  // ดาวพื้นหลัง (เด่นขึ้นเมื่อฟ้ามืด)
  STARS.forEach(st=>{
    const yy=st.y*HZ; const dimv=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.05+Math.abs(Math.sin(st.tw+frame*.015))*.27)*dimv*(1-0.5*dusk);
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(st.x*W,yy,st.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;
  // แสงสนธยาส้มจาง — เฉพาะขอบฟ้า "ทิศตะวันตก" (az 274° = จุดอาทิตย์ตก · เยื้องขวา) และเฉพาะ dusk>0 (sun > -18°)
  if(dusk>0.01){
    const gx=W*0.80;                                  // W = เยื้องขวา (อาทิตย์อยู่ขวาของดาว)
    const g=ctx.createRadialGradient(gx,HZ,0,gx,HZ,W*0.6);
    g.addColorStop(0,'rgba(228,150,98,'+(0.22*dusk).toFixed(3)+')');
    g.addColorStop(0.4,'rgba(176,118,92,'+(0.07*dusk).toFixed(3)+')');
    g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,HZ-240,W,240);
  }

  // ── แกนมุมเงย (°เหนือขอบฟ้า · เส้นประจาง) ──
  ctx.strokeStyle='rgba(150,180,225,0.15)';ctx.fillStyle='rgba(170,200,240,0.5)';
  ctx.font='600 20px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  [5,10,15,20].forEach(deg=>{const yy=altToY(deg);
    ctx.setLineDash([2,9]);ctx.beginPath();ctx.moveTo(60,yy);ctx.lineTo(W-60,yy);ctx.stroke();ctx.setLineDash([]);
    ctx.fillText(deg+'°',22,yy);});

  // ── ตำแหน่งจริง: จุดกึ่งกลาง = แกนตก (deg scale จริง · ทั้งคู่ตกลงขอบฟ้าขนานกัน = การเคลื่อนเด่น) ──
  //   จันทร์/ศุกร์ กระจายจากกึ่งกลางด้วย offset/2 (สมมาตร) → เข้าหากันเนียน ไม่มีตัวใดวิ่งเดี่ยว
  //   ตามจริง: bulk (ตก) เด่นกว่า relative (เข้าใกล้) ~23 เท่า · จันทร์โคจรสวนขึ้นเล็กน้อย → ตกช้ากว่าศุกร์นิดเดียว
  const valt=s.malt+s.dalt/60;
  const vaz=s.maz+s.daz/(60*Math.cos(s.malt*Math.PI/180));
  const cAlt=(s.malt+valt)/2, cAz=(s.maz+vaz)/2;
  const cx=azToX(cAz), cy=altToY(cAlt);              // กึ่งกลาง (ตก deg scale จริง)
  const vx=cx+(s.daz*PXPM)/2, vy=cy-(s.dalt*PXPM)/2;  // ศุกร์ (บน-ซ้าย)
  const mx=cx-(s.daz*PXPM)/2, my=cy+(s.dalt*PXPM)/2;  // จันทร์ (ล่าง-ขวา) — เข้าหากันสมมาตร
  const sep=Math.hypot(s.daz,s.dalt);
  const occulted=sep<MOON_R_ARCMIN*0.99;
  const aboveHZ=s.malt>0.2;                            // จันทร์ยังเหนือขอบฟ้า
  const labelOp=interpolate(frame,[0,250,300],[1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})
               *Math.max(0,Math.min(1,(sep-MOON_R_ARCMIN-2)/5));

  drawVenus(ctx,vx,vy,mx,my,labelOp);                  // ศุกร์ถูกขอบจันทร์ clip บังทีละนิด

  // ── ดวงจันทร์เสี้ยว (เล็ก สมจริง · ขอบสว่างลง-ขวา หาดวงอาทิตย์) ──
  const mglow=ctx.createRadialGradient(mx,my,RM*0.7,mx,my,RM*1.5);
  mglow.addColorStop(0,'rgba(228,230,210,0.10)');mglow.addColorStop(1,'transparent');
  ctx.fillStyle=mglow;ctx.beginPath();ctx.arc(mx,my,RM*1.5,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,mx,my,RM,ILLUM_M,BRIGHT_ANG,'#d7d9c6','#fdfdf4','rgba(18,22,34,0.20)');
  if(labelOp>0.01){
    ctx.globalAlpha=labelOp;
    ctx.fillStyle='rgba(228,230,210,.9)';ctx.font='600 24px sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('ดวงจันทร์',mx-RM-12,my);
    ctx.globalAlpha=1;
  }

  // ── สถานะ (บน ใต้หัวข้อ) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(!aboveHZ){ctx.fillStyle='rgba(210,225,255,.78)';ctx.font='700 32px sans-serif';ctx.fillText('ทั้งคู่ลับขอบฟ้า — ศุกร์ยังถูกบัง',W/2,232);}
  else if(occulted&&s.malt<6){ctx.fillStyle='#ff9a6a';ctx.font='700 34px sans-serif';ctx.fillText('● ถูกบัง · กำลังลับขอบฟ้าทั้งคู่',W/2,232);}
  else if(occulted){ctx.fillStyle='#ff9a6a';ctx.font='700 36px sans-serif';ctx.fillText('● ดาวศุกร์ถูกบัง',W/2,232);}
  else{ctx.fillStyle='rgba(210,232,255,.88)';ctx.font='700 32px sans-serif';ctx.fillText('ดวงจันทร์เคลื่อนเข้าหาดาวศุกร์',W/2,232);}

  // ── เส้นขอบฟ้า + เงาภูเขา (พื้นโลก) ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+22+Math.sin(x*0.013+1.7)*16+Math.sin(x*0.05)*7;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(205,220,255,'+(0.55+0.25*dusk).toFixed(2)+')';ctx.font='700 29px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🧭 ทิศตะวันตก · หัวค่ำ (หลังอาทิตย์ตก)',W/2,HZ-12);

  // ── ไทม์ไลน์เวลา (18:30 → 20:00) + จุดเวลาปัจจุบัน + ป้ายเริ่มบัง (ตกจริง 20:24 หลังจบคลิป) ──
  const tlY=300,tlX0=150,tlX1=930;
  ctx.strokeStyle='rgba(170,198,240,0.30)';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(tlX0,tlY);ctx.lineTo(tlX1,tlY);ctx.stroke();
  [['เริ่มบัง',59]].forEach(([lab,mm])=>{const xx=lerp(tlX0,tlX1,mm/T_MIN);
    ctx.fillStyle='rgba(255,180,110,0.7)';ctx.beginPath();ctx.arc(xx,tlY,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,200,150,0.75)';ctx.font='600 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(lab,xx,tlY-9);});
  ctx.fillStyle='rgba(180,205,245,0.55)';ctx.font='600 21px sans-serif';ctx.textBaseline='middle';
  ctx.textAlign='right';ctx.fillText('๑๘:๓๐',tlX0-10,tlY);ctx.textAlign='left';ctx.fillText('๒๐:๐๐',tlX1+10,tlY);
  const dotX=lerp(tlX0,tlX1,prog);
  ctx.shadowColor='#ffd060';ctx.shadowBlur=14;ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(dotX,tlY,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(255,242,205,0.96)';ctx.font='700 27px sans-serif';
  ctx.fillText('🕐 '+tLabel(min)+' น.',Math.max(150,Math.min(W-150,dotX)),tlY+14);

  // ── หัวข้อบน ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cfe6ff';ctx.font='700 50px sans-serif';
  ctx.fillText('ดวงจันทร์บังดาวศุกร์',W/2,108);
}

export function OccultationVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timing.DURATION-15,timing.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const cardOp=interpolate(frame,[0,18,135,165],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#03040c'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timing} topY={360}/>
      <Credit timing={timing} label="based on" source="OBSERVATION" sub="ดวงจันทร์บังดาว · NARIT 2569" startAt={1500}/>
    </AbsoluteFill>
    {cardOp>0.001&&(
      <AbsoluteFill style={{opacity:cardOp,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
        <div style={{
          background:'rgba(4,8,20,0.88)',border:'1px solid rgba(120,190,255,0.4)',
          borderRadius:28,padding:'46px 54px',textAlign:'center',maxWidth:940,
          boxShadow:'0 0 70px rgba(110,170,255,0.32)'}}>
          <div style={{color:'#bfe0ff',fontSize:36,fontWeight:600,letterSpacing:1}}>🌙 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
          <div style={{color:'#ffffff',fontSize:70,fontWeight:800,margin:'16px 0 6px'}}>ดวงจันทร์บังดาวศุกร์</div>
          <div style={{color:'#9fd0ff',fontSize:52,fontWeight:700}}>๑๔ กันยายน ๒๕๖๙</div>
          <div style={{color:'rgba(190,224,255,0.92)',fontSize:33,marginTop:26,lineHeight:1.5}}>
            👁 เริ่มบัง <b>๑๙:๒๘ น.</b> · ทิศ <b>ตะวันตก</b> หัวค่ำ<br/>
            ทั้งคู่ <b>ลับขอบฟ้าขณะยังบังกัน</b> (~๒๐:๒๐) · ตาเปล่าทั่วไทย
          </div>
          <div style={{color:'rgba(255,255,255,0.55)',fontSize:26,marginTop:22,fontStyle:'italic'}}>ดวงจันทร์ใกล้ "กลืน" ดาวศุกร์ได้อย่างไร? ↓</div>
        </div>
      </AbsoluteFill>
    )}
    <Narration timing={timing} voDir="vo-occult"/>
    <Music timing={timing} music="audio/salut-damour-clip.mp3" outroFade={120} gain={1.0} duck={0.55} creditAt={1500}/>
  </AbsoluteFill>);
}
