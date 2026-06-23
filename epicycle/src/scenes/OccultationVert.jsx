import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timing from '../timing-occult.js';

// ── ดวงจันทร์บังดาวศุกร์ — มุมมองเดียว "ตาเปล่าจากพื้นโลก" (ท้องฟ้าหัวค่ำ ทิศตะวันตก) ──
// ค่าจริง ephem (2026-09-14 กรุงเทพ): จันทร์สว่าง 12.6% · ศุกร์เฟส 29% · ทั้งคู่ตกจาก alt 18°→0° ใน ~1 ชม.
// การเคลื่อนที่จริง: (1) ทั้งจันทร์+ศุกร์ "ตกลับขอบฟ้าด้วยกัน" ตามการหมุนโลก
//                  (2) ดวงจันทร์ยังคืบผ่านศุกร์ (orbital) → บังครั้งเดียว ขอบมืดนำ→โผล่ขอบสว่าง
// ท้องฟ้า: สนธยาสว่าง (หัวค่ำ) → มืดลงเรื่อยๆ ตามเวลา · จานจันทร์เล็กสมจริง · เสี้ยวศุกร์วาดจริง
const W=1080,H=1920,HZ=1652,RM=88;
const ILLUM_M=0.126, BRIGHT=0.80;       // เฟส/ทิศเสี้ยวจันทร์ (verified ephem)
// ทิศตกจริง (ephem): ทั้งคู่เคลื่อน "ลงขวา ~72°" เกือบขนาน · ตกถึงขอบฟ้า (alt 0) ราว p≈0.92 แล้วจมใต้ขอบฟ้า
const VX0=470,VY0=400;                   // ดาวศุกร์ ตำแหน่งเริ่ม (สูง · ต้นหัวค่ำ alt~17°)
const DRIFT=442, DESCENT=1361;           // ตกลงขวา ~72° · ถึงขอบฟ้า(HZ)ที่ p≈0.92 → จมใต้ขอบฟ้าตอนจบ
const MOVE=[0.71,0.71];                   // จันทร์คืบผ่านศุกร์เฉียง 45° (relative velocity จริง)
// relD=251*(0.65−p): ศุกร์เห็น(เข้าใกล้) p<0.30 → ถูกบัง p>0.30 ค้างยาวจน "ตกลับขอบฟ้าทั้งที่ยังบัง" (ไม่โผล่กลับ · ตามจริงกรุงเทพ)
const REL_K=251, REL_C=0.65;
const STARS=Array.from({length:240},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5)*0.86,
  r:i%11===0?1.5:i%3===0?.7:.35,tw:i*0.41
}));

