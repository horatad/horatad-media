import {Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';
import * as defaultTiming from './timing.js';

// ── BGM: เปิดดังเต็ม 5วิ (intro) → duck ใต้เสียงพากย์ → ดังต่อ (outro) จนจบ → fade ปลาย ──
// เปลี่ยนเพลง: วางไฟล์ใน public/ แล้วแก้ MUSIC (เช่น 'music.mp3')
// outroSilence = เฟรมก่อนจบคลิปที่ให้เพลงเงียบสนิท (default 0 = fade จบพอดีเฟรมสุดท้าย · backward-compat)
export function Music({timing = defaultTiming, music = 'audio/shostakovich-waltz2-loop.wav', outroSilence = 0} = {}) {
  const {INTRO_FRAMES, VO_END, DURATION} = timing;
  const MUSIC = music;
  const f = useCurrentFrame();
  const fadeEnd = DURATION - outroSilence;            // เพลง fade ลง 0 ที่นี่ แล้วเงียบจนจบคลิป
  const vol = interpolate(
    f,
    [0, 30, INTRO_FRAMES, INTRO_FRAMES + 20, VO_END, VO_END + 30, fadeEnd - 45, fadeEnd],
    [0, 0.85, 0.85, 0.16, 0.16, 0.80, 0.80, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return <Audio src={staticFile(MUSIC)} loop volume={vol} />;
}
