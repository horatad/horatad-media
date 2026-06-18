import {useCurrentFrame,AbsoluteFill,interpolate,Audio,staticFile} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Credit} from '../Credit.jsx';
import * as T from '../timing-smiley.js';

// ── "จันทร์ยิ้ม" (Shorts 1080×1920) ──
// 0–0:15 หน้ายิ้มเต็มจอ → สลายเป็นละอองดาว → epicycle เต็มจอ (เฉพาะดาว · ไม่มีวงโคจร/เส้นเล็ง · จันทร์โคจรเดินหน้า)
// ตอนจบ(seg10): ดาวเคลื่อนมาเรียงเป็นหน้ายิ้มกลางจอ ค้างถึงจบเครดิต · เพลงค่อยเบาลงจนจางหาย
const W=1080,H=1920;
const STARS=Array.from({length:90},(_,i)=>({
  x:Math.sin(i*127.1)*.5+.5, y:(Math.sin(i*311.7)*.5+.5), r:i%13===0?1.1:0.6, tw:i*0.41
}));
const SMILE={venus:[440,830],jupiter:[648,862],moon:[544,1080]}; // ตำแหน่งหน้ายิ้ม (เต็มจอ · ใช้ทั้งต้น+จบ)
const SMILE_ARR=[SMILE.venus,SMILE.jupiter,SMILE.moon];
const MR=82;
const DISS_FROM=T.SEG[3].from, DISS_TO=T.SEG[4].from;  // ~0:15 สลายละอองดาว → epicycle
const EPI=[540,1010];                                  // epicycle เต็มจอ (ศูนย์ค่อนล่างนิด ให้ดาวบนพ้น caption)
const DISP={moon:230,venus:420,jupiter:600};
const RATE={moon:3.743,venus:0.28,jupiter:0.02361};    // rate จริง — 158:12:1
const S0=-90, ESPEED=0.13;
const BACK_FROM=T.SEG[10].from, BACK_TO=T.VO_END;
const PARTICLES=Array.from({length:150},(_,i)=>({
  src:i%3, ang:i*2.39996, sp:0.35+Math.abs(Math.sin(i*7.3))*0.95,
  r:0.6+Math.abs(Math.sin(i*3.1))*1.7, tw:i*0.37
}));
const lerp=(a,b,t)=>a+(b-a)*t, sstep=t=>t*t*(3-2*t);
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const clampI=(f,a,b,c,d)=>interpolate(f,[a,b,c,d],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

function planet(ctx,x,y,coreR,col,bloom,ga){
  ctx.save();ga=ga==null?1:ga;
  ctx.filter='blur(10px)';ctx.globalAlpha=0.5*ga;ctx.fillStyle=col;
  ctx.beginPath();ctx.arc(x,y,coreR*(bloom||4),0,7);ctx.fill();
  ctx.filter='blur(3px)';ctx.globalAlpha=0.85*ga;ctx.beginPath();ctx.arc(x,y,coreR*1.7,0,7);ctx.fill();
  ctx.filter='none';ctx.globalAlpha=ga;
  ctx.fillStyle='#fffdf6';ctx.beginPath();ctx.arc(x,y,coreR,0,7);ctx.fill();
  ctx.restore();
}
function crescent(ctx,x,y,r,sky,ga){
  ctx.save();ctx.globalAlpha=ga==null?1:ga;
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.clip();
  const lit=ctx.createLinearGradient(0,y+r,0,y-r*0.2);
  lit.addColorStop(0,'#fefaee');lit.addColorStop(0.7,'#ece4cf');lit.addColorStop(1,'#cfc8b2');
  ctx.fillStyle=lit;ctx.fillRect(x-r,y-r,2*r,2*r);
  ctx.globalAlpha=1;ctx.fillStyle=sky;ctx.beginPath();ctx.arc(x,y-r*0.60,r,0,7);ctx.fill();
  ctx.restore();
}
function label(ctx,t,x,y,col,size,w,align){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';
  ctx.textAlign=align||'center';ctx.textBaseline='top';ctx.fillText(t,x,y);
}
function drawSmiley(ctx,sky,ga,tw){
  if(ga<=0.01)return;
  planet(ctx,SMILE.venus[0],SMILE.venus[1],7*tw,'rgba(255,248,225,1)',5,ga);
  planet(ctx,SMILE.jupiter[0],SMILE.jupiter[1],4.8*tw,'rgba(255,232,185,1)',4,ga);
  crescent(ctx,SMILE.moon[0],SMILE.moon[1],MR,sky,ga);
}
function efOf(frame){ return Math.max(0,(frame-DISS_TO))*ESPEED; }
const mAng=(id,ef)=>(S0-RATE[id]*ef)*Math.PI/180;
const PLANET_TH={venus:'ศุกร์',jupiter:'พฤหัส'};

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0.00,'#040406');sky.addColorStop(0.55,'#0a0b11');sky.addColorStop(1,'#15161e');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{ctx.globalAlpha=.05+Math.abs(Math.sin(s.tw+frame*.02))*.22;
    ctx.fillStyle='#dce6ff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,7);ctx.fill();});
  ctx.globalAlpha=1;
  const tw=1+0.06*Math.sin(frame*0.10);

  const diss=sstep(interpolate(frame,[DISS_FROM,DISS_TO],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
  const resolve=sstep(interpolate(frame,[BACK_FROM,BACK_TO],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
  const epiA=clampN((diss-0.30)/0.70,0,1)*(1-0); // epicycle ปรากฏหลังเริ่มสลาย

  // หน้ายิ้มต้นคลิป (จางเป็นละอองดาว)
  drawSmiley(ctx,sky,clampN(1-diss*1.7,0,1),tw);

  // ละอองดาว (ช่วงสลาย)
  if(diss>0.001 && diss<0.999){
    PARTICLES.forEach(p=>{const o=SMILE_ARR[p.src];
      const x=o[0]+Math.cos(p.ang)*p.sp*diss*440, y=o[1]+Math.sin(p.ang)*p.sp*diss*440-diss*120;
      ctx.globalAlpha=(1-diss)*(0.35+0.5*Math.abs(Math.sin(p.tw+frame*0.12)));
      ctx.fillStyle='#e6ecff';ctx.beginPath();ctx.arc(x,y,p.r,0,7);ctx.fill();});
    ctx.globalAlpha=1;
  }

  // epicycle เต็มจอ — เฉพาะดาว (ไม่มีวงโคจร/เส้นเล็ง) · ตอนจบ resolve เป็นหน้ายิ้ม
  if(epiA>0.01){
    const ef=efOf(frame),[cx,cy]=EPI;
    const ids=['jupiter','venus','moon'];
    const orbP=id=>{const a=mAng(id,ef);return [cx+Math.cos(a)*DISP[id],cy+Math.sin(a)*DISP[id]];};
    const P=id=>{const o=orbP(id),t=SMILE[id];return [lerp(o[0],t[0],resolve),lerp(o[1],t[1],resolve)];};
    // โลก (จางตอน resolve)
    const eA=epiA*(1-resolve);
    if(eA>0.02){const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,22);
      eg.addColorStop(0,'#dff0ff');eg.addColorStop(1,'#5b8fd6');
      ctx.globalAlpha=eA;ctx.beginPath();ctx.arc(cx,cy,22,0,7);ctx.fillStyle=eg;ctx.fill();ctx.globalAlpha=1;
      label2(ctx,'โลก',cx,cy+26,'rgba(200,220,255,'+(0.9*eA)+')',22,700);}
    ids.forEach(id=>{const [x,y]=P(id);
      if(id==='moon'){crescent(ctx,x,y,lerp(40,MR,resolve),sky,epiA);
        label2(ctx,'จันทร์',x,y+lerp(46,MR+10,resolve),'rgba(223,231,255,'+epiA+')',22,700);}
      else{const big=id==='venus';
        planet(ctx,x,y,lerp(big?12:9,big?7:4.8,resolve),big?'rgba(255,248,225,1)':'rgba(255,232,185,1)',big?5:4,epiA);
        label2(ctx,PLANET_TH[id],x+18,y-12,(big?'rgba(255,245,215,':'rgba(255,224,170,')+epiA+')',22,700,'left');}
    });
  }

  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=12;
  ctx.fillStyle='#fff';ctx.font='800 64px sans-serif';ctx.fillText('จันทร์ยิ้ม',W/2,96);
  ctx.shadowBlur=0;
}
function label2(ctx,t,x,y,col,size,w,align){
  ctx.fillStyle=col;ctx.font=(w||600)+' '+size+'px sans-serif';
  ctx.textAlign=align||'center';ctx.textBaseline='top';ctx.fillText(t,x,y);
}

export function SmileyFace(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const fade=interpolate(frame,[0,15,T.DURATION-15,T.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  // เพลง: intro ดัง → duck ใต้พากย์ → หลังพากย์จบ(0:48) ค่อยเบาลงเรื่อยๆ จนเงียบสนิทท้ายคลิป
  const mvol=interpolate(frame,[0,25,T.INTRO_FRAMES,T.INTRO_FRAMES+20,T.VO_END,T.DURATION],
    [0,0.8,0.8,0.22,0.22,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#040406'}}>
    <AbsoluteFill style={{opacity:fade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={T} pos="top"/>
      <Credit timing={T} label="based on" source="CONJUNCTION" sub="Moon · Venus · Jupiter · มิ.ย. ๒๕๖๙"/>
    </AbsoluteFill>
    <Narration timing={T} voDir="vo-smiley"/>
    <Audio src={staticFile('audio/lunar-bgm-clip.mp3')} loop volume={mvol}/>
  </AbsoluteFill>);
}