function lerp(a,b,t){return a+(b-a)*t;}
function mix(c1,c2,t){ // c1,c2 = [r,g,b]
  return `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;
}

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
  const RV=12;
  // clip: ทั้งจอ "ลบ" วงจานดวงจันทร์ → ขอบจันทร์บังจานศุกร์ทีละนิด (ค่อยๆ หาย/โผล่ ตามจริง · ไม่วับทันที)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,W,H);
  ctx.arc(mx,my,RM,0,Math.PI*2);
  ctx.clip('evenodd');
  const halo=ctx.createRadialGradient(vx,vy,RV*0.5,vx,vy,RV*2.8);
  halo.addColorStop(0,'rgba(215,238,255,0.6)');halo.addColorStop(0.5,'rgba(150,195,255,0.18)');halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,RV*2.8,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,vx,vy,RV,0.29,BRIGHT,'#bfe0ff','#ffffff','rgba(15,22,38,0.92)');
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
  const p=frame/timing.DURATION;          // 0(ต้นหัวค่ำ) → 1(ดึก/ใกล้ตก)

  // ── ท้องฟ้าสนธยา → มืดลงตามเวลา ──
  const tw=Math.min(1,p*1.05);            // ความคืบหน้าการมืด
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#03040c');
  sky.addColorStop(0.55,mix([10,20,48],[3,6,16],tw));
  sky.addColorStop(0.82,mix([36,58,99],[8,16,34],tw));
  sky.addColorStop(0.95,mix([122,90,78],[26,24,34],tw));
  sky.addColorStop(1,  mix([202,160,116],[40,32,30],tw));   // แสงเรืองขอบฟ้าจางหายตามเวลา
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HZ);
  STARS.forEach(s=>{
    const yy=s.y*HZ; const dim=Math.max(0,Math.min(1,(HZ-yy)/HZ*1.3));
    ctx.globalAlpha=(.04+Math.abs(Math.sin(s.tw+frame*.015))*.26)*dim*(0.55+0.45*tw); // ดาวเด่นขึ้นเมื่อฟ้ามืด
    ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(s.x*W,yy,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // ── ตำแหน่ง: ทั้งคู่ตกลงขอบฟ้าด้วยกัน + จันทร์คืบผ่านศุกร์ ──
  const vx=VX0+DRIFT*p, vy=VY0+DESCENT*p;            // ดาวศุกร์ (เคลื่อนตามเวลา · ตกลงขอบฟ้า)
  const relD=REL_K*(REL_C-p);                        // จันทร์เทียบศุกร์ (+ก่อน → -หลัง · บัง p>0.30)
  const mx=vx+relD*MOVE[0], my=vy+relD*MOVE[1];
  const dist=Math.hypot(vx-mx,vy-my);
  const occulted=dist<RM*0.92;                           // (ใช้กับ status เท่านั้น · การบังจริงทำด้วย clip)
  const aboveHZ=my<HZ;                                    // ดวงจันทร์ยังเหนือขอบฟ้า (ยังไม่ตก)
  const labelOp=Math.max(0,Math.min(1,(dist-230)/220));  // ป้ายจางหายตอนเข้าใกล้

  drawVenus(ctx,vx,vy,mx,my,labelOp);                    // ศุกร์ถูกขอบจันทร์ clip บังทีละนิด (ไม่วับทันที)

  // ── ดวงจันทร์เสี้ยว (เล็ก สมจริง) ──
  const earth=ctx.createRadialGradient(mx,my,RM*0.2,mx,my,RM);
  earth.addColorStop(0,'rgba(90,100,120,0.16)');earth.addColorStop(1,'rgba(50,58,78,0.04)');
  ctx.fillStyle=earth;ctx.beginPath();ctx.arc(mx,my,RM,0,Math.PI*2);ctx.fill();
  const mglow=ctx.createRadialGradient(mx,my,RM*0.7,mx,my,RM*1.6);
  mglow.addColorStop(0,'rgba(230,232,210,0.10)');mglow.addColorStop(1,'transparent');
  ctx.fillStyle=mglow;ctx.beginPath();ctx.arc(mx,my,RM*1.6,0,Math.PI*2);ctx.fill();
  drawPhase(ctx,mx,my,RM,ILLUM_M,BRIGHT,'#d7d9c6','#fdfdf4','rgba(18,22,34,0.0)');
  if(labelOp>0.01&&my<HZ-RM&&my>RM){
    ctx.globalAlpha=labelOp;
    ctx.fillStyle='rgba(228,230,210,.85)';ctx.font='600 24px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('ดวงจันทร์',mx,my+RM+10);
    ctx.globalAlpha=1;
  }

  // ── สถานะ (ใต้หัวข้อ · เหนือ caption ที่ย้ายมาบน) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  if(!aboveHZ){ctx.fillStyle='rgba(210,225,255,.72)';ctx.font='700 30px sans-serif';ctx.fillText('ทั้งคู่ลับขอบฟ้า — ศุกร์ยังถูกบัง',W/2,150);}
  else if(occulted){ctx.fillStyle='#ff9a6a';ctx.font='700 34px sans-serif';ctx.fillText('● ดาวศุกร์ถูกบัง',W/2,150);}
  else{ctx.fillStyle='rgba(210,232,255,.85)';ctx.font='700 30px sans-serif';ctx.fillText('ดวงจันทร์เคลื่อนเข้าหาดาวศุกร์',W/2,150);}

  // ── เส้นขอบฟ้า + เงาภูเขา (พื้นโลก) ──
  ctx.fillStyle='#05070e';
  ctx.beginPath();ctx.moveTo(0,HZ);
  for(let x=0;x<=W;x+=30){const hh=HZ+22+Math.sin(x*0.013+1.7)*16+Math.sin(x*0.05)*7;ctx.lineTo(x,hh);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,225,180,'+(0.85*(1-tw*0.5)).toFixed(2)+')';ctx.font='700 30px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('🧭 ทิศตะวันตก · หัวค่ำ (หลังอาทิตย์ตก)',W/2,HZ-12);

  // ── หัวข้อ (บนสุด) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#cfe6ff';ctx.font='700 50px sans-serif';
  ctx.fillText('ดวงจันทร์บังดาวศุกร์',W/2,96);
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
      <Caption timing={timing}/>
      <Credit timing={timing} label="based on" source="OBSERVATION" sub="ดวงจันทร์บังดาว · NARIT 2569"/>
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
    <Music timing={timing} music="audio/salut-damour-clip.mp3" outroFade={120}/>
  </AbsoluteFill>);
}
