import {Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';
import * as defaultTiming from './timing.js';

// ── BGM: เปิดดังเต็ม 5วิ (intro) → duck ใต้เสียงพากย์ → ดังต่อ (outro) → "หรี่ลงตอน credit ขึ้น" → fade จบ ──
// เปลี่ยนเพลง: วางไฟล์ใน public/ แล้วแก้ MUSIC (เช่น 'music.mp3')
// outroSilence = เฟรมก่อนจบคลิปที่ให้เพลงเงียบสนิท (default 0 · backward-compat)
// introFade   = เฟรม fade-in เปิดเพลง (default 30 = 1วิ)
// outroFade   = (เลิกใช้กับ tail แล้ว · คงไว้ backward-compat) เพลงหรี่ตาม credit แทน
// gain        = คูณความดังทั้งเส้น (default 1.0 · เพลงเบาเกิน→เพิ่ม เช่น 1.7 · clamp ≤1.0 กันแตก)
// duck        = ระดับเพลงตอนมีเสียงพากย์ (default 0.16 · เพลงจมใต้พากย์→เพิ่ม เช่น 0.28)
// creditAt    = เฟรมที่ credit ขึ้น (default VO_END+150 = ตรงกับ Credit.jsx) → เพลงหรี่ลงตรงนี้
// creditLevel = ระดับเพลงตอน credit โชว์ (default 0.40 · เบาลงให้รู้สึกจบ)
export function Music({timing = defaultTiming, music = 'audio/shostakovich-waltz2-loop.wav',
                       outroSilence = 0, introFade = 30, outroFade = 45, gain = 1.0, duck = 0.16,
                       creditAt = null, creditLevel = 0.40} = {}) {
  const {INTRO_FRAMES, VO_END, DURATION} = timing;
  const MUSIC = music;
  const f = useCurrentFrame();
  const fadeEnd = DURATION - outroSilence;            // เพลง fade ลง 0 ที่นี่ แล้วเงียบจนจบคลิป
  const cAt = creditAt != null ? creditAt : VO_END + 150;  // credit ขึ้น (ตรงกับ Credit.jsx)
  const cDuck = Math.min(cAt + 30, fadeEnd - 5);      // หรี่ลงเสร็จภายใน ~1วิ หลัง credit ขึ้น
  const base = interpolate(
    f,
    [0, introFade, INTRO_FRAMES, INTRO_FRAMES + 20, VO_END, VO_END + 30, cAt, cDuck, fadeEnd],
    [0, 0.85, 0.85, duck, duck, 0.80, 0.80, creditLevel, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const vol = Math.min(base * gain, 1.0);             // clamp กันเกิน 1.0 (แตก)
  return <Audio src={staticFile(MUSIC)} loop volume={vol} />;
}
