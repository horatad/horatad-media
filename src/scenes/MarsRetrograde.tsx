// ─────────────────────────────────────────────────────────────────────────────
// scenes/MarsRetrograde.tsx
// Scene 2: Mars trail building — กลีบดอกไม้ retrograde loop
// Duration: 15s @ 30fps = 450 frames
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { EpicycleCanvas } from "../components/Renderer";
import { PLANETS, gP, isRetro } from "../physics";

const W = 1080, H = 1080;
const SPEED = 20; // simulation speed multiplier

export const MarsRetrograde: React.FC = () => {
  const frame = useCurrentFrame();

  const simFrame = frame * SPEED;

  // Build trail: collect all positions up to current simFrame
  const trailPoints = useMemo(() => {
    const pts: Array<{px: number; py: number}> = [];
    const mars = PLANETS.find(p => p.id === "mars")!;
    for (let f = 0; f <= simFrame; f += 3) {
      const r = gP(mars, f);
      pts.push({ px: r.x, py: r.y });
    }
    return { mars: pts };
  }, [simFrame]);

  const mars = PLANETS.find(p => p.id === "mars")!;
  const retro = isRetro(mars, simFrame);

  const titleOpacity = interpolate(frame, [0, 20, 400, 450], [0, 1, 1, 0]);
  const retroLabel   = retro ? 1 : 0;

  // Count retrograde loops
  const loopCount = useMemo(() => {
    let count = 0, wasRetro = false;
    for (let f = 0; f <= simFrame; f += 5) {
      const r = isRetro(mars, f);
      if (r && !wasRetro) count++;
      wasRetro = r;
    }
    return count;
  }, [simFrame]);

  return (
    <div style={{ width: W, height: H, background: "#010814", position: "relative", overflow: "hidden" }}>

      <EpicycleCanvas
        frame={simFrame} width={W} height={H}
        visibleIds={["sun", "mars"]}
        showTrail trailPoints={trailPoints}
        showZodiac
      />

      {/* Title */}
      <div style={{
        position: "absolute", top: "7%", left: 0, right: 0, textAlign: "center",
        opacity: titleOpacity,
      }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 22, letterSpacing: 3, color: "#c8a96e" }}>
          MARS RETROGRADE
        </div>
        <div style={{ fontFamily: "Noto Sans Thai", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          กลีบดอกไม้ก่อตัวจาก retrograde loop
        </div>
      </div>

      {/* Loop counter */}
      <div style={{
        position: "absolute", bottom: "10%", right: "8%",
        textAlign: "right", fontFamily: "Noto Sans Thai",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>RETROGRADE LOOPS</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#FF7799", lineHeight: 1.1 }}>
          {loopCount}
        </div>
      </div>

      {/* Retrograde indicator */}
      {retro && (
        <div style={{
          position: "absolute", top: "12%", right: "8%",
          background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.4)",
          borderRadius: 6, padding: "6px 12px",
          fontFamily: "Noto Sans Thai", fontSize: 12, color: "#ff8888",
          opacity: retroLabel,
        }}>
          ℞ ถอยหลัง
        </div>
      )}

      {/* Days counter */}
      <div style={{
        position: "absolute", bottom: "10%", left: "8%",
        fontFamily: "Noto Sans Thai",
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>วันที่ผ่านมา</div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
          {Math.round(simFrame * 0.284).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
