// setup4.js — Render #3 FullEpicycle + Render #4 AllTrails
// SPEED=14, 2700 frames @ 30fps = 90s (ครบรอบ ๗)
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, 'src');
const scenes = path.join(src, 'scenes');
if (!fs.existsSync(scenes)) fs.mkdirSync(scenes, {recursive:true});

// ─── Root.jsx ─────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src,'Root.jsx'),
`import {Composition} from 'remotion';
import {FullEpicycle} from './scenes/FullEpicycle.jsx';
import {AllTrails} from './scenes/AllTrails.jsx';
const FRAMES=2700;
export const RemotionRoot=()=>(
  <>
    <Composition id="FullEpicycle" component={FullEpicycle} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="AllTrails" component={AllTrails} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
  </>
);`,'utf8');
console.log('✓ Root.jsx');

// ─── index.js ─────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src,'index.js'),
`import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root.jsx';
registerRoot(RemotionRoot);`,'utf8');
console.log('✓ index.js');

// ─── physics.js ───────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src,'physics.js'),
`export const SS=0.28,S0=-90;
export const PLANETS=[
  {id:"moon",   n:"๒",th:"จันทร์", col:"#FFE566",glow:"#AA8800",defR:22, epiR:4,         dS:3.743,  eS:0,    sz:3.5,kind:"simple"},
  {id:"mercury",n:"๔",th:"พุธ",    col:"#55DD55",glow:"#227722",defR:36, epiR:17,vizR:30, dS:0.28,   eS:1.163,sz:3.2,kind:"inner"},
  {id:"venus",  n:"๖",th:"ศุกร์",  col:"#55BBFF",glow:"#0055BB",defR:36, epiR:26,vizR:58, dS:0.28,   eS:0.455,sz:4,  kind:"inner"},
  {id:"sun",    n:"๑",th:"อาทิตย์",col:"#FF5533",glow:"#CC2200",defR:36, epiR:0,          dS:0.28,   eS:0,    sz:9,  kind:"simple"},
  {id:"mars",   n:"๓",th:"อังคาร", col:"#FF7799",glow:"#AA1144",defR:105,epiR:69,vizR:58, dS:0.14887,eS:0,    sz:4,  kind:"outer"},
  {id:"jupiter",n:"๕",th:"พฤหัส", col:"#FFAA44",glow:"#AA5500",defR:215,epiR:41,vizR:58, dS:0.02361,eS:0,    sz:5.2,kind:"outer"},
  {id:"saturn", n:"๗",th:"เสาร์",  col:"#CC88FF",glow:"#7700CC",defR:287,epiR:31,vizR:58, dS:0.00951,eS:0,    sz:5.2,kind:"outer"},
];
const tr=d=>d*Math.PI/180;
const sunA=f=>tr(S0-SS*f);
export function gP(p,f){
  const sa=sunA(f);let da,ea;
  if(p.kind==="inner"){da=sa;ea=tr(S0-p.eS*f);}
  else if(p.kind==="outer"){da=tr(S0-p.dS*f);ea=sa;}
  else{da=tr(S0-p.dS*f);ea=0;}
  const dx=p.defR*Math.cos(da),dy=p.defR*Math.sin(da);
  const ex=p.epiR>0?p.epiR*Math.cos(ea):0,ey=p.epiR>0?p.epiR*Math.sin(ea):0;
  return{x:dx+ex,y:dy+ey,dx,dy};
}
export function isRetro(p,f){
  if(p.kind==="simple")return false;
  const sa=sunA(f);let rx,ry,vx,vy;
  if(p.kind==="inner"){
    const ea=tr(S0-p.eS*f);
    rx=p.defR*Math.cos(sa)+p.epiR*Math.cos(ea);ry=p.defR*Math.sin(sa)+p.epiR*Math.sin(ea);
    vx=p.defR*0.28*Math.sin(sa)+p.epiR*p.eS*Math.sin(ea);vy=-p.defR*0.28*Math.cos(sa)-p.epiR*p.eS*Math.cos(ea);
  }else{
    const da=tr(S0-p.dS*f);
    rx=p.defR*Math.cos(da)+p.epiR*Math.cos(sa);ry=p.defR*Math.sin(da)+p.epiR*Math.sin(sa);
    vx=p.defR*p.dS*Math.sin(da)+p.epiR*0.28*Math.sin(sa);vy=-p.defR*p.dS*Math.cos(da)-p.epiR*0.28*Math.cos(sa);
  }
  return(rx*vy-ry*vx)>0;
}`,'utf8');
console.log('✓ physics.js');

