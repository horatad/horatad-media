// scenes/FullSystem.tsx — ระบบ Geocentric ครบทุกดาว 15s
import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { EpicycleCanvas } from "../components/Renderer";
import { PLANETS, gP } from "../physics";

const W = 1080, H = 1080;
const SPEED = 8;

export const FullSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const simFrame = frame * SPEED;
  const fadeIn  = interpolate(frame, [0, 30], [0,1], {extrapolateRight:"clamp"});
  const fadeOut = interpolate(frame, [420, 450], [1,0], {extrapolateLeft:"clamp"});
  const opacity = Math.min(fadeIn, fadeOut);

  const trailPoints = useMemo(() => {
    const result: Record<string, Array<{px:number;py:number}>> = {};
    PLANETS.forEach(p => { result[p.id] = []; });
    for (let f = Math.max(0, simFrame - 2000); f <= simFrame; f += 5) {
      PLANETS.forEach(p => {
        const r = gP(p, f);
        result[p.id].push({px: r.x, py: r.y});
      });
    }
    return result;
  }, [simFrame]);

  return (
    <div style={{width:W,height:H,background:"#010814",position:"relative",overflow:"hidden",opacity}}>
      <EpicycleCanvas frame={simFrame} width={W} height={H} showTrail trailPoints={trailPoints} showZodiac />
      <div style={{position:"absolute",top:"7%",left:0,right:0,textAlign:"center"}}>
        <div style={{fontFamily:"Cinzel,serif",fontSize:20,letterSpacing:3,color:"#c8a96e"}}>
          GEOCENTRIC SYSTEM
        </div>
        <div style={{fontFamily:"Noto Sans Thai",fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>
          ระบบ Ptolemy — โลกเป็นศูนย์กลาง
        </div>
      </div>
    </div>
  );
};
