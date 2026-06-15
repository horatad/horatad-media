import {useCurrentFrame,AbsoluteFill,Audio,Sequence,staticFile,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,SS} from '../physics.js';

const MUSIC=staticFile('audio/lunar-bgm-clip.mp3');
const LOOP=1411;                                        // เพลง ~47วิ = 1411 เฟรม
const TAIL=2700-LOOP;                                   // รอบสอง จนจบคลิป 90วิ
const fadeIn =f=>interpolate(f,[0,18],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const fadeOutTail=f=>interpolate(f,[TAIL-36,TAIL],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

const W=1080,H=1080;
const SUN=PLANETS.find(p=>p.id==='sun');
const MOON=PLANETS.find(p=>p.id==='moon');
// ล็อกจังหวะ: 1 เดือนจันทรคติ = 6 ห้องเพลง (lunar-bgm ~103 BPM → 13.94วิ = 418 เฟรม)
// → จันทร์เพ็ญตกบน downbeat ของเพลง
const SYNODIC=360/(MOON.dS-SS);                         // ≈ 104 simF
const SPEED=SYNODIC/418;                                // ≈ 0.249 (1 เดือน ≈ 13.9วิ)
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.4:i%3===0?.7:.35,tw:i*0.41
}));

// สัดส่วนสว่างของดวงจันทร์ (0=ดับ, 1=เพ็ญ) จากมุม elongation
function moonIllum(f){
  const sm=gP(SUN,f),mm=gP(MOON,f);
  const cosE=(sm.x*mm.x+sm.y*mm.y)/(Math.hypot(sm.x,sm.y)*Math.hypot(mm.x,mm.y));
  return (1-cosE)/2;
}
// ความสว่างปรากฏสัมพัทธ์ (Allen lunar phase law) — พีคแหลมที่เพ็ญ (α=0)
function moonBrightness(alphaDeg){
  return Math.pow(10,-0.4*(0.026*alphaDeg+4e-9*Math.pow(alphaDeg,4)));
}
function phaseName(k,waxing){
  if(k<0.04) return 'เดือนดับ';
  if(k>0.96) return 'จันทร์เพ็ญ';
  const side=waxing?'ข้างขึ้น':'ข้างแรม';
  if(k<0.46) return 'เสี้ยว · '+side;
  if(k<0.54) return 'ครึ่งดวง · '+side;
  return 'ค่อนดวง · '+side;
}

