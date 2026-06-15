import {useCurrentFrame, interpolate, AbsoluteFill} from 'remotion';
import {BEATS} from './timing.js';

// ── Title overlay (keyword เด่น) sync จาก timing.js · 7-beat ──
const FADE = 10;
const FONT = 'Tahoma, "Leelawadee UI", "Noto Sans Thai", sans-serif';

const baseStyle = {
  position: 'absolute', left: '6%', width: '88%', textAlign: 'center',
  fontFamily: FONT, fontWeight: 800, color: '#ffffff',
  WebkitTextStroke: '2px #000',
  textShadow: '0 4px 20px rgba(0,0,0,.95), 0 0 8px rgba(0,0,0,.9)',
  lineHeight: 1.22, letterSpacing: 0.5,
};

function Block({beat, top, fontSize, color, scaleIn, children}) {
  const f = useCurrentFrame();
  const {from, to} = beat;
  const dur = to - from;
  const local = f - from;
  if (local < -1 || local > dur) return null;
  const opacity = interpolate(local, [0, FADE, dur - FADE, dur], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = scaleIn
    ? interpolate(local, [0, FADE], [0.9, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  return (
    <div style={{...baseStyle, top, fontSize, color: color || '#ffffff', opacity, transform: 'scale(' + scale + ')'}}>
      {children}
    </div>
  );
}

function Lineage({beat}) {
  const f = useCurrentFrame();
  const {from, to} = beat;
  const dur = to - from;
  const local = f - from;
  if (local < -1 || local > dur) return null;
  const opacity = interpolate(local, [0, FADE, dur - FADE, dur], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const steps = [
    {t: 'กรีก', sub: 'ปโตเลมี ~150 CE', c: '#9fd3ff'},
    {t: 'อินเดีย', sub: 'นพเคราะห์ / Jyotisha', c: '#ffd24a'},
    {t: 'ไทย', sub: 'โหราศาสตร์ไทย', c: '#ff8a8a'},
  ];
  return (
    <div style={{...baseStyle, top: '15%', fontSize: 30, opacity, fontWeight: 800}}>
      <div style={{fontSize: 40, marginBottom: 26}}>1 ระบบดาว · 1,900 ปี</div>
      {steps.map((s, i) => {
        const stepOp = interpolate(local, [i * 90, i * 90 + 20], [0, 1],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const arrowOp = i > 0
          ? interpolate(local, [i * 90 - 26, i * 90 - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          : 0;
        return (
          <div key={i}>
            {i > 0 && <div style={{fontSize: 42, color: '#fff', opacity: arrowOp, margin: '2px 0'}}>↓</div>}
            <div style={{opacity: stepOp}}>
              <span style={{fontSize: 54, color: s.c}}>{s.t}</span>
              <span style={{fontSize: 26, color: 'rgba(255,255,255,.75)', display: 'block', WebkitTextStroke: '1px #000'}}>{s.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TextOverlay() {
  return (
    <AbsoluteFill>
      {/* HOOK — keyword เด่น */}
      <Block beat={BEATS.hook} top="9%" fontSize={86} scaleIn>
        ดาวเดิน<br />
        <span style={{color: '#ffd24a', WebkitTextStroke: '2px #000'}}>ถอยหลัง?</span>
      </Block>

      {/* setup/wrong/interrupt — ใช้ caption ล่างเล่าแทน (ลด title ซ้ำ ให้จอโล่ง) */}

      {/* SLOW REVEAL — lineage + arrows */}
      <Lineage beat={BEATS.lineage} />

      {/* PHILOSOPHICAL TWIST */}
      <Block beat={BEATS.twist} top="10%" fontSize={62} scaleIn>
        ดาวของโหราศาสตร์<br />
        <span style={{color: '#ffd24a', WebkitTextStroke: '2px #000'}}>คือดาวของทอเลมี</span>
      </Block>
    </AbsoluteFill>
  );
}
