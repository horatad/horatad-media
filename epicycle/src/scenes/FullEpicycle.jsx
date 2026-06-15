import {useCurrentFrame,AbsoluteFill} from 'remotion';
import {useRef,useLayoutEffect} from 'react';
import {PLANETS,gP,isRetro} from '../physics.js';

const W=1080,H=1080,SPEED=14;
const ZS=["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS=Array.from({length:220},(_,i)=>({
  x:(Math.sin(i*127.1)*.5+.5),y:(Math.sin(i*311.7)*.5+.5),
  r:i%9===0?1.3:i%3===0?.7:.35,tw:i*0.41
}));

function draw(canvas,frame,hideHeadline,speed,hideRetro,outerScale,innerScale,zodiacScale){
  const ctx=canvas.getContext('2d');
  const f=frame*(speed||SPEED);
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
    ctx.font=500+' '+Math.max(11,Math.round(13*sc*(zodiacScale||1)))+'px sans-serif';
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
    const x=cx+r.x*sc,y=cy+r.y*sc;
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
      ctx.beginPath();ctx.arc(dfx,dfy,p.epiR*sc,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(dfx,dfy);ctx.lineTo(x,y);
      ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.1;ctx.stroke();
    }else if(p.kind==='inner'){
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(x,y);
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.9;ctx.stroke();
      ctx.beginPath();ctx.arc(sx,sy,p.epiR*sc,0,Math.PI*2);
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
    if(retro&&p.kind!=='simple'&&!hideRetro){
      const pulse=.5+.5*Math.sin(f*.002);
      ctx.beginPath();ctx.arc(x,y,eSize*(.7+pulse*.15),0,Math.PI*2);
      ctx.strokeStyle='rgba(255,80,80,'+(0.3+pulse*0.2)+')';ctx.lineWidth=.8;
      ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    }
    const psz=eSize*(p.kind==='outer'?(outerScale||1):(innerScale||1));  // วงนอก/วงในขยาย font แยกได้
    ctx.shadowColor=p.glow;ctx.shadowBlur=12;
    ctx.fillStyle=p.col;
    ctx.font='bold '+psz+'px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,x,y);
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    if(retro&&p.kind!=='simple'&&!hideRetro){
      ctx.fillStyle='#ff6666';ctx.font=Math.max(10,Math.round(11*sc))+'px serif';
      ctx.textBaseline='bottom';ctx.fillText('℞',x,y-eSize*.9);
    }
  });

  // Headline — ซ่อนได้ผ่าน hideHeadline (เช่นใน Shorts60 ที่มี text overlay เป็นหลัก)
  if(!hideHeadline){
    // TOP-LEFT
    ctx.textAlign='left';
    ctx.fillStyle='#e8d08a';
    ctx.font='700 30px Georgia,serif';
    ctx.fillText('Simplified',36,56);
    ctx.fillText('Ptolemaic',36,90);
    ctx.fillStyle='rgba(230,208,138,0.75)';
    ctx.font='600 23px Georgia,serif';
    ctx.fillText('Geocentric',36,124);
    ctx.fillText('Model',36,151);
    // TOP-RIGHT
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
}

export function FullEpicycle({hideHeadline,speed,hideRetro,outerScale,innerScale,zodiacScale}={}){
  const frame=useCurrentFrame();
  const ref=useRef(null);
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const c=ref.current;c.width=W;c.height=H;draw(c,frame,hideHeadline,speed,hideRetro,outerScale,innerScale,zodiacScale);
  },[frame,hideHeadline,speed,hideRetro,outerScale,innerScale,zodiacScale]);
  return(
    <AbsoluteFill style={{background:'#010814'}}>
      <canvas ref={ref} style={{width:W,height:H,position:'absolute'}}/>
    </AbsoluteFill>
  );
}