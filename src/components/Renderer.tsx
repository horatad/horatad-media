// ─────────────────────────────────────────────────────────────────────────────
// components/Renderer.tsx
// Draws the epicycle simulation to a canvas at a given frame
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from "react";
import { PLANETS, Planet, gP, isRetro, getPhase, PlanetPos } from "../physics";

export interface RenderOptions {
  frame:        number;
  width:        number;
  height:       number;
  scale?:       number;       // visual zoom (default 1)
  visibleIds?:  string[];     // which planets to draw (default all)
  showEpi?:     boolean;      // white epicycle overlay
  showTrail?:   boolean;
  trailPoints?: Record<string, Array<{px: number; py: number}>>;
  showZodiac?:  boolean;
  annotations?: React.ReactNode;
}

const ZOD_SHORT = ["เม","พฤ","มถ","กก","สิ","กน","ตล","พจ","ธน","มก","กภ","มน"];
const STARS = Array.from({length: 200}, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() < 0.08 ? 1.2 : 0.45,
  a: Math.random() * 0.4 + 0.08,
  tw: Math.random() * Math.PI * 2,
}));

function drawToCanvas(
  ctx:  CanvasRenderingContext2D,
  opts: RenderOptions & { dpr: number }
) {
  const { frame, width: W, height: H, scale = 1, dpr } = opts;
  const visibleIds = opts.visibleIds ?? PLANETS.map(p => p.id);
  const visible    = PLANETS.filter(p => visibleIds.includes(p.id));
  const cx = W / 2, cy = H / 2;
  const sc = (Math.min(W, H) / 780) * scale;

  // ── Background
  ctx.fillStyle = "#010814"; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(cx, cy, Math.min(W,H)*0.25, cx, cy, Math.min(W,H)*0.65);
  vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,0,10,0.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ── Stars
  STARS.forEach(s => {
    ctx.globalAlpha = s.a * (0.65 + 0.35 * Math.sin(s.tw + frame * 0.015));
    ctx.fillStyle = "#aaccff";
    ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Zodiac
  if (opts.showZodiac !== false) {
    const zO = 338*sc, zI = 316*sc;
    const rg = ctx.createRadialGradient(cx,cy,zI,cx,cy,zO);
    rg.addColorStop(0,"rgba(8,12,40,0.75)"); rg.addColorStop(1,"rgba(4,6,22,0.9)");
    ctx.beginPath(); ctx.arc(cx,cy,zO,0,Math.PI*2); ctx.arc(cx,cy,zI,0,Math.PI*2);
    ctx.fillStyle = rg; ctx.fill("evenodd");
    ZOD_SHORT.forEach((s, i) => {
      const a0 = -i*30*Math.PI/180-Math.PI/2;
      const a1 = -(i+1)*30*Math.PI/180-Math.PI/2;
      const am = (a0+a1)/2;
      ctx.beginPath();
      ctx.moveTo(cx+zI*Math.cos(a0), cy+zI*Math.sin(a0));
      ctx.lineTo(cx+zO*Math.cos(a0), cy+zO*Math.sin(a0));
      ctx.strokeStyle = `hsl(${240+i*8},40%,28%)`; ctx.lineWidth = 0.5; ctx.stroke();
      const lr = (zI+zO)/2;
      ctx.save(); ctx.translate(cx+lr*Math.cos(am), cy+lr*Math.sin(am));
      ctx.rotate(am+Math.PI/2);
      ctx.fillStyle = `hsl(${240+i*8},50%,62%)`;
      ctx.font = `400 ${Math.max(10,12*sc)}px 'Noto Sans Thai',sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(s,0,0);
      ctx.restore();
    });
  }

  // ── Positions
  const pos: Record<string, PlanetPos & {sx:number;sy:number;dfsx:number;dfsy:number}> = {};
  PLANETS.forEach(p => {
    const r = gP(p, frame);
    pos[p.id] = { ...r, sx: cx+r.x*sc, sy: cy+r.y*sc, dfsx: cx+r.dx*sc, dfsy: cy+r.dy*sc };
  });

  // ── Deferent circles
  visible.filter(p => p.kind !== "inner").forEach(p => {
    ctx.beginPath(); ctx.arc(cx, cy, p.defR*sc, 0, Math.PI*2);
    ctx.strokeStyle = p.col+"12"; ctx.lineWidth = 0.4; ctx.setLineDash([2,8]); ctx.stroke(); ctx.setLineDash([]);
  });
  // Inner planet orbit circles (around Sun)
  if (visibleIds.includes("sun")) {
    const sp = pos["sun"];
    visible.filter(p => p.kind === "inner").forEach(p => {
      ctx.beginPath(); ctx.arc(sp.sx, sp.sy, p.epiR*sc, 0, Math.PI*2);
      ctx.strokeStyle = p.col+"15"; ctx.lineWidth = 0.4; ctx.setLineDash([1.5,6]); ctx.stroke(); ctx.setLineDash([]);
    });
  }

  // ── Trails
  if (opts.showTrail && opts.trailPoints) {
    visible.forEach(p => {
      const t = opts.trailPoints![p.id]; if (!t || t.length < 2) return;
      ctx.strokeStyle = p.col + "bb"; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(cx+t[0].px*sc, cy+t[0].py*sc);
      for (let i = 1; i < t.length; i++) ctx.lineTo(cx+t[i].px*sc, cy+t[i].py*sc);
      ctx.stroke();
    });
  }

  // ── Epicycle overlay (white)
  if (opts.showEpi) {
    visible.filter(p => p.kind === "outer").forEach(p => {
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pos[p.id].dfsx, pos[p.id].dfsy);
      ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 0.6; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
    });
    visible.filter(p => p.epiR > 0).forEach(p => {
      const {sx,sy,dfsx,dfsy} = pos[p.id];
      const eR = Math.hypot(sx-dfsx, sy-dfsy); if (eR < 1) return;
      ctx.beginPath(); ctx.arc(dfsx, dfsy, eR, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 0.9; ctx.setLineDash([3*sc,3*sc]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(dfsx,dfsy); ctx.lineTo(sx,sy);
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 1; ctx.stroke();
    });
  }

  // ── Earth
  const eR = 9*sc;
  const eg = ctx.createRadialGradient(cx,cy,0,cx,cy,eR*2.5);
  eg.addColorStop(0,"rgba(160,200,255,0.15)"); eg.addColorStop(1,"transparent");
  ctx.beginPath(); ctx.arc(cx,cy,eR*2.5,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill();
  ctx.shadowColor="#aaddff"; ctx.shadowBlur=18*sc;
  ctx.beginPath(); ctx.arc(cx,cy,eR,0,Math.PI*2);
  const eg2=ctx.createRadialGradient(cx,cy,0,cx,cy,eR);
  eg2.addColorStop(0,"#fff"); eg2.addColorStop(1,"#8bbfff");
  ctx.fillStyle=eg2; ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle="rgba(180,210,255,0.7)";
  ctx.font=`500 ${Math.max(7,8*sc)}px 'Noto Sans Thai',sans-serif`;
  ctx.textAlign="center"; ctx.textBaseline="top"; ctx.fillText("โลก",cx,cy+eR+3*sc);

  // ── Planets
  const sunP = visibleIds.includes("sun") ? pos["sun"] : null;
  visible.forEach(p => {
    const {sx:x, sy:y} = pos[p.id];
    const r = p.sz * sc;
    const retro = isRetro(p, frame);

    // Retrograde ring
    if (retro && p.kind !== "simple") {
      const pulse = 0.5 + 0.5*Math.sin(frame*0.1);
      ctx.beginPath(); ctx.arc(x,y,r*(2.2+pulse*0.5),0,Math.PI*2);
      ctx.strokeStyle=`rgba(255,80,80,${0.25+pulse*0.2})`; ctx.lineWidth=sc; ctx.setLineDash([2*sc,2.5*sc]); ctx.stroke(); ctx.setLineDash([]);
    }

    // Glow
    const gr=ctx.createRadialGradient(x,y,0,x,y,r*3);
    gr.addColorStop(0,p.glow+"44"); gr.addColorStop(1,p.glow+"00");
    ctx.beginPath(); ctx.arc(x,y,r*3,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

    // Moon phase
    if (p.id==="moon" && sunP) {
      const pa=Math.atan2(sunP.sy-y,sunP.sx-x);
      ctx.save(); ctx.translate(x,y); ctx.rotate(pa);
      ctx.beginPath(); ctx.arc(0,0,r+1,0,Math.PI*2); ctx.clip();
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fillStyle="#0a0820"; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,r,-Math.PI/2,Math.PI/2); ctx.closePath(); ctx.fillStyle=p.col; ctx.fill();
      ctx.restore();
    // Venus phase
    } else if (p.id==="venus" && sunP) {
      const ph=getPhase(x,y,sunP.sx,sunP.sy,cx,cy);
      ctx.save(); ctx.translate(x,y); ctx.rotate(ph.litAngle);
      ctx.beginPath(); ctx.arc(0,0,r+1,0,Math.PI*2); ctx.clip();
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fillStyle="#06060f"; ctx.fill();
      if (ph.k>0.01){
        const ex=r*(2*ph.k-1);
        ctx.beginPath(); ctx.arc(0,0,r,-Math.PI/2,Math.PI/2);
        if(ph.k>=0.5) ctx.ellipse(0,0,Math.abs(ex),r,0,Math.PI/2,-Math.PI/2,true);
        else          ctx.ellipse(0,0,Math.abs(ex),r,0,Math.PI/2,-Math.PI/2,false);
        ctx.closePath(); ctx.shadowColor=p.glow; ctx.shadowBlur=10; ctx.fillStyle=p.col; ctx.fill(); ctx.shadowBlur=0;
      }
      ctx.restore();
    } else {
      ctx.shadowColor=p.glow; ctx.shadowBlur=14*sc;
      const pd=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);
      pd.addColorStop(0,p.col); pd.addColorStop(1,p.glow+"99");
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=pd; ctx.fill(); ctx.shadowBlur=0;
    }

    // Number label
    ctx.fillStyle = p.id==="sun" ? "rgba(255,200,180,.9)" : "rgba(255,255,255,.9)";
    ctx.font=`bold ${Math.max(7,r*1.2)}px 'Noto Sans Thai',sans-serif`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(p.n,x,y);

    // Retrograde symbol
    if (retro && p.kind!=="simple") {
      ctx.fillStyle="#ff7070"; ctx.font=`${Math.max(9,11*sc)}px serif`;
      ctx.textBaseline="bottom"; ctx.fillText("℞",x,y-r*2.5);
    }
  });
}

// React component wrapper
export const EpicycleCanvas: React.FC<RenderOptions & { style?: React.CSSProperties }> = (props) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = props.width  * dpr;
    canvas.height = props.height * dpr;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawToCanvas(ctx, { ...props, dpr });
  });

  return (
    <canvas
      ref={ref}
      style={{ width: props.width, height: props.height, display: "block", ...(props.style ?? {}) }}
    />
  );
};
