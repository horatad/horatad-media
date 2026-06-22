import {useCurrentFrame, interpolate, AbsoluteFill} from 'remotion';
import * as defaultTiming from './timing.js';

// ── Credit end-card ตอนท้าย (ช่วง outro หลังเสียงพากย์จบ) — เครดิตที่เคยอยู่มุมบนซ้าย/ขวา ──
const FONT = 'Tahoma, "Leelawadee UI", "Noto Sans Thai", sans-serif';

// props (default = ต้นแบบ Ptolemy/ALMAGEST · backward-compat กับ Shorts60/TwoSystemsVert):
//   label='based on' · source='ALMAGEST' (คำใหญ่) · sub='Claudius Ptolemy · ~150 CE'
export function Credit({
  timing = defaultTiming,
  label = 'based on',
  source = 'ALMAGEST',
  sub = 'Claudius Ptolemy · ~150 CE',
  startAt = null,               // กำหนดเฟรมที่ credit ขึ้นเอง (ละ = VO_END+150 เดิม · backward-compat)
} = {}) {
  const {VO_END, DURATION} = timing;
  const f = useCurrentFrame();
  const start = startAt != null ? startAt : VO_END + 150;   // ขึ้นหลังเสียงพากย์จบ 5 วินาที (150f @30fps)
  if (f < start) return null;
  const op = interpolate(f, [start, start + 20, DURATION - 20, DURATION], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {/* dim พื้นหลัง ให้เครดิตเด่น */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(2,4,12,0.78), rgba(2,4,12,0.55))', opacity: op}} />
      <div style={{position: 'absolute', textAlign: 'center', opacity: op, fontFamily: FONT, padding: '0 8%'}}>
        <div style={{fontSize: 30, color: 'rgba(255,255,255,.6)', fontFamily: 'Georgia, serif', letterSpacing: 2}}>{label}</div>
        <div style={{fontSize: 80, fontWeight: 800, color: '#e8d08a', fontFamily: 'Georgia, serif', letterSpacing: 3, margin: '6px 0 2px'}}>{source}</div>
        <div style={{fontSize: 32, color: 'rgba(255,255,255,.78)'}}>{sub}</div>
        <div style={{width: 200, height: 2, background: 'rgba(232,208,138,.5)', margin: '34px auto'}} />
        <div style={{fontSize: 66, fontWeight: 800, color: '#ffffff', WebkitTextStroke: '1px #000', letterSpacing: 1}}>Horatad</div>
        <div style={{fontSize: 30, color: 'rgba(159,211,255,.85)', marginTop: 8}}>ดาราศาสตร์ พบ โหราศาสตร์</div>
      </div>
    </AbsoluteFill>
  );
}
