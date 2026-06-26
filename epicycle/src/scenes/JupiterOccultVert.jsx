import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-jupiter.js';

// ── ดวงจันทร์บังดาวพฤหัสบดี — มองจากพื้นโลก (ฟ้าเช้ามืด ทิศตะวันออก · ภาคใต้ที่บังจริง) ──
// มาตรฐาน from-Earth (ต้นแบบ VenusBrightVert): timeline + แกนมุมเงย + ตำแหน่งจริงตามเวลา + ฟ้าตามเวลาจริง
// verified ephem (3 พ.ย. 69 · lat 8°N โซนใต้): จันทร์ illum 38.8% (คงที่ทั้ง 1 ชม.) · พฤหัสจาน 36" mag -1.9
//   เหตุการณ์ uniform-time 04:05→05:25: จันทร์ "ขึ้น" alt 42°→61° + แซงพฤหัสที่อยู่ "ใต้-ซ้าย"
//   พฤหัสลับหลังขอบสว่าง(ล่าง·ทางอาทิตย์) ~04:17 → โผล่ด้านมืด(ซ้าย) ~05:19 [ตาม NARIT]
//   ดวงอาทิตย์ alt -31°→-12° → ฟ้ามืดเกือบหมด · แสงรุ่งส้มจาง "เฉพาะขอบฟ้าตะวันออก ช่วงท้าย" เท่านั้น
const W=1080,H=1920;
// ── ไทม์แทร็ก verified ephem (นาทีจาก 04:05 · จันทร์ alt/az · พฤหัสเทียบจันทร์ daz/dalt arcmin · sunAlt) ──
const TRACK=[
 {m:0, malt:41.97,maz:78.37,daz:-0.72,dalt:-20.71,salt:-30.9},
 {m:4, malt:42.92,maz:78.35,daz:-1.44,dalt:-19.34,salt:-29.9},
 {m:8, malt:43.87,maz:78.32,daz:-2.17,dalt:-17.99,salt:-29.0},
 {m:12,malt:44.82,maz:78.28,daz:-2.92,dalt:-16.66,salt:-28.0},
 {m:16,malt:45.77,maz:78.23,daz:-3.68,dalt:-15.36,salt:-27.0},
 {m:20,malt:46.72,maz:78.18,daz:-4.45,dalt:-14.07,salt:-26.1},
 {m:24,malt:47.67,maz:78.12,daz:-5.24,dalt:-12.80,salt:-25.1},
 {m:28,malt:48.62,maz:78.05,daz:-6.05,dalt:-11.56,salt:-24.1},
 {m:32,malt:49.57,maz:77.98,daz:-6.87,dalt:-10.33,salt:-23.2},
 {m:36,malt:50.52,maz:77.89,daz:-7.70,dalt:-9.13, salt:-22.2},
 {m:40,malt:51.47,maz:77.80,daz:-8.55,dalt:-7.95, salt:-21.2},
 {m:44,malt:52.42,maz:77.69,daz:-9.41,dalt:-6.79, salt:-20.3},
 {m:48,malt:53.37,maz:77.58,daz:-10.29,dalt:-5.65,salt:-19.3},
 {m:52,malt:54.32,maz:77.45,daz:-11.19,dalt:-4.54,salt:-18.3},
 {m:56,malt:55.27,maz:77.31,daz:-12.10,dalt:-3.46,salt:-17.4},
 {m:60,malt:56.22,maz:77.16,daz:-13.03,dalt:-2.40,salt:-16.4},
 {m:64,malt:57.17,maz:76.99,daz:-13.98,dalt:-1.36,salt:-15.5},
 {m:68,malt:58.11,maz:76.80,daz:-14.95,dalt:-0.35,salt:-14.5},
 {m:72,malt:59.06,maz:76.60,daz:-15.93,dalt:0.62, salt:-13.5},
 {m:76,malt:60.01,maz:76.37,daz:-16.93,dalt:1.57, salt:-12.6},
 {m:80,malt:60.96,maz:76.13,daz:-17.96,dalt:2.49, salt:-11.6},
];
const T_MIN=80;                              // ช่วงเวลา (นาที) 04:05→05:25
const MOON_R_ARCMIN=16.09, ILLUM_M=0.388;
const RM=116;                                // จานจันทร์วาด (ขยาย · disk convention) → สเกล px/arcmin
const PXPM=RM/MOON_R_ARCMIN;                 // px ต่อ arcmin (จันทร์+offset พฤหัส = สเกลเดียว = สัดส่วนจริง)
const RJ=15;                                 // จานพฤหัส (ขยายให้เห็น · จริง 36"=เล็กมาก · exception)
// (ไม่วาดดวงจันทร์กาลิเลโอ — ตาเปล่ามองไม่เห็น · ดู drawJupiter)
// แกนมุมเงย (°เหนือขอบฟ้า) — โซนเหตุการณ์ alt 40-66°
const HZ=1684;                               // เส้นขอบฟ้า (ทิศตะวันออก)
function altToY(alt){return interpolate(alt,[36,68],[1556,470],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});}
function azToX(az){return 540+(az-77.4)*46;}  // az 78.4→76.1 → เยื้องเล็กน้อย (เคลื่อนซ้ายขึ้นเหนือ)
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.95,
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
function tLabel(min){const tot=4*60+5+min;const h=Math.floor(tot/60),m=Math.round(tot%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}

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

function drawJupiter(ctx,jx,jy,mx,my,labelOp){
  ctx.save();
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(mx,my,RM,0,Math.PI*2);ctx.clip('evenodd');  // ลับหลังจานจันทร์
  // หมายเหตุ: ไม่วาดดวงจันทร์กาลิเลโอ — ตาเปล่ามองไม่เห็น (glare พฤหัสกลบ · ห่างแค่ 0.1–6.6′ · ต้องกล้อง)
  //   พากย์/caption ยังเล่า "ถ้าส่องกล้องเห็นบริวาร ๔ ดวง" ได้ (ซื่อตรง: บอกว่าต้องกล้อง · กาลิเลโอ 1610)
  const halo=ctx.createRadialGradient(jx,jy,RJ*0.5,jx,jy,RJ*2.6);
  halo.addColorStop(0,'rgba(255,240,210,0.5)');halo.addColorStop(0.5,'rgba(240,205,150,0.15)');halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(jx,jy,RJ*2.6,0,Math.PI*2);ctx.fill();
  const body=ctx.createLinearGradient(jx,jy-RJ,jx,jy+RJ);
  body.addColorStop(0,'#efe0c4');body.addColorStop(0.5,'#f6ecd6');body.addColorStop(1,'#e6cda6');
  ctx.fillStyle=body;ctx.beginPath();ctx.arc(jx,jy,RJ,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(jx,jy,RJ,0,Math.PI*2);ctx.clip();
  ctx.strokeStyle='rgba(190,150,110,0.5)';ctx.lineWidth=2.2;
  [-5,0.5,5.5].forEach(b=>{ctx.beginPath();ctx.moveTo(jx-RJ,jy+b);ctx.lineTo(jx+RJ,jy+b);ctx.stroke();});
  ctx.restore();ctx.restore();
  if(labelOp>0.01){
    ctx.globalAlpha=labelOp;ctx.fillStyle='rgba(255,238,205,.95)';ctx.font='600 25px sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('ดาวพฤหัสบดี',jx+RJ*2.6+8,jy+2);ctx.globalAlpha=1;
  }
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  // event เดินจบที่ VO_END (พากย์จบ) → พฤหัสโผล่ ~เฟรม 1417 เห็นชัดก่อน credit ขึ้น (1607) · ค้าง min80 ช่วง credit
  const prog=Math.max(0,Math.min(1,frame/timing.VO_END));
  const min=prog*T_MIN;                       // uniform time 04:05→05:25
  const s=track(min);
  // แสงรุ่ง (สนธยา) = ฟังก์ชันของ sun altitude จริง: เริ่มมีเมื่อ sun > -18° เท่านั้น (ก่อนหน้านี้ฟ้ามืดสนิท)
  const dawn=Math.max(0,Math.min(1,(s.salt+18)/9));   // 0 ที่ -18° → 1 ที่ -9°

  // ── ท้องฟ้าเช้ามืด: น้ำเงินเข้ม-ดำ (โทนเย็น · ไม่ส้ม) ──
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,   '#04060f');
  sky.addColorStop(0.5, '#070b1c');
  sky.addColorStop(0.82,mix([12,18,40],[20,28,52],dawn));
  sky.addColorStop(1,   mix([18,26,50],[40,46,74],dawn));    // ขอบฟ้า: น้ำเงินอมเทา (สว่างขึ้นนิดตอนรุ่ง)
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  // ดาวพื้นหลัง (จางลงเล็กน้อยตอนฟ้าเริ่มสว่าง)
  STARS.forEach(st=>{
    const yy=st.y*HZ; const dimv=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.05+Math.abs(Math.sin(st.tw+frame*.015))*.27)*dimv*(1-0.55*dawn);
    ctx.fillStyle='#dfe8ff';ctx.beginPath();ctx.arc(st.x*W,yy,st.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;
  // แสงรุ่งส้มจาง — ที่ขอบฟ้า "ทิศตะวันออกเฉียงใต้" (az ~105° = จุดอาทิตย์ขึ้น 3 พ.ย. · verified) เยื้องขวา
  //   เฉพาะตอน dawn>0 (sun สูงกว่า -18°) · จาง · ไม่ลามขึ้นกลางฟ้า
  if(dawn>0.01){
    const gx=W*0.74;                                  // ESE = เยื้องขวา (อาทิตย์อยู่ใต้-ขวาของจันทร์)
    const g=ctx.createRadialGradient(gx,HZ,0,gx,HZ,W*0.6);
    g.addColorStop(0,'rgba(232,150,96,'+(0.20*dawn).toFixed(3)+')');
    g.addColorStop(0.4,'rgba(180,120,90,'+(0.07*dawn).toFixed(3)+')');
    g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,HZ-240,W,240);
  }

  // ── แกนมุมเงย (°เหนือขอบฟ้า · เส้นประจาง) ──
  ctx.strokeStyle='rgba(150,180,225,0.15)';ctx.fillStyle='rgba(170,200,240,0.5)';
  ctx.font='600 20px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  [40,50,60].forEach(deg=>{const yy=altToY(deg);
    ctx.setLineDash([2,9]);ctx.beginPath();ctx.moveTo(60,yy);ctx.lineTo(W-60,yy);ctx.stroke();ctx.setLineDash([]);
    ctx.fillText(deg+'°',22,yy);});

  // ── ตำแหน่งจริง: จันทร์ที่มุมเงย/azimuth จริง (ขึ้นตามเวลา) · พฤหัส offset จริง (สเกลเดียว) ──
  const mx=azToX(s.maz), my=altToY(s.malt);
  const jx=mx+s.daz*PXPM, jy=my-s.dalt*PXPM;   // dalt + = สูงกว่า = ขึ้น (y ลด)
  const sep=Math.hypot(s.daz,s.dalt);
  const occulted=sep<MOON_R_ARCMIN*0.99;
  const emerged=(min>46)&&!occulted;           // closest ~min44
  const brightAng=1.35;                        // ขอบสว่างหันลง-ขวา (เข้าหาดวงอาทิตย์ az ~103° · verified -77° sky frame)
  const labelOp=interpolate(frame,[0,250,300],[1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})
               *Math.max(0,Math.min(1,(sep-MOON_R_ARCMIN-2)/4));

  drawJupiter(ctx,jx,jy,mx,my,labelOp);

  // ดวงจันทร์เสี้ยว (ข้างแรม 38.8% · ขอบสว่างด้านล่าง)
  const mglow=ctx.createRadialGradient(mx,my,RM*0.7,mx,my,RM*1.5);
  mglow.addColorStop(0,'rgba(225,228,210,0.10)');mglow.addColorStop(1,'transparent');
  ctx.fillStyle=mglow;ctx.beginPath();ctx.arc(mx,my,RM*1.5,0,Math.PI*2);ctx.fill();
  // ด้านมืดของจันทร์เสี้ยว = แสงโลก (earthshine) "จางมาก" เกือบกลมกลืนฟ้ามืด
  //   → ไม่เป็นจานน้ำเงินทึบมากัดพฤหัส · ยังเห็นเค้าจานรางๆ ให้พฤหัสโผล่จากขอบมืดได้ make sense
  //   จันทร์ (รวมด้านมืด=หินทึบแสง) บังพฤหัสจริง → ขณะโผล่ พฤหัสไม่เต็มดวง ถูกขอบเผยออกทีละนิด
  drawPhase(ctx,mx,my,RM,ILLUM_M,brightAng,'#d9dbc8','#fdfdf4','rgba(18,23,40,0.28)');
  // เส้นขอบจานจันทร์ด้านมืดจางมาก — บอกตำแหน่ง "ขอบ" ที่พฤหัสโผล่ออก โดยไม่เป็นจานทึบ
  ctx.save();ctx.strokeStyle='rgba(110,126,168,0.16)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.arc(mx,my,RM,0,Math.PI*2);ctx.stroke();ctx.restore();
  if(labelOp>0.01){
    ctx.globalAlpha=labelOp;ctx.fillStyle='rgba(230,232,212,.9)';ctx.font='600 24px sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('ดวงจันทร์',mx-RM-12,my);ctx.globalAlpha=1;
  }

  // ── สถานะ (บน ใต้หัวข้อ) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(occulted){ctx.fillStyle='#ffb070';ctx.font='700 36px sans-serif';ctx.fillText('● ดาวพฤหัสบดีถูกบัง',W/2,232);}
  else if(emerged){ctx.fillStyle='rgba(255,224,180,.92)';ctx.font='700 32px sans-serif';ctx.fillText('โผล่จากด้านมืดของดวงจันทร์',W/2,232);}
  else{ctx.fillStyle='rgba(220,232,255,.88)';ctx.font='700 32px sans-serif';ctx.fillText('ดวงจันทร์ไล่ขึ้นเข้าหาดาวพฤหัสบดี',W/2,232);}

  // ── เส้นขอบฟ้า + เงาภูเขา ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+20+Math.sin(x*0.013+1.7)*14+Math.sin(x*0.05)*6;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(210,224,255,'+(0.55+0.3*dawn).toFixed(2)+')';ctx.font='700 29px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🧭 ทิศตะวันออก · เช้ามืด (ก่อนรุ่งสาง)',W/2,HZ-12);

  // ── ไทม์ไลน์เวลา (04:05 → 05:25) + จุดเวลาปัจจุบัน + ป้าย ingress/egress ──
  const tlY=300,tlX0=150,tlX1=930;
  ctx.strokeStyle='rgba(170,198,240,0.30)';ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(tlX0,tlY);ctx.lineTo(tlX1,tlY);ctx.stroke();
  // marker บัง (04:17 = min12) และโผล่ (05:19 = min74)
  [['บัง',12],['โผล่',74]].forEach(([lab,mm])=>{const xx=lerp(tlX0,tlX1,mm/T_MIN);
    ctx.fillStyle='rgba(255,180,110,0.7)';ctx.beginPath();ctx.arc(xx,tlY,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,200,150,0.7)';ctx.font='600 19px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(lab,xx,tlY-9);});
  ctx.fillStyle='rgba(180,205,245,0.55)';ctx.font='600 21px sans-serif';ctx.textBaseline='middle';
  ctx.textAlign='right';ctx.fillText('๐๔:๐๕',tlX0-10,tlY);ctx.textAlign='left';ctx.fillText('๐๕:๒๕',tlX1+10,tlY);
  const dotX=lerp(tlX0,tlX1,prog);
  ctx.shadowColor='#ffd060';ctx.shadowBlur=14;ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(dotX,tlY,9,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='rgba(255,242,205,0.96)';ctx.font='700 27px sans-serif';
  ctx.fillText('🕐 '+tLabel(min)+' น.',Math.max(150,Math.min(W-150,dotX)),tlY+14);

  // ── หัวข้อบน ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#ffe6bf';ctx.font='700 50px sans-serif';ctx.fillText('ดวงจันทร์บังดาวพฤหัสบดี',W/2,108);
}

export function JupiterOccultVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timing.DURATION-15,timing.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const cardOp=interpolate(frame,[0,18,105,135],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#04060e'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timing} topY={360}/>
      <Credit timing={timing} startAt={timing.CREDIT_AT} label="based on" source="GALILEO" sub="Galilei 1610 · ดวงจันทร์บริวาร ๔ ดวง"/>
    </AbsoluteFill>
    {cardOp>0.001&&(
      <AbsoluteFill style={{opacity:cardOp,justifyContent:'center',alignItems:'center',pointerEvents:'none'}}>
        <div style={{background:'rgba(6,8,18,0.88)',border:'1px solid rgba(255,200,120,0.4)',
          borderRadius:28,padding:'44px 52px',textAlign:'center',maxWidth:960,boxShadow:'0 0 70px rgba(255,180,90,0.26)'}}>
          <div style={{color:'#ffd9a0',fontSize:35,fontWeight:600,letterSpacing:1}}>🪐 ปรากฏการณ์ท้องฟ้า ปี ๒๕๖๙</div>
          <div style={{color:'#ffffff',fontSize:64,fontWeight:800,margin:'14px 0 6px'}}>ดวงจันทร์บังดาวพฤหัสบดี</div>
          <div style={{color:'#ffce8f',fontSize:48,fontWeight:700}}>๓ พฤศจิกายน ๒๕๖๙ · เช้ามืด ตะวันออก</div>
          <div style={{color:'rgba(255,228,190,0.92)',fontSize:31,marginTop:22,lineHeight:1.5}}>
            <b>ภาคใต้</b> เห็นบังเต็มดวง (โผล่ ~๐๕:๒๓) · <b>ภาคกลาง-เหนือ</b> เห็นเฉียด
          </div>
        </div>
      </AbsoluteFill>
    )}
    <Narration timing={timing} voDir="vo-jupiter"/>
    <Music timing={timing} music="audio/paganini-o-mamma-clip.mp3" gain={1.0} duck={0.55} creditAt={timing.CREDIT_AT}/>
  </AbsoluteFill>);
}
