import {useCurrentFrame,AbsoluteFill,Audio,Sequence,staticFile,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,SS} from '../physics.js';

const MUSIC=staticFile('audio/dream-island-clip.mp3');
const LOOP=1350;                                        // เพลงยาว ~45วิ = 1350 เฟรม
// ระดับเสียงคงที่ดังสุด (1.0) — fade เฉพาะตอนเปิด/ปิดคลิป ส่วนรอยต่อกลางต่อเนื่อง
const fadeIn =f=>interpolate(f,[0,15],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const fadeOut=f=>interpolate(f,[LOOP-30,LOOP],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

const W=1080,H=1080;
const SUN=PLANETS.find(p=>p.id==='sun');
const VENUS=PLANETS.find(p=>p.id==='venus');
// ล็อกจังหวะ: 1 รอบ synodic ดาวศุกร์ = วลี 8 ห้องของเพลง (120 BPM → 16.0วิ = 480 เฟรม)
const SYNODIC=360/(VENUS.eS-SS);                        // simF ต่อรอบ ≈ 2057
const SPEED=SYNODIC/480;                                // ≈ 4.286 (เดิม 4.2 = 0.3×)
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.4:i%3===0?.7:.35,tw:i*0.41
}));

// สูตร phase function เชิงประจักษ์ของดาวศุกร์ (Mallama 2018) — คืน "ตัวคูณความสว่าง" เทียบเต็มดวง
// อิงชั้นบรรยากาศจริง: เสี้ยวบางยังจ้า → สว่างสุดที่ ~27% (เสี้ยวบาง) ตรงตามที่เห็นจริง
function venusPhaseFactor(aDeg){
  const a=Math.min(163.7,aDeg);                          // โพลิโนเมียลใช้ได้ถึง ~163.7°
  const dm=-1.044e-3*a+3.687e-4*a*a-2.814e-6*a*a*a+8.938e-9*a*a*a*a; // แมกนิจูดเทียบเต็มดวง
  return Math.pow(10,-0.4*dm);                            // → flux (เต็มดวง=1)
}
// ความสว่างปรากฏ (flux) ของดาวศุกร์ที่มองจากโลก: phaseFactor(α) / (ระยะโลก² · ระยะดวงอาทิตย์²)
function venusFluxAt(f){
  const sm=gP(SUN,f),vm=gP(VENUS,f);
  const dE2=vm.x*vm.x+vm.y*vm.y;
  const sxv=sm.x-vm.x,syv=sm.y-vm.y,dS2=sxv*sxv+syv*syv;
  const cosA=(sxv*(-vm.x)+syv*(-vm.y))/Math.sqrt(dS2*dE2);
  const aDeg=Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI;
  return venusPhaseFactor(aDeg)/(dE2*dS2);
}
// ค่าสูงสุดต่อรอบ (greatest brilliancy) ใช้ normalize ความสว่างสัมพัทธ์เป็น 0..1
let VENUS_BMAX=0;
for(let f=0;f<SYNODIC;f+=SYNODIC/1000){const b=venusFluxAt(f);if(b>VENUS_BMAX)VENUS_BMAX=b;}

