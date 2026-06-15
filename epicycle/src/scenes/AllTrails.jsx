import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect,useMemo} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';

const W=1080,H=1080,SPEED=14;
const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

function draw(canvas,frame,trails){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const cx=W/2,cy=H/2,sc=Math.min(W,H)/780;

  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.25,cx,cy,W*.65);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  STARS.forEach((s,i)=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  const zO=338*sc,zI=316*sc;
  ctx.beginPath();ctx.arc(cx,cy,zO,0,Math.PI*2);ctx.arc(cx,cy,zI,0,Math.PI*2);
  ctx.fillStyle='rgba(8,12,40,.75)';ctx.fill('evenodd');
  ZS.forEach((s,i)=>{
    const am=((-i*30-15)-90)*Math.PI/180;
    const a0=(-i*30-90)*Math.PI/180;
    ctx.beginPath();ctx.moveTo(cx+zI*Math.cos(a0),cy+zI*Math.sin(a0));
    ctx.lineTo(cx+zO*Math.cos(a0),cy+zO*Math.sin(a0));
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.4;ctx.stroke();
    ctx.save();ctx.translate(cx+(zI+zO)/2*Math.cos(am),cy+(zI+zO)/2*Math.sin(am));
    ctx.rotate(am+Math.PI/2);
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.font='500 '+Math.max(11,Math.round(13*sc))+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);
    ctx.restore();
  });

  // Trails
  PLANETS.forEach(p=>{
    const t=trails[p.id];if(!t||t.length<2)return;
    ctx.strokeStyle=p.col+'99';ctx.lineWidth=.85;
    ctx.beginPath();ctx.moveTo(cx+t[0].px*sc,cy+t[0].py*sc);
    t.forEach(pt=>ctx.lineTo(cx+pt.px*sc,cy+pt.py*sc));
    ctx.stroke();
  });

  // Earth
  const eR=10*sc;
  ctx.shadowColor='#aaddff';ctx.shadowBlur=22;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#fff');eg.addColorStop(1,'#8bbfff');
  ctx.beginPath();ctx.arc(cx,cy,eR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.7)';
  ctx.font='600 '+Math.max(8,Math.round(9*sc))+'px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('โลก',cx,cy+eR+3);

  // Planets
  const eSize=18*sc;
  const sr=gP(PLANETS.find(p=>p.id==='sun'),f);
  const sxp=cx+sr.x*sc,syp=cy+sr.y*sc;
  PLANETS.forEach(p=>{
    const r=gP(p,f);
    const x=cx+r.x*sc,y=cy+r.y*sc;
    if(p.id==='moon'){
      const ma=Math.atan2(y-cy,x-cx),sa2=Math.atan2(syp-cy,sxp-cx);
      let diff=Math.abs(ma-sa2)*180/Math.PI;if(diff>180)diff=360-diff;
      const op=Math.max(0,1-Math.abs(diff-180)/40);
      if(op<0.02)return;
      ctx.globalAlpha=op;
    }
    ctx.shadowColor=p.glow;ctx.shadowBlur=12;
    ctx.fillStyle=p.col;
    ctx.font='bold '+eSize+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,x,y);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
  });

  // Headline TOP-LEFT (fixed pixel positions)
  ctx.textAlign='left';
  ctx.fillStyle='#e8d08a';
  ctx.font='700 30px Georgia,serif';
  ctx.fillText('Simplified',36,56);
  ctx.fillText('Ptolemaic',36,90);
  ctx.fillStyle='rgba(230,208,138,0.75)';
  ctx.font='600 23px Georgia,serif';
  ctx.fillText('Geocentric',36,124);
  ctx.fillText('Model',36,151);

  // Headline TOP-RIGHT (fixed pixel positions)
  ctx.textAlign='right';
  ctx.fillStyle='rgba(255,255,255,0.85)';
  ctx.font='400 20px Georgia,serif';
  ctx.fillText('based on',W-36,56);
  ctx.fillText('Almagest',W-36,80);
  ctx.fillStyle='rgba(255,255,255,0.55)';
  ctx.font='400 16px sans-serif';
  ctx.fillText('(~150 AD)',W-36,112);
  ctx.fillText('Horatad created',W-36,133);
  ctx.fillText('9 Jun 2026',W-36,154);
}

export function AllTrails(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  const trails=useMemo(()=>{
    const t={};PLANETS.forEach(p=>{t[p.id]=[];});
    for(let rf=0;rf<=frame;rf++){
      const f=rf*SPEED;
      PLANETS.forEach(p=>{const r=gP(p,f);t[p.id].push({px:r.x,py:r.y});});
    }
    return t;
  },[frame]);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame,trails);
  },[frame,trails]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  );
}