// ─── scenes/FullEpicycle.jsx ──────────────────────────────────────────────────
fs.writeFileSync(path.join(scenes,'FullEpicycle.jsx'),
`import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useEffect} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';

const W=1080,H=1080,SPEED=14;
const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

function draw(canvas,frame){
  const ctx=canvas.getContext('2d');
  const f=frame*SPEED;
  const cx=W/2,cy=H/2,sc=Math.min(W,H)/780;

  // Background
  ctx.fillStyle='#010814';ctx.fillRect(0,0,W,H);
  const vg=ctx.createRadialGradient(cx,cy,W*.25,cx,cy,W*.65);
  vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,10,.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  // Stars
  STARS.forEach((s,i)=>{
    ctx.globalAlpha=.07+Math.abs(Math.sin(s.tw+frame*.015))*.28;
    ctx.fillStyle='#aaccff';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();
  });ctx.globalAlpha=1;

  // Zodiac
  const zO=338*sc,zI=316*sc;
  ctx.beginPath();ctx.arc(cx,cy,zO,0,Math.PI*2);ctx.arc(cx,cy,zI,0,Math.PI*2);
  ctx.fillStyle='rgba(8,12,40,.75)';ctx.fill('evenodd');
  ZS.forEach((s,i)=>{
    const a0=(-i*30-90)*Math.PI/180,a1=(-(i+1)*30-90)*Math.PI/180,am=(a0+a1)/2;
    ctx.beginPath();ctx.moveTo(cx+zI*Math.cos(a0),cy+zI*Math.sin(a0));
    ctx.lineTo(cx+zO*Math.cos(a0),cy+zO*Math.sin(a0));
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.4;ctx.stroke();
    ctx.save();ctx.translate(cx+(zI+zO)/2*Math.cos(am),cy+(zI+zO)/2*Math.sin(am));
    ctx.rotate(am+Math.PI/2);
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.font=500+' '+Math.max(11,Math.round(13*sc))+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,0);
    ctx.restore();
  });

  // Positions
  const sr=gP(PLANETS.find(p=>p.id==='sun'),f);
  const sx=cx+sr.x*sc,sy=cy+sr.y*sc;
  const pos={};
  PLANETS.forEach(p=>{
    const r=gP(p,f);
    const dfx=cx+r.dx*sc,dfy=cy+r.dy*sc;
    let x=cx+r.x*sc,y=cy+r.y*sc;
    if(p.vizR&&p.epiR>0){
      if(p.kind==='outer'){const ang=Math.atan2(y-dfy,x-dfx);x=dfx+p.vizR*sc*Math.cos(ang);y=dfy+p.vizR*sc*Math.sin(ang);}
      else if(p.kind==='inner'){const ang=Math.atan2(y-sy,x-sx);x=sx+p.vizR*sc*Math.cos(ang);y=sy+p.vizR*sc*Math.sin(ang);}
    }
    pos[p.id]={x,y,dfx,dfy};
  });

  // Deferent circles
  PLANETS.filter(p=>p.kind!=='inner').forEach(p=>{
    ctx.beginPath();ctx.arc(cx,cy,p.defR*sc,0,Math.PI*2);
    ctx.strokeStyle=p.col+'12';ctx.lineWidth=.4;ctx.setLineDash([2,8]);ctx.stroke();ctx.setLineDash([]);
  });

  // Arms + Epicycle circles
  PLANETS.forEach(p=>{
    const{x,y,dfx,dfy}=pos[p.id];
    if(p.kind==='outer'){
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(dfx,dfy);
      ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=.7;ctx.setLineDash([4,5]);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(dfx,dfy,(p.vizR||p.epiR)*sc,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(dfx,dfy);ctx.lineTo(x,y);
      ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.1;ctx.stroke();
    }else if(p.kind==='inner'){
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(x,y);
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9;ctx.stroke();
      ctx.beginPath();ctx.arc(sx,sy,(p.vizR||p.epiR)*sc,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.8;ctx.setLineDash([2,4]);ctx.stroke();ctx.setLineDash([]);
    }else if(p.kind==='simple'&&p.id!=='sun'){
      // Moon: show only near full moon
      const mx=pos['moon'].x,my=pos['moon'].y;
      const ma=Math.atan2(my-cy,mx-cx),sa2=Math.atan2(sy-cy,sx-cx);
      let diff=Math.abs(ma-sa2)*180/Math.PI;if(diff>180)diff=360-diff;
      if(Math.abs(diff-180)>40)return;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
      ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.6;ctx.stroke();
    }
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
  PLANETS.forEach(p=>{
    const{x,y}=pos[p.id];const retro=isRetro(p,f);
    // Moon opacity — full moon only
    if(p.id==='moon'){
      const ma=Math.atan2(y-cy,x-cx),sa2=Math.atan2(sy-cy,sx-cx);
      let diff=Math.abs(ma-sa2)*180/Math.PI;if(diff>180)diff=360-diff;
      const op=Math.max(0,1-Math.abs(diff-180)/40);
      if(op<0.02)return;
      ctx.globalAlpha=op;
    }
    if(retro&&p.kind!=='simple'){
      const pulse=.5+.5*Math.sin(f*.002);
      ctx.beginPath();ctx.arc(x,y,eSize*(.7+pulse*.15),0,Math.PI*2);
      ctx.strokeStyle='rgba(255,80,80,'+(0.3+pulse*0.2)+')';ctx.lineWidth=.8;
      ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.shadowColor=p.glow;ctx.shadowBlur=12;
    ctx.fillStyle=p.col;
    ctx.font='bold '+eSize+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,x,y);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    if(retro&&p.kind!=='simple'){
      ctx.fillStyle='#ff6666';ctx.font=Math.max(10,Math.round(11*sc))+'px serif';
      ctx.textBaseline='bottom';ctx.fillText('℞',x,y-eSize*.9);
    }
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
  ctx.fillText('1 Jun 2026',W-36,154);
}

export function FullEpicycle(){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame);
  },[frame]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  );
}`,'utf8');
console.log('✓ scenes/FullEpicycle.jsx');

// ─── scenes/AllTrails.jsx ─────────────────────────────────────────────────────
fs.writeFileSync(path.join(scenes,'AllTrails.jsx'),
`import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useEffect,useMemo} from 'react';
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
    const dfx=cx+r.dx*sc,dfy=cy+r.dy*sc;
    let x=cx+r.x*sc,y=cy+r.y*sc;
    if(p.vizR&&p.epiR>0){
      if(p.kind==='outer'){const ang=Math.atan2(y-dfy,x-dfx);x=dfx+p.vizR*sc*Math.cos(ang);y=dfy+p.vizR*sc*Math.sin(ang);}
      else if(p.kind==='inner'){const ang=Math.atan2(y-syp,x-sxp);x=sxp+p.vizR*sc*Math.cos(ang);y=syp+p.vizR*sc*Math.sin(ang);}
    }
    const retro=isRetro(p,f);
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
  ctx.fillText('1 Jun 2026',W-36,154);
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
  useEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame,trails);
  },[frame,trails]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  );
}`,'utf8');
console.log('✓ scenes/AllTrails.jsx');
console.log('\n✅ Setup complete! Run: npm run dev');