// วาดดาวศุกร์เป็นจานที่มีเฟส (เสี้ยว→เต็มดวง) ตามมุมเฟส
function drawVenusDisk(ctx,x,y,r,cosA,brightAngle){
  ctx.save();
  ctx.translate(x,y);ctx.rotate(brightAngle);          // หลังหมุน: +x ชี้ไปดวงอาทิตย์
  // ด้านมืด (โปร่งแสง — เห็นโลก/เส้นทะลุผ่าน) + ขอบจางให้เห็นทรงกลมเต็มดวง
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='rgba(12,22,34,0.32)';ctx.fill();
  ctx.strokeStyle='rgba(130,170,210,0.22)';ctx.lineWidth=1;ctx.stroke();
  // ส่วนสว่าง = ขอบสว่าง (ครึ่งวงด้าน +x) + เส้น terminator เป็นวงรี
  const xt=r*cosA;                                      // ระยะ terminator (เซ็น = gibbous/เสี้ยว)
  ctx.beginPath();
  ctx.arc(0,0,r,-Math.PI/2,Math.PI/2,false);
  ctx.ellipse(0,0,Math.abs(xt),r,0,Math.PI/2,-Math.PI/2,xt>0?false:true);
  ctx.closePath();
  const g=ctx.createLinearGradient(-r,0,r,0);
  g.addColorStop(0,'#9fd0ff');g.addColorStop(1,'#ffffff');
  ctx.fillStyle=g;ctx.fill();
  ctx.restore();
}

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const cx=W/2,cy=H/2,sc=Math.min(W,H)/150;             // ขยายวงโคจรดาวศุกร์ให้ใหญ่

  // Background
  ctx.fillStyle='#020a16';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.1,cx,cy,W*.62);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,12,.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ตำแหน่ง (model coords เทียบโลกที่จุดศูนย์กลาง)
  const sm=gP(SUN,f), vm=gP(VENUS,f);
  const sx=cx+sm.x*sc,sy=cy+sm.y*sc;
  const vx=cx+vm.x*sc,vy=cy+vm.y*sc;

  // วง deferent ของดวงอาทิตย์
  ctx.beginPath();ctx.arc(cx,cy,SUN.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,0.16)';ctx.lineWidth=1;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);
  // วง epicycle ของดาวศุกร์ (รอบดวงอาทิตย์)
  ctx.beginPath();ctx.arc(sx,sy,VENUS.epiR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(120,190,255,0.35)';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
  // เส้น โลก→ดวงอาทิตย์ และ ดวงอาทิตย์→ดาวศุกร์ และ เส้นเล็ง โลก→ศุกร์
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(sx,sy);
  ctx.strokeStyle='rgba(255,170,70,.4)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(vx,vy);
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(vx,vy);
  ctx.strokeStyle='rgba(120,190,255,.18)';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.stroke();ctx.setLineDash([]);

  // Earth
  const eR=13;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=22;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(cx,cy,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.8)';ctx.font='600 13px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+eR+4);

  // Sun
  const suR=22;
  ctx.shadowColor='#FF7733';ctx.shadowBlur=34;
  const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,suR);
  sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(sx,sy,suR,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.85)';ctx.font='600 14px sans-serif';
  ctx.textBaseline='top';ctx.fillText('ดวงอาทิตย์',sx,sy+suR+4);

  // ---- ดาวศุกร์: เฟส + ขนาด + ความสว่างสัมพัทธ์จริง ----
  const d=Math.hypot(vm.x,vm.y);                         // ระยะ โลก-ศุกร์
  const r=Math.min(95,800/d);                            // ขนาดปรากฏ ~ 1/ระยะ
  const toSun=[sm.x-vm.x,sm.y-vm.y], toEarth=[-vm.x,-vm.y];
  const dS=Math.hypot(toSun[0],toSun[1]);               // ระยะ ดวงอาทิตย์-ศุกร์
  const cosA=(toSun[0]*toEarth[0]+toSun[1]*toEarth[1])/(dS*d);
  const a=Math.acos(Math.max(-1,Math.min(1,cosA)));     // มุมเฟส α
  const k=(1+cosA)/2;                                    // สัดส่วนสว่าง (รูปทรงเสี้ยว)
  const brightAngle=Math.atan2(sy-vy,sx-vx);             // ทิศขอบสว่าง (ไปทางดวงอาทิตย์)

  // ถูกแสงอาทิตย์กลบเมื่อ elongation เล็ก
  const E=Math.acos(Math.max(-1,Math.min(1,
    (sm.x*vm.x+sm.y*vm.y)/(Math.hypot(sm.x,sm.y)*d))))*180/Math.PI;
  const glare=Math.max(0,Math.min(1,(E-8)/10));
  // ความสว่างปรากฏสัมพัทธ์จริง 0..1 (Mallama — พีคที่เฟสเสี้ยว ~27% = greatest brilliancy)
  const rel=Math.min(1,(venusPhaseFactor(a*180/Math.PI)/(d*d*dS*dS))/VENUS_BMAX);
  const glow=rel*glare;

  // จุดบอกตำแหน่งจริงในวงโคจร (เห็นเสมอ)
  ctx.beginPath();ctx.arc(vx,vy,2.5,0,Math.PI*2);
  ctx.fillStyle='rgba(190,224,255,.5)';ctx.fill();

  // เรืองแสงตามความสว่างสัมพัทธ์ — ยิ่งสว่างยิ่งโต/จ้า
  if(glow>0.002){
    const R=r*(2.4+3.0*glow);
    const halo=ctx.createRadialGradient(vx,vy,0,vx,vy,R);
    halo.addColorStop(0,   'rgba(220,240,255,'+(0.90*glow).toFixed(3)+')');
    halo.addColorStop(0.35,'rgba(170,210,255,'+(0.40*glow).toFixed(3)+')');
    halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,R,0,Math.PI*2);ctx.fill();
  }

  // จานแสดงเฟส — เห็นรูปทรงเมื่อพ้นแสงอาทิตย์ (จางที่ conjunction)
  ctx.globalAlpha=glare;
  drawVenusDisk(ctx,vx,vy,r,cosA,brightAngle);
  ctx.globalAlpha=1;

  // หัวข้อ
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#bfe0ff';ctx.font='700 32px sans-serif';
  ctx.fillText('ดาวศุกร์',40,60);
  ctx.fillStyle='rgba(190,224,255,0.7)';ctx.font='600 22px Georgia,serif';
  ctx.fillText('Phases of Venus',40,90);
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='400 15px sans-serif';
  ctx.fillText('เสี้ยว (เข้าใกล้โลก) = สว่างที่สุด',40,118);
  ctx.fillText('เต็มดวง (ไกล) = เล็กและจาง',40,140);
  ctx.fillText('ชิดดวงอาทิตย์มาก = ถูกแสงกลบ มองไม่เห็น',40,162);

  // เครดิต (ขวาบน)
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='400 20px Georgia,serif';
  ctx.fillText('based on',W-40,58);
  ctx.fillText('Almagest',W-40,82);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='400 16px sans-serif';
  ctx.fillText('(~150 AD)',W-40,114);
  ctx.fillText('Horatad created',W-40,135);
  ctx.fillText('9 Jun 2026',W-40,156);
}

export function VenusPhase(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  return(
    <AbsoluteFill style={{background:'#020a16'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Sequence from={0} durationInFrames={LOOP}>
        <Audio src={MUSIC} volume={fadeIn}/>
      </Sequence>
      <Sequence from={LOOP} durationInFrames={LOOP}>
        <Audio src={MUSIC} volume={fadeOut}/>
      </Sequence>
    </AbsoluteFill>
  );
}
