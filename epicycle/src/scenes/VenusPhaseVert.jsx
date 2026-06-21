import {useCurrentFrame,AbsoluteFill,interpolate} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,SS} from '../physics.js';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingVenus from '../timing-venus.js';

// ── VenusPhase แนวตั้ง (Shorts 1080×1920) — re-layout จาก VenusPhase จัตุรัส ──
const W=1080,H=1920,CX=540,CY=800;
const SUN=PLANETS.find(p=>p.id==='sun');
const VENUS=PLANETS.find(p=>p.id==='venus');
const SYNODIC=360/(VENUS.eS-SS);
const SPEED=SYNODIC/480;                                // ≈4.286 (1 รอบ synodic = 16วิ)
const STARS=Array.from({length:300},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.4:i%3===0?.7:.35,tw:i*0.41
}));

function venusPhaseFactor(aDeg){
  const a=Math.min(163.7,aDeg);
  const dm=-1.044e-3*a+3.687e-4*a*a-2.814e-6*a*a*a+8.938e-9*a*a*a*a;
  return Math.pow(10,-0.4*dm);
}
function venusFluxAt(f){
  const sm=gP(SUN,f),vm=gP(VENUS,f);
  const dE2=vm.x*vm.x+vm.y*vm.y;
  const sxv=sm.x-vm.x,syv=sm.y-vm.y,dS2=sxv*sxv+syv*syv;
  const cosA=(sxv*(-vm.x)+syv*(-vm.y))/Math.sqrt(dS2*dE2);
  const aDeg=Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI;
  return venusPhaseFactor(aDeg)/(dE2*dS2);
}
let VENUS_BMAX=0;
for(let f=0;f<SYNODIC;f+=SYNODIC/1000){const b=venusFluxAt(f);if(b>VENUS_BMAX)VENUS_BMAX=b;}

function drawVenusDisk(ctx,x,y,r,cosA,brightAngle){
  ctx.save();
  ctx.translate(x,y);ctx.rotate(brightAngle);
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='rgba(12,22,34,0.32)';ctx.fill();
  ctx.strokeStyle='rgba(130,170,210,0.22)';ctx.lineWidth=1;ctx.stroke();
  const xt=r*cosA;
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
  const cx=CX,cy=CY,sc=W/150;

  ctx.fillStyle='#020a16';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.1,cx,cy,W*.85);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,12,.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  STARS.forEach(s=>{
    ctx.globalAlpha=.06+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  const sm=gP(SUN,f), vm=gP(VENUS,f);
  const sx=cx+sm.x*sc,sy=cy+sm.y*sc;
  const vx=cx+vm.x*sc,vy=cy+vm.y*sc;

  ctx.beginPath();ctx.arc(cx,cy,SUN.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,170,70,0.16)';ctx.lineWidth=1;ctx.setLineDash([3,9]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(sx,sy,VENUS.epiR*sc,0,Math.PI*2);
  ctx.strokeStyle='rgba(120,190,255,0.35)';ctx.lineWidth=1.2;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(sx,sy);
  ctx.strokeStyle='rgba(255,170,70,.4)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(vx,vy);
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(vx,vy);
  ctx.strokeStyle='rgba(120,190,255,.18)';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.stroke();ctx.setLineDash([]);

  // Earth
  const eR=15;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=22;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(cx,cy,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.8)';ctx.font='600 15px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+eR+4);

  // Sun
  const suR=24;
  ctx.shadowColor='#FF7733';ctx.shadowBlur=34;
  const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,suR);
  sg.addColorStop(0,'#FFE7A0');sg.addColorStop(1,'#FF5522');
  ctx.beginPath();ctx.arc(sx,sy,suR,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,210,150,.85)';ctx.font='600 16px sans-serif';
  ctx.textBaseline='top';ctx.fillText('ดวงอาทิตย์',sx,sy+suR+4);

  // ---- ดาวศุกร์: เฟส + ขนาด + ความสว่างสัมพัทธ์จริง ----
  const d=Math.hypot(vm.x,vm.y);
  const r=Math.min(95,800/d);
  const toSun=[sm.x-vm.x,sm.y-vm.y], toEarth=[-vm.x,-vm.y];
  const dS=Math.hypot(toSun[0],toSun[1]);
  const cosA=(toSun[0]*toEarth[0]+toSun[1]*toEarth[1])/(dS*d);
  const a=Math.acos(Math.max(-1,Math.min(1,cosA)));
  const brightAngle=Math.atan2(sy-vy,sx-vx);
  const E=Math.acos(Math.max(-1,Math.min(1,
    (sm.x*vm.x+sm.y*vm.y)/(Math.hypot(sm.x,sm.y)*d))))*180/Math.PI;
  const glare=Math.max(0,Math.min(1,(E-8)/10));
  const rel=Math.min(1,(venusPhaseFactor(a*180/Math.PI)/(d*d*dS*dS))/VENUS_BMAX);
  const glow=rel*glare;

  ctx.beginPath();ctx.arc(vx,vy,2.5,0,Math.PI*2);
  ctx.fillStyle='rgba(190,224,255,.5)';ctx.fill();

  if(glow>0.002){
    const R=r*(2.4+3.0*glow);
    const halo=ctx.createRadialGradient(vx,vy,0,vx,vy,R);
    halo.addColorStop(0,   'rgba(220,240,255,'+(0.90*glow).toFixed(3)+')');
    halo.addColorStop(0.35,'rgba(170,210,255,'+(0.40*glow).toFixed(3)+')');
    halo.addColorStop(1,'transparent');
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(vx,vy,R,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=glare;
  drawVenusDisk(ctx,vx,vy,r,cosA,brightAngle);
  ctx.globalAlpha=1;

  // หัวข้อ (กึ่งกลางบน)
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#bfe0ff';ctx.font='700 56px sans-serif';
  ctx.fillText('ดาวศุกร์',cx,150);
  ctx.fillStyle='rgba(190,224,255,0.72)';ctx.font='600 30px Georgia,serif';
  ctx.fillText('Phases of Venus',cx,196);
}

export function VenusPhaseVert(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{if(!ref.current)return;const c=ref.current;c.width=W;c.height=H;draw(c,frame);},[frame]);
  const loopFade=interpolate(frame,[0,15,timingVenus.DURATION-15,timingVenus.DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return(<AbsoluteFill style={{background:'#020a16'}}>
    <AbsoluteFill style={{opacity:loopFade}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <Caption timing={timingVenus}/>
      <Credit timing={timingVenus} label="based on" source="GALILEO" sub="phases of Venus · 1610"/>
    </AbsoluteFill>
    <Narration timing={timingVenus} voDir="vo-venus"/>
    <Music timing={timingVenus} music="audio/hora-staccato-clip.mp3" gain={1.7} duck={0.30}/>
  </AbsoluteFill>);
}
