import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as T from '../timing-smiley.js';

// ── "จันทร์ยิ้ม" (Shorts 1080×1920) เวอร์ชันเต็ม ──
// ภาพท้องฟ้ากลางคืน: ศุกร์+พฤหัส = ตา · จันทร์เสี้ยวหงาย = ปาก
// ช่วง REVEAL (seg4–6): overlay โลก+เส้นเล็ง+ระยะจริง เฉลย "ห่างกันมหาศาล แค่ทิศเดียวกัน"
const W=1080,H=1920;
const STARS=Array.from({length:90},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5)*0.5,
  r:i%13===0?1.1:0.6, tw:i*0.41
}));
const VENUS=[442,805], JUP=[652,838], MOON=[548,1095], MR=78;

function planet(ctx,x,y,coreR,col){
  ctx.save();
  ctx.filter='blur(10px)';ctx.globalAlpha=0.45;ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(x,y,coreR*4,0,7);ctx.fill();
  ctx.filter='blur(3px)';ctx.globalAlpha=0.8;
  ctx.beginPath();ctx.arc(x,y,coreR*1.7,0,7);ctx.fill();
  ctx.filter='none';ctx.globalAlpha=1;
  ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.arc(x,y,coreR,0,7);ctx.fill();
  ctx.restore();
}
function realMoon(ctx,x,y,r,sky){
  const off=r*0.60;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.filter='blur(12px)';
  ctx.fillStyle='rgba(220,228,245,0.11)';
  ctx.beginPath();ctx.arc(x,y+r*0.5,r*0.7,0,7);ctx.fill();
  ctx.filter='none';ctx.restore();
  ctx.save();
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
  const lit=ctx.createLinearGradient(0,y+r,0,y-r*0.2);
  lit.addColorStop(0,'#fefaee');lit.addColorStop(0.7,'#ece4cf');lit.addColorStop(1,'#cfc8b2');
  ctx.fillStyle=lit;ctx.fillRect(x-r,y-r,2*r,2*r);
  ctx.fillStyle=sky;
  ctx.beginPath();ctx.arc(x,y-off,r,0,7);ctx.fill();
  ctx.restore();
}
function label(ctx,t,x,y,col,size,w){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText(t,x,y);
}
const clampI=(f,a,b,c,d)=>interpolate(f,[a,b,c,d],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  // ── ท้องฟ้ากลางคืน ดำ/ดำเทา ──
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0.00,'#040406');sky.addColorStop(0.55,'#0a0b11');sky.addColorStop(1,'#15161e');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.02))*.26;
    ctx.fillStyle='#dce6ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});
  ctx.globalAlpha=1;
  const tw=1+0.06*Math.sin(frame*0.10);

  // ── ช่วงเฉลย: โลก + เส้นเล็ง + ระยะจริง ──
  const rv=(frame<T.REVEAL_FROM||frame>T.REVEAL_TO)?0:
    clampI(frame,T.REVEAL_FROM,T.REVEAL_FROM+20,T.REVEAL_TO-20,T.REVEAL_TO);
  if(rv>0){
    const ex=540,ey=1648;
    [[VENUS,'rgba(255,242,192,'],[JUP,'rgba(255,224,160,'],[MOON,'rgba(223,231,255,']].forEach(([p,c])=>{
      ctx.strokeStyle=c+(0.55*rv)+')';ctx.lineWidth=2;ctx.setLineDash([6,8]);
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.setLineDash([]);
    });
    ctx.globalAlpha=rv;
    const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,22);
    eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
    ctx.beginPath();ctx.arc(ex,ey,22,0,7);ctx.fillStyle=eg;ctx.fill();
    label(ctx,'โลก (ตาเรา)',ex,ey+28,'rgba(200,220,255,.95)',24,600);
    label(ctx,'จันทร์ ~384,000 กม.',MOON[0]+165,MOON[1]-6,'#dfe7ff',22,700);
    label(ctx,'ศุกร์ ~80 ล้าน กม.',VENUS[0]-150,VENUS[1]-44,'#fff2c0',22,700);
    label(ctx,'พฤหัส ~900 ล้าน กม.',JUP[0]+40,JUP[1]-46,'#ffe0a0',22,700);
    ctx.globalAlpha=1;
  }

  // ── 3 ดวง (สมจริง) ──
  planet(ctx,VENUS[0],VENUS[1],4.6*tw,'rgba(255,248,225,1)');
  planet(ctx,JUP[0],JUP[1],3.4*tw,'rgba(255,232,185,1)');
  realMoon(ctx,MOON[0],MOON[1],MR,sky);

  // ป้ายชื่อเล็ก (โผล่หลัง intro · จางช่วง reveal)
  const lab=clampI(frame,T.SEG[1].from,T.SEG[1].from+15,T.REVEAL_FROM-10,T.REVEAL_FROM)*0.85
            + (rv>0?0:0);
  if(lab>0.02){ctx.globalAlpha=lab;
    label(ctx,'ศุกร์',VENUS[0],VENUS[1]+16,'rgba(255,245,215,.9)',22,600);
    label(ctx,'พฤหัส',JUP[0],JUP[1]+14,'rgba(255,230,180,.85)',22,600);
    label(ctx,'จันทร์',MOON[0],MOON[1]+MR+10,'rgba(223,231,255,.9)',22,600);
    ctx.globalAlpha=1;}

  // ── หัวข้อบนสุด (เด่นช่วง intro แล้วคงไว้เล็ก) ──
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,0.5)';ctx.shadowBlur=12;
  ctx.fillStyle='#fff';ctx.font='800 70px sans-serif';ctx.fillText('จันทร์ยิ้ม',W/2,158);
  const subOp=clampI(frame,0,20,T.SEG[1].from,T.SEG[1].from+20);
  if(subOp>0.02){ctx.globalAlpha=subOp;ctx.fillStyle='rgba(255,242,215,0.92)';ctx.font='600 29px sans-serif';
    ctx.fillText('ศุกร์ + พฤหัส = ตา · จันทร์เสี้ยว = ปาก',W/2,206);ctx.globalAlpha=1;}
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
      <Caption timing={T}/>
      <Credit timing={T} label="based on" source="CONJUNCTION" sub="Moon · Venus · Jupiter · มิ.ย. ๒๕๖๙"/>
    </AbsoluteFill>
    <Narration timing={T} voDir="vo-smiley"/>
    <Music timing={T} music="audio/lunar-bgm-clip.mp3"/>
  </AbsoluteFill>);
}
