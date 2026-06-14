// ─────────────────────────────────────────────────────────────────────────────
// scenes/EpicycleExplainer.tsx
// Scene 1: อธิบาย Epicycle ทีละขั้น
// Duration: 10s @ 30fps = 300 frames
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { EpicycleCanvas } from "../components/Renderer";
import { PLANETS, gP, isRetro } from "../physics";

const W = 1080, H = 1080;

export const EpicycleExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stage reveals (frames)
  // 0–30:   Title fade in
  // 30–80:  Earth + deferent circle appears
  // 80–150: Deferent center arm animates
  // 150–220: Epicycle circle + arm appears
  // 220–280: Planet appears, starts moving
  // 280–300: Full labels visible

  const titleOpacity  = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const deferOpacity  = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const epiOpacity    = interpolate(frame, [150, 180], [0, 1], { extrapolateRight: "clamp" });
  const labelOpacity  = interpolate(frame, [220, 260], [0, 1], { extrapolateRight: "clamp" });
  const systemOpacity = interpolate(frame, [200, 240], [0, 1], { extrapolateRight: "clamp" });

  // Freeze planet at start, animate after frame 200
  const physicsFrame = frame < 200 ? 0 : (frame - 200) * 4;

  const mars = PLANETS.find(p => p.id === "mars")!;
  const sun  = PLANETS.find(p => p.id === "sun")!;

  const sc = Math.min(W, H) / 780;
  const cx = W/2, cy = H/2;

  return (
    <div style={{ width: W, height: H, background: "#010814", position: "relative", overflow: "hidden" }}>

      {/* Canvas layer */}
      <div style={{ opacity: systemOpacity }}>
        <EpicycleCanvas
          frame={physicsFrame} width={W} height={H}
          visibleIds={["sun", "mars"]}
          showEpi={epiOpacity > 0.5}
          showZodiac={false}
        />
      </div>

      {/* SVG annotation layer */}
      <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        {/* Deferent circle guide */}
        <circle cx={cx} cy={cy} r={mars.defR * sc}
          fill="none" stroke={mars.col} strokeWidth={1}
          strokeDasharray="6 10" opacity={deferOpacity * 0.4} />

        {/* Labels */}
        {labelOpacity > 0.1 && (
          <>
            <text x={cx + mars.defR*sc + 14} y={cy}
              fill="rgba(255,255,255,0.55)" fontSize={14} fontFamily="Noto Sans Thai">
              Deferent (วงหลัก)
            </text>
            <text x={cx + 14} y={cy - mars.defR*sc + 20}
              fill="rgba(255,255,255,0.55)" fontSize={14} fontFamily="Noto Sans Thai"
              opacity={epiOpacity}>
              Epicycle (วงรอง)
            </text>
          </>
        )}
      </svg>

      {/* Title overlay */}
      <div style={{
        position: "absolute", top: "8%", left: 0, right: 0,
        textAlign: "center", opacity: titleOpacity,
      }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 28, letterSpacing: 4, color: "#c8a96e" }}>
          EPICYCLE
        </div>
        <div style={{ fontFamily: "Noto Sans Thai", fontSize: 18, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
          ระบบวงโคจรซ้อนของ Ptolemy
        </div>
      </div>

      {/* Step labels */}
      <div style={{
        position: "absolute", bottom: "10%", left: "10%", right: "10%",
        opacity: labelOpacity,
      }}>
        <div style={{ fontFamily: "Noto Sans Thai", fontSize: 15, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
          ดาวโคจรบน <span style={{ color: "#FF7799" }}>Epicycle</span> ซึ่งวิ่งอยู่บน <span style={{ color: "rgba(255,255,255,0.9)" }}>Deferent</span>
        </div>
        <div style={{ fontFamily: "Noto Sans Thai", fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 6 }}>
          การซ้อนกันของสองวงอธิบาย retrograde ที่สังเกตได้จากโลก
        </div>
      </div>
    </div>
  );
};
