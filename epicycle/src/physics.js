export const SS=0.28,S0=-90;
export const PLANETS=[
  {id:"moon",   n:"๒",th:"จันทร์", col:"#FFE566",glow:"#AA8800",defR:22, epiR:4,         dS:3.743,  eS:0,    sz:3.5,kind:"simple"},
  {id:"mercury",n:"๔",th:"พุธ",    col:"#55DD55",glow:"#227722",defR:36, epiR:17, dS:0.28,   eS:1.163,sz:3.2,kind:"inner"},
  {id:"venus",  n:"๖",th:"ศุกร์",  col:"#55BBFF",glow:"#0055BB",defR:36, epiR:26, dS:0.28,   eS:0.455,sz:4,  kind:"inner"},
  {id:"sun",    n:"๑",th:"อาทิตย์",col:"#FF5533",glow:"#CC2200",defR:36, epiR:0,  dS:0.28,   eS:0,    sz:9,  kind:"simple"},
  {id:"mars",   n:"๓",th:"อังคาร", col:"#FF7799",glow:"#AA1144",defR:105,epiR:69, dS:0.14887,eS:0,    sz:4,  kind:"outer"},
  {id:"jupiter",n:"๕",th:"พฤหัส", col:"#FFAA44",glow:"#AA5500",defR:215,epiR:41, dS:0.02361,eS:0,    sz:5.2,kind:"outer"},
  {id:"saturn", n:"๗",th:"เสาร์",  col:"#CC88FF",glow:"#7700CC",defR:287,epiR:31, dS:0.00951,eS:0,    sz:5.2,kind:"outer"},
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
}