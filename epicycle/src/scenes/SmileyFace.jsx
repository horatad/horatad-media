import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as T from '../timing-smiley.js';

// ── "จันทร์ยิ้ม" (Shorts 1080×1920) ──
// 1/3 แรก: ท้องฟ้าหน้ายิ้มเต็มจอ → เลื่อนลง 1/3 ล่าง · 2/3 บน = epicycle ใหญ่
// epicycle: rate เฉลี่ยจริง (จันทร์ 13°/วัน · ศุกร์ 1°/วัน · พฤหัส 0.08°/วัน = 158:12:1)
//   เรียงแนวเดียว(ตอน seg4-6 + ตอนจบ) → ดริฟต์โชว์ความเร็วต่างกัน(seg7-9) → reverse กลับเรียง+ค้างถึงจบเครดิต
const W=1080,H=1920;
const STARS=Array.from({length:90},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5), r:i%13===0?1.1:0.6, tw:i*0.41
}));
const VENUS=[442,805], JUP=[652,838], MOON=[548,1095], MR=78;
const BC=[547,913];
const SLIDE_FROM=T.SEG[3].from, SLIDE_TO=T.SEG[4].from;
const EPI=[540,720];                                  // ศูนย์ epicycle (ใหญ่ เต็ม 2/3 บน)
const DISP={moon:160,venus:300,jupiter:440};          // รัศมีแสดงผล (ใกล้→ไกล)
const RATE={moon:3.743,venus:0.28,jupiter:0.02361};   // rate เฉลี่ยจริง (deferent) — อัตราส่วน 158:12:1
const S0=-90, ESPEED=0.13;                            // มุมเริ่ม(ชี้ขึ้น=เรียง) · ความเร็ว (จันทร์โคจรเดินหน้า ~1 รอบ)
const BACK_FROM=T.SEG[10].from, BACK_TO=T.VO_END;     // ช่วงหน้ายิ้มเลื่อนกลับขึ้นกลาง (ตอนจบ)
const BMC=[540,1500];                                 // ศูนย์หน้ายิ้มเมื่อเลื่อนลง (กลาง 1/3 ล่าง · เลี่ยง UI)
const lerp=(a,b,t)=>a+(b-a)*t, sstep=t=>t*t*(3-2*t);
const clampI=(f,a,b,c,d)=>interpolate(f,[a,b,c,d],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

// ขนาด/ความสว่างตามที่เห็นจริงจากโลก: จันทร์ = จานใหญ่ · ศุกร์ สว่างสุด(−4.1) · พฤหัส รองลงมา(−2.0)
function planet(ctx,x,y,coreR,col,bloom){
  ctx.save();
  ctx.filter='blur(10px)';ctx.globalAlpha=0.5;ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(x,y,coreR*(bloom||4),0,7);ctx.fill();
  ctx.filter='blur(3px)';ctx.globalAlpha=0.85;ctx.beginPath();ctx.arc(x,y,coreR*1.7,0,7);ctx.fill();
  ctx.filter='none';ctx.globalAlpha=1;
  ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.arc(x,y,coreR,0,7);ctx.fill();
  ctx.restore();
}
function crescent(ctx,x,y,r,sky){
  const off=r*0.60;
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
  const lit=ctx.createLinearGradient(0,y+r,0,y-r*0.2);
  lit.addColorStop(0,'#fefaee');lit.addColorStop(0.7,'#ece4cf');lit.addColorStop(1,'#cfc8b2');
  ctx.fillStyle=lit;ctx.fillRect(x-r,y-r,2*r,2*r);
  ctx.fillStyle=sky;ctx.beginPath();ctx.arc(x,y-off,r,0,7);ctx.fill();
  ctx.restore();
}
function label(ctx,t,x,y,col,size,w,align){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';
  ctx.textAlign=align||'center';ctx.textBaseline='top';ctx.fillText(t,x,y);
}

// ef: เดินหน้าอย่างเดียว (จันทร์ไม่ถอยหลัง) — เริ่มเรียงแนว(ef=0) แล้วจันทร์โคจรเดินหน้าโชว์ความเร็ว
function efOf(frame){ return Math.max(0,(frame-SLIDE_TO))*ESPEED; }
const mAng=(id,ef)=>(S0-RATE[id]*ef)*Math.PI/180;

function drawEpicycle(ctx,frame,op,sky){
  if(op<=0.01)return;
  const ef=efOf(frame), [cx,cy]=EPI;
  const defs={moon:'#dfe7ff',venus:'#bfe0ff',jupiter:'#ffbf6a'};
  const ids=['jupiter','venus','moon'];
  const A=ids.map(id=>mAng(id,ef));const spread=Math.max(...A)-Math.min(...A);
  const aligned=Math.max(0,1-Math.abs(((spread+Math.PI)%(2*Math.PI))-Math.PI)/0.55);
  ctx.save();ctx.globalAlpha=op;
  ids.forEach(id=>{ctx.beginPath();ctx.arc(cx,cy,DISP[id],0,7);
    ctx.strokeStyle='rgba(160,180,225,0.26)';ctx.lineWidth=1.3;ctx.setLineDash([4,10]);ctx.stroke();ctx.setLineDash([]);});
  ids.forEach(id=>{const a=mAng(id,ef);const Lx=cx+Math.cos(a)*500,Ly=cy+Math.sin(a)*500;
    ctx.globalAlpha=op*(0.30+0.5*aligned);ctx.strokeStyle=defs[id];ctx.lineWidth=2;ctx.setLineDash([6,8]);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(Lx,Ly);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=op;});
  ids.forEach(id=>{const a=mAng(id,ef),R=DISP[id],x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;
    if(id==='moon'){ crescent(ctx,x,y,32,sky); label(ctx,'จันทร์',x,y+38,defs.moon,24,700);}
    else{
      const big=id==='venus';   // ศุกร์สว่าง/ใหญ่กว่าพฤหัส (apparent)
      ctx.strokeStyle='rgba(255,255,255,.20)';ctx.lineWidth=.9;
      ctx.beginPath();ctx.arc(x,y,big?17:14,0,7);ctx.stroke();
      ctx.fillStyle=defs[id];ctx.shadowColor=defs[id];ctx.shadowBlur=big?20:13;
      ctx.beginPath();ctx.arc(x,y,big?10:7,0,7);ctx.fill();ctx.shadowBlur=0;
      label(ctx,PLANET_TH[id],x+16,y-12,defs[id],24,700,'left');
    }});
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,22);
  eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
  ctx.beginPath();ctx.arc(cx,cy,22,0,7);ctx.fillStyle=eg;ctx.fill();
  label(ctx,'โลก',cx,cy+26,'rgba(200,220,255,.92)',22,700);
  if(aligned>0.35){ctx.globalAlpha=op*aligned;
    label(ctx,'เรียงแนวเดียว → เห็นเป็นหน้ายิ้ม',cx,cy+DISP.jupiter+16,'#ffe08a',24,800);ctx.globalAlpha=op;}
  ctx.restore();
}
const PLANET_TH={venus:'ศุกร์',jupiter:'พฤหัส'};

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0.00,'#040406');sky.addColorStop(0.55,'#0a0b11');sky.addColorStop(1,'#15161e');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.05+Math.abs(Math.sin(s.tw+frame*.02))*.22;
    ctx.fillStyle='#dce6ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});
  ctx.globalAlpha=1;

  // slide: 0=เต็มจอ · 1=ลงครึ่งล่าง+มี epicycle · ตอนจบ(seg10) เลื่อนกลับขึ้นกลาง=หน้ายิ้มเต็มเป็นภาพจบ
  const slide=sstep(interpolate(frame,[SLIDE_FROM,SLIDE_TO,BACK_FROM,BACK_TO],[0,1,1,0],
    {extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
  const s=lerp(1,0.46,slide);
  const tcx=lerp(BC[0],BMC[0],slide), tcy=lerp(BC[1],BMC[1],slide);
  const TP=([x,y])=>[tcx+(x-BC[0])*s, tcy+(y-BC[1])*s];
  const tw=1+0.06*Math.sin(frame*0.10);

  drawEpicycle(ctx,frame,slide,sky);

  // หน้ายิ้ม — ขนาด "ตามที่เห็นจริง": จันทร์จานใหญ่ · ศุกร์สว่างสุด · พฤหัสรองลงมา
  const [vx,vy]=TP(VENUS),[jx,jy]=TP(JUP),[mx,my]=TP(MOON), mr=MR*s;
  planet(ctx,vx,vy,7*tw,'rgba(255,248,225,1)',5);      // ศุกร์ สว่างสุด
  planet(ctx,jx,jy,4.8*tw,'rgba(255,232,185,1)',4);    // พฤหัส รองลงมา
  crescent(ctx,mx,my,mr,sky);                          // จันทร์ จานใหญ่
  const lab=clampI(frame,T.SEG[1].from,T.SEG[1].from+15,SLIDE_FROM-5,SLIDE_FROM)*0.85;
  if(lab>0.02){ctx.globalAlpha=lab;
    label(ctx,'ศุกร์',vx,vy+18,'rgba(255,245,215,.9)',22,600);
    label(ctx,'พฤหัส',jx,jy+16,'rgba(255,230,180,.85)',22,600);
    label(ctx,'จันทร์',mx,my+mr+10,'rgba(223,231,255,.9)',22,600);
    ctx.globalAlpha=1;}

  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12;
  ctx.fillStyle='#fff';ctx.font='800 64px sans-serif';ctx.fillText('จันทร์ยิ้ม',W/2,96);
  ctx.shadowBlur=0;
}

export function SmileyFace(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const fade=interpolate(frame,[0,15,T.DURATION-15,T.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#040406'}}>
    <AbsoluteFill style={{opacity:fade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={T} pos="top"/>
      <Credit timing={T} label="based on" source="CONJUNCTION" sub="Moon · Venus · Jupiter · มิ.ย. ๒๕๖๙"/>
    </AbsoluteFill>
    <Narration timing={T} voDir="vo-smiley"/>
    <Music timing={T} music="audio/lunar-bgm-clip.mp3"/>
  </AbsoluteFill>);
}
