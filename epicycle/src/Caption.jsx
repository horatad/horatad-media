import {useCurrentFrame, interpolate, AbsoluteFill} from 'remotion';
import * as defaultTiming from './timing.js';

// ── Caption (subtitle เต็มประโยค) sync จาก timing.js — ดูแบบปิดเสียงได้ ──
const FONT = 'Tahoma, "Leelawadee UI", "Noto Sans Thai", sans-serif';
const FADE = 8;

// pos = 'bottom' (default · top:1410) หรือ 'top' (top:225 — เลี่ยงปุ่ม UI ของ Shorts ที่บังด้านล่าง)
export function Caption({timing = defaultTiming, pos = 'bottom'} = {}) {
  const {SEG, capTo} = timing;
  const f = useCurrentFrame();
  const i = SEG.findIndex((s, idx) => f >= s.from && f < capTo(idx));
  if (i < 0) return null;
  const seg = SEG[i];
  const to = capTo(i);
  const yTop = pos === 'top' ? 225 : 1410;
  const opacity = interpolate(f, [seg.from, seg.from + FADE, to - FADE, to], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: yTop, left: '5%', width: '90%', textAlign: 'center', opacity}}>
        <span style={{
          display: 'inline',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          background: 'rgba(6,10,24,0.66)',
          color: '#ffffff',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.55,
          letterSpacing: 0.3,
          padding: '6px 16px',
          borderRadius: 10,
          WebkitTextStroke: '0.5px #000',
          textShadow: '0 2px 8px rgba(0,0,0,.9)',
        }}>
          {seg.text}
        </span>
      </div>
    </AbsoluteFill>
  );
}
