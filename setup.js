// setup.js — run with: node setup.js
// สร้างไฟล์ทั้งหมดสำหรับ epicycle Remotion project
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');
const scenes = path.join(src, 'scenes');
if (!fs.existsSync(scenes)) fs.mkdirSync(scenes, { recursive: true });

// ─── physics.js ───────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src, 'physics.js'), `
export const SS = 0.28;
export const S0 = -90;

export const PLANETS = [
  {id:"moon",   n:"๒",th:"จันทร์", col:"#FFE566",glow:"#AA8800",defR:22, epiR:4,  dS:3.743,  eS:0,    sz:3.5,kind:"simple"},
  {id:"mercury",n:"๔",th:"พุธ",    col:"#55DD55",glow:"#227722",defR:36, epiR:17, dS:0.28,   eS:1.163,sz:3.2,kind:"inner"},
  {id:"venus",  n:"๖",th:"ศุกร์",  col:"#55BBFF",glow:"#0055BB",defR:36, epiR:26, dS:0.28,   eS:0.455,sz:4,  kind:"inner"},
  {id:"sun",    n:"๑",th:"อาทิตย์",col:"#FF5533",glow:"#CC2200",defR:36, epiR:0,  dS:0.28,   eS:0,    sz:9,  kind:"simple"},
  {id:"mars",   n:"๓",th:"อังคาร", col:"#FF7799",glow:"#AA1144",defR:105,epiR:69, dS:0.14887,eS:0,    sz:4,  kind:"outer"},
  {id:"jupiter",n:"๕",th:"พฤหัส", col:"#FFAA44",glow:"#AA5500",defR:215,epiR:41, dS:0.02361,eS:0,    sz:5.2,kind:"outer"},
  {id:"saturn", n:"๗",th:"เสาร์",  col:"#CC88FF",glow:"#7700CC",defR:287,epiR:31, dS:0.00951,eS:0,    sz:5.2,kind:"outer"},
];

const tr = (d) => d * Math.PI / 180;
const sunA = (f) => tr(S0 - SS * f);

export function gP(p, f) {
  const sa = sunA(f);
  let da, ea;
  if      (p.kind === "inner") { da = sa; ea = tr(S0 - p.eS * f); }
  else if (p.kind === "outer") { da = tr(S0 - p.dS * f); ea = sa; }
  else                         { da = tr(S0 - p.dS * f); ea = 0; }
  const dx = p.defR * Math.cos(da), dy = p.defR * Math.sin(da);
  const ex = p.epiR > 0 ? p.epiR * Math.cos(ea) : 0;
  const ey = p.epiR > 0 ? p.epiR * Math.sin(ea) : 0;
  return { x: dx+ex, y: dy+ey, dx, dy };
}

export function isRetro(p, f) {
  if (p.kind === "simple") return false;
  const sa = sunA(f);
  let rx, ry, vx, vy;
  if (p.kind === "inner") {
    const ea = tr(S0 - p.eS * f);
    rx = p.defR*Math.cos(sa) + p.epiR*Math.cos(ea);
    ry = p.defR*Math.sin(sa) + p.epiR*Math.sin(ea);
    vx = p.defR*SS*Math.sin(sa) + p.epiR*p.eS*Math.sin(ea);
    vy = -p.defR*SS*Math.cos(sa) - p.epiR*p.eS*Math.cos(ea);
  } else {
    const da = tr(S0 - p.dS * f);
    rx = p.defR*Math.cos(da) + p.epiR*Math.cos(sa);
    ry = p.defR*Math.sin(da) + p.epiR*Math.sin(sa);
    vx = p.defR*p.dS*Math.sin(da) + p.epiR*SS*Math.sin(sa);
    vy = -p.defR*p.dS*Math.cos(da) - p.epiR*SS*Math.cos(sa);
  }
  return (rx * vy - ry * vx) > 0;
}