// วาดดวงจันทร์เป็นจานมีเฟส (ด้านสว่างหันเข้าหาดวงอาทิตย์)
function drawMoonDisk(ctx,x,y,r,cosA,brightAngle){
  ctx.save();
  ctx.translate(x,y);ctx.rotate(brightAngle);            // +x ชี้ไปดวงอาทิตย์
  // วาดเฉพาะส่วนสว่าง — ด้านมืดกลืนท้องฟ้า ไม่มีขอบวงกลม (เหมือนเสี้ยวจริง)
  const xt=r*cosA;
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,'#cfc9b6');g.addColorStop(1,'#fffef7');
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const cx=W/2,cy=H/2,sc=Math.min(W,H)/104;             // ซูมเข้าระบบโลก-จันทร์ (วงโคจรใหญ่)

  // Background
  ctx.fillStyle='#04060e';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.1,cx,cy,W*.62);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ตำแหน่ง
  const sm=gP(SUN,f), mm=gP(MOON,f);
  const dM=Math.hypot(mm.x,mm.y);
  const mx=cx-mm.x*sc, my=cy-mm.y*sc;                    // หมุนฉาก 180° — อาทิตย์เริ่มที่ด้านล่างจอ
  const cosE=(sm.x*mm.x+sm.y*mm.y)/(Math.hypot(sm.x,sm.y)*dM);
  const E=Math.acos(Math.max(-1,Math.min(1,cosE)));
  const Edeg=E*180/Math.PI;
  const k=(1-cosE)/2;                                    // สัดส่วนสว่าง
  const cosA=-cosE;                                      // terminator (มุมเฟส = 180−E)
  const alphaDeg=180-Edeg;
  const sunAng=Math.atan2(sm.y,sm.x);                    // ทิศดวงอาทิตย์ (แสงขนาน)
  const distF=Math.pow(MOON.defR/dM,0.71);               // 1/ระยะ² (ปรับสเกลให้สวิง ~30% perigee↔apogee ตามจริง)
  const glow=moonBrightness(alphaDeg)*distF;             // เพ็ญ perigee (ซูเปอร์มูน) เรืองจ้ากว่า apogee
  const waxing=moonIllum(f+0.5)>k;
  const r=52*(1+0.10*(MOON.defR-dM)/MOON.epiR);         // ขนาดจันทร์ เกือบคงที่

  // ดวงอาทิตย์ที่ขอบจอ (ไกล)
  const sunR=446;                                        // ดึงเข้าให้เห็นดวงเต็ม ไม่ถูกขอบจอตัด
  const sux=cx-Math.cos(sunAng)*sunR, suy=cy-Math.sin(sunAng)*sunR;
  // ลำแสง (limelight) เป็นกรวยนุ่ม คลุมทั้งดวงจันทร์ — ไม่มีเส้นขอบ
  const bAng=Math.atan2(my-suy,mx-sux), px=Math.cos(bAng+Math.PI/2), py=Math.sin(bAng+Math.PI/2);
  const wSun=64, wMoon=r*1.05;
  const beam=ctx.createLinearGradient(sux,suy,mx,my);
  beam.addColorStop(0,'rgba(255,234,190,0.24)');        // อุ่นจางๆ ใกล้อาทิตย์
  beam.addColorStop(0.6,'rgba(248,245,235,0.09)');      // ขาวนวล กลางลำ
  beam.addColorStop(1,'rgba(240,246,255,0.035)');       // ขาวเกือบใส ที่ดวงจันทร์ (ไม่ย้อมส้ม)
  ctx.fillStyle=beam;
  ctx.beginPath();
  ctx.moveTo(sux+px*wSun,suy+py*wSun);
  ctx.lineTo(sux-px*wSun,suy-py*wSun);
  ctx.lineTo(mx-px*wMoon,my-py*wMoon);
  ctx.lineTo(mx+px*wMoon,my+py*wMoon);
  ctx.closePath();ctx.fill();
  // ดวงอาทิตย์ (เรือง) — ใหญ่กว่าดวงจันทร์ชัดเจน (สื่อว่าเป็นวัตถุที่ใหญ่กว่ามาก)
  const sg=ctx.createRadialGradient(sux,suy,0,sux,suy,150);
  sg.addColorStop(0,'rgba(255,236,160,0.98)');sg.addColorStop(0.42,'rgba(255,152,62,0.55)');sg.addColorStop(1,'transparent');
  ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sux,suy,150,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFD27A';ctx.beginPath();ctx.arc(sux,suy,72,0,Math.PI*2);ctx.fill();

  // วงโคจรดวงจันทร์ (รอบโลก) — ศูนย์กลางเลื่อนตาม offset เล็กน้อย
  ctx.beginPath();ctx.arc(cx-4*sc,cy,MOON.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(170,190,230,0.18)';ctx.lineWidth=1;ctx.setLineDash([4,7]);ctx.stroke();ctx.setLineDash([]);
  // จุด perigee (ใกล้สุด) / apogee (ไกลสุด) บนวงโคจร — ตรึงที่ (โมเดลไม่ใส่ precession)
  const periX=cx+(MOON.defR-MOON.epiR)*sc, apoX=cx-(MOON.defR+MOON.epiR)*sc;
  [periX,apoX].forEach(qx=>{
    ctx.beginPath();ctx.arc(qx,cy,3,0,Math.PI*2);
    ctx.fillStyle='rgba(220,110,110,0.55)';ctx.fill();
  });
  // เส้น โลก→จันทร์
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(mx,my);
  ctx.strokeStyle='rgba(200,215,255,.35)';ctx.lineWidth=1;ctx.stroke();

  // Earth
  const eR=16;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=24;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
  ctx.beginPath();ctx.arc(cx,cy,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.85)';ctx.font='600 14px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+eR+4);

  // แสงเรือง (silvery) ตามความสว่าง — พีคที่เพ็ญ
  if(glow>0.01){
    const R=r*(1.9+2.8*glow);
    const halo=ctx.createRadialGradient(mx,my,0,mx,my,R);
    halo.addColorStop(0,   'rgba(238,243,255,'+(0.92*glow).toFixed(3)+')');
    halo.addColorStop(0.35,'rgba(195,212,245,'+(0.40*glow).toFixed(3)+')');
    halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(mx,my,R,0,Math.PI*2);ctx.fill();
  }
  drawMoonDisk(ctx,mx,my,r,cosA,Math.atan2(suy-my,sux-mx));

  // ป้ายชื่อเฟส ใต้ดวงจันทร์
  ctx.fillStyle='rgba(235,240,255,.92)';ctx.font='700 19px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText(phaseName(k,waxing),mx,my+r+10);

  // ป้ายแดง เมื่อจันทร์เข้าใกล้ perigee/apogee — ดาราศาสตร์ + ทับศัพท์โหราศาสตร์
  const periGlow=Math.max(0,Math.min(1,(19.5-dM)/1.5));
  const apoGlow =Math.max(0,Math.min(1,(dM-24.5)/1.5));
  const paTag=(a,qx,l1,l2)=>{
    if(a<0.03)return;
    const ox=qx>=cx?100:-100;                            // ยึดที่จุดแดง วางด้านนอก (คงที่ ไม่ตามจันทร์)
    ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle='#FF5A5A';ctx.textBaseline='alphabetic';
    ctx.font='700 17px sans-serif';ctx.fillText(l1,qx+ox,cy-3);
    ctx.font='700 19px sans-serif';ctx.fillText(l2,qx+ox,cy+19);
    ctx.globalAlpha=1;
  };
  paTag(periGlow,periX,'Perigee','นิจ');
  paTag(apoGlow ,apoX,'Apogee','อุจ');

  // หัวข้อ
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#dfe7ff';ctx.font='700 32px sans-serif';
  ctx.fillText('ดวงจันทร์',40,60);
  ctx.fillStyle='rgba(223,231,255,0.7)';ctx.font='600 22px Georgia,serif';
  ctx.fillText('Phases of the Moon',40,90);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='400 15px sans-serif';
  ctx.fillText('สว่างที่สุดตอนเพ็ญ (เต็มดวง) · ขนาดเกือบคงที่',40,120);

  // เครดิต
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='400 20px Georgia,serif';
  ctx.fillText('based on',W-40,58);ctx.fillText('observation',W-40,82);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='400 16px sans-serif';
  ctx.fillText('Horatad created',W-40,114);ctx.fillText('11 Jun 2026',W-40,135);
}

export function MoonPhase(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  return(
    <AbsoluteFill style={{background:'#04060e'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Sequence from={0} durationInFrames={LOOP}>
        <Audio src={MUSIC} volume={fadeIn}/>
      </Sequence>
      <Sequence from={LOOP} durationInFrames={TAIL}>
        <Audio src={MUSIC} volume={fadeOutTail}/>
      </Sequence>
    </AbsoluteFill>
  );
}
