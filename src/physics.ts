// ─────────────────────────────────────────────────────────────────────────────
// physics.ts  — นพเคราะห์ Epicycle Physics Engine
// Pure functions of frame number — no side effects, fully seekable
// ─────────────────────────────────────────────────────────────────────────────

export const SS  = 0.28;   // Sun angular speed deg/frame
export const S0  = -90;    // Start angle (Aries = top)

export type PlanetKind = "simple" | "inner" | "outer";

export interface Planet {
  id:    string;
  n:     string;   // Thai numeral
  th:    string;   // Thai name
  p:     string;   // Period label
  col:   string;
  glow:  string;
  defR:  number;   // Deferent radius (display units)
  epiR:  number;   // Epicycle radius
  dS:    number;   // Deferent angular speed
  eS:    number;   // Epicycle angular speed
  sz:    number;   // Visual size
  kind:  PlanetKind;
}

export const PLANETS: Planet[] = [
  {id:"moon",   n:"๒",th:"จันทร์", p:"27.32 วัน",col:"#FFE566",glow:"#AA8800",defR:22, epiR:4,  dS:3.743,  eS:0,    sz:3.5,kind:"simple"},
  {id:"mercury",n:"๔",th:"พุธ",    p:"88 วัน",   col:"#55DD55",glow:"#227722",defR:36, epiR:17, dS:SS,     eS:1.163,sz:3.2,kind:"inner"},
  {id:"venus",  n:"๖",th:"ศุกร์",  p:"225 วัน",  col:"#55BBFF",glow:"#0055BB",defR:36, epiR:26, dS:SS,     eS:0.455,sz:4,  kind:"inner"},
  {id:"sun",    n:"๑",th:"อาทิตย์",p:"365 วัน",  col:"#FF5533",glow:"#CC2200",defR:36, epiR:0,  dS:SS,     eS:0,    sz:9,  kind:"simple"},
  {id:"mars",   n:"๓",th:"อังคาร", p:"687 วัน",  col:"#FF7799",glow:"#AA1144",defR:105,epiR:69, dS:0.14887,eS:0,    sz:4,  kind:"outer"},
  {id:"jupiter",n:"๕",th:"พฤหัส", p:"11.86 ปี", col:"#FFAA44",glow:"#AA5500",defR:215,epiR:41, dS:0.02361,eS:0,    sz:5.2,kind:"outer"},
  {id:"saturn", n:"๗",th:"เสาร์",  p:"29.46 ปี", col:"#CC88FF",glow:"#7700CC",defR:287,epiR:31, dS:0.00951,eS:0,    sz:5.2,kind:"outer"},
];

export interface PlanetPos {
  x: number;   // from Earth center (display units)
  y: number;
  dx: number;  // deferent center x
  dy: number;  // deferent center y
}

const tr = (d: number) => d * Math.PI / 180;
const sunA = (f: number) => tr(S0 - SS * f);

/** Get planet position at frame f — pure function, fully seekable */
export function gP(p: Planet, f: number): PlanetPos {
  const sa = sunA(f);
  let da: number, ea: number;
  if      (p.kind === "inner")  { da = sa; ea = tr(S0 - p.eS * f); }
  else if (p.kind === "outer")  { da = tr(S0 - p.dS * f); ea = sa; }
  else                          { da = tr(S0 - p.dS * f); ea = 0; }
  const dx = p.defR * Math.cos(da), dy = p.defR * Math.sin(da);
  const ex = p.epiR > 0 ? p.epiR * Math.cos(ea) : 0;
  const ey = p.epiR > 0 ? p.epiR * Math.sin(ea) : 0;
  return { x: dx + ex, y: dy + ey, dx, dy };
}

/** True if planet is in apparent retrograde at frame f */
export function isRetro(p: Planet, f: number): boolean {
  if (p.kind === "simple") return false;
  const sa = sunA(f);
  let rx: number, ry: number, vx: number, vy: number;
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

/** Venus/Moon phase fraction k (0=new/dark, 1=full/bright) */
export function getPhase(
  vx: number, vy: number,
  sx: number, sy: number,
  cx: number, cy: number
): { k: number; litAngle: number } {
  const veX = cx-vx, veY = cy-vy, vsX = sx-vx, vsY = sy-vy;
  const dve = Math.hypot(veX, veY), dvs = Math.hypot(vsX, vsY);
  if (dve < 0.01 || dvs < 0.01) return { k: 0.5, litAngle: 0 };
  const cosA = (veX*vsX + veY*vsY) / (dve * dvs);
  return {
    k: (1 + Math.max(-1, Math.min(1, cosA))) / 2,
    litAngle: Math.atan2(sy - cy, sx - cx),
  };
}

/** Zodiac sign name from screen position */
const ZOD = ["เมษ","พฤษภ","มิถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มกร","กุมภ์","มีน"];
export function getSign(px: number, py: number, cx: number, cy: number): string {
  const deg = Math.atan2(py - cy, px - cx) * 180 / Math.PI;
  return ZOD[Math.floor(((90 - deg) % 360 + 360) % 360 / 30) % 12];
}