export function getPhase(vx, vy, sx, sy, cx, cy) {
  const veX=cx-vx, veY=cy-vy, vsX=sx-vx, vsY=sy-vy;
  const dve=Math.hypot(veX,veY), dvs=Math.hypot(vsX,vsY);
  if (dve<0.01||dvs<0.01) return {k:0.5, litAngle:0};
  const cosA=(veX*vsX+veY*vsY)/(dve*dvs);
  return { k:(1+Math.max(-1,Math.min(1,cosA)))/2, litAngle:Math.atan2(sy-cy,sx-cx) };
}
`.trim(), 'utf8');
console.log('✓ physics.js');

// ─── scenes/MarsRetrograde.jsx ────────────────────────────────────────────────
fs.writeFileSync(path.join(scenes, 'MarsRetrograde.jsx'), `
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { useRef, useEffect, useMemo } from 'react';
import { PLANETS, gP, isRetro } from '../physics.js';

const W = 1080, H = 1080, SPEED = 20;

function drawScene(canvas, frame) {
  const ctx = canvas.getContext('2d');
  const simF = frame * SPEED;
  const cx = W/2, cy = H/2, sc = Math.min(W,H)/780;

  ctx.fillStyle = '#010814'; ctx.fillRect(0,0,W,H);

  // Stars
  for (let i=0;i<180;i++){
    const x=(Math.sin(i*127.1)*0.5+0.5)*W, y=(Math.sin(i*311.7)*0.5+0.5)*H;
    const r=i%7===0?1.1:0.4, a=0.1+Math.sin(i+frame*0.02)*0.15+0.15;
    ctx.globalAlpha=a; ctx.fillStyle='#aaccff';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  // Zodiac ring
  const zO=338*sc, zI=316*sc;
  const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
  ctx.beginPath(); ctx.arc(cx,cy,zO,0,Math.PI*2); ctx.arc(cx,cy,zI,0,Math.PI*2);
  ctx.fillStyle='rgba(8,12,40,0.75)'; ctx.fill('evenodd');
  ZS.forEach((s,i)=>{
    const am=(-i*30-15)*Math.PI/180-Math.PI/2;
    ctx.save(); ctx.translate(cx+(zI+zO)/2*Math.cos(am),cy+(zI+zO)/2*Math.sin(am));
    ctx.rotate(am+Math.PI/2);
    ctx.fillStyle=\`hsl(\${240+i*8},50%,62%)\`; ctx.font=\`\${Math.max(10,12*sc)}px sans-serif\`;
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(s,0,0);
    ctx.restore();
  });

  // Mars trail
  const mars = PLANETS.find(p=>p.id==='mars');
  const pts=[];
  for(let f=Math.max(0,simF-3000);f<=simF;f+=4){
    const r=gP(mars,f); pts.push({x:cx+r.x*sc,y:cy+r.y*sc});
  }
  if(pts.length>1){
    ctx.strokeStyle='#FF7799bb'; ctx.lineWidth=0.9;
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
  }

  // Mars deferent
  ctx.beginPath(); ctx.arc(cx,cy,mars.defR*sc,0,Math.PI*2);
  ctx.strokeStyle='#FF779912'; ctx.lineWidth=0.4; ctx.setLineDash([2,8]); ctx.stroke(); ctx.setLineDash([]);

  // Earth
  const eR=9*sc;
  ctx.shadowColor='#aaddff'; ctx.shadowBlur=18;
  ctx.beginPath(); ctx.arc(cx,cy,eR,0,Math.PI*2);
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg.addColorStop(0,'#fff'); eg.addColorStop(1,'#8bbfff');
  ctx.fillStyle=eg; ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='rgba(180,210,255,.7)'; ctx.font=\`500 \${Math.max(7,8*sc)}px sans-serif\`;
  ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('โลก',cx,cy+eR+3);

  // Mars planet
  const mp=gP(mars,simF);
  const mx=cx+mp.x*sc, my=cy+mp.y*sc, mr=mars.sz*sc;
  const retro=isRetro(mars,simF);
  if(retro){
    const pulse=0.5+0.5*Math.sin(frame*0.2);
    ctx.beginPath(); ctx.arc(mx,my,mr*(2.2+pulse*.5),0,Math.PI*2);
    ctx.strokeStyle=\`rgba(255,80,80,\${0.3+pulse*.2})\`; ctx.lineWidth=sc;
    ctx.setLineDash([2*sc,2.5*sc]); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.shadowColor='#AA1144'; ctx.shadowBlur=14;
  const pd=ctx.createRadialGradient(mx-mr*.3,my-mr*.3,0,mx,my,mr);
  pd.addColorStop(0,'#FF7799'); pd.addColorStop(1,'#AA114499');
  ctx.beginPath(); ctx.arc(mx,my,mr,0,Math.PI*2); ctx.fillStyle=pd; ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font=\`bold \${Math.max(7,mr*1.2)}px sans-serif\`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('๓',mx,my);
  if(retro){ ctx.fillStyle='#ff7070'; ctx.font=\`\${Math.max(9,11*sc)}px serif\`; ctx.textBaseline='bottom'; ctx.fillText('℞',mx,my-mr*2.5); }
}

export function MarsRetrograde() {
  const frame = useCurrentFrame();
  const ref = useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const c=ref.current; c.width=W; c.height=H; drawScene(c,frame);
  }, [frame]);

  const simF=frame*SPEED;
  const mars=PLANETS.find(p=>p.id==='mars');
  let loops=0, was=false;
  for(let f=0;f<=simF;f+=10){ const r=isRetro(mars,f); if(r&&!was)loops++; was=r; }
  const retro=isRetro(mars,simF);
  const days=Math.round(simF*0.284).toLocaleString();
  const titleOp=interpolate(frame,[0,25],[0,1],{extrapolateRight:'clamp'});

  return (
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
      <div style={{position:'absolute',top:'7%',width:'100%',textAlign:'center',opacity:titleOp}}>
        <div style={{fontFamily:'serif',fontSize:26,letterSpacing:4,color:'#c8a96e'}}>MARS RETROGRADE</div>
        <div style={{fontSize:15,color:'rgba(255,255,255,.5)',marginTop:6}}>กลีบดอกไม้จาก retrograde loop</div>
      </div>
      <div style={{position:'absolute',bottom:'11%',right:'8%',textAlign:'right'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,.25)',letterSpacing:1}}>RETROGRADE LOOPS</div>
        <div style={{fontSize:42,fontWeight:700,color:'#FF7799',lineHeight:1.1}}>{loops}</div>
      </div>
      {retro&&<div style={{position:'absolute',top:'13%',right:'8%',background:'rgba(255,80,80,.15)',border:'1px solid rgba(255,80,80,.4)',borderRadius:6,padding:'6px 14px',fontSize:13,color:'#ff8888'}}>℞ ถอยหลัง</div>}
      <div style={{position:'absolute',bottom:'11%',left:'8%'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',letterSpacing:1}}>วันที่ผ่านมา</div>
        <div style={{fontSize:24,color:'rgba(255,255,255,.5)'}}>{days}</div>
      </div>
    </AbsoluteFill>
  );
}
`.trim(), 'utf8');
console.log('✓ scenes/MarsRetrograde.jsx');

// ─── Root.jsx ─────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src, 'Root.jsx'), `
import { Composition } from 'remotion';
import { MarsRetrograde } from './scenes/MarsRetrograde.jsx';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="MarsRetrograde"
        component={MarsRetrograde}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
}
`.trim(), 'utf8');
console.log('✓ Root.jsx');

// ─── index.js ─────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(src, 'index.js'), `
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root.jsx';
registerRoot(RemotionRoot);
`.trim(), 'utf8');
console.log('✓ index.js');

console.log('\n✅ Setup complete! Run: npm run dev');
