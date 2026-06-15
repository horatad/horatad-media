import {Audio, staticFile, useCurrentFrame, interpolate} from 'remotion';
import * as defaultTiming from './timing.js';

// ── BGM: เปิดดังเต็ม 5วิ (intro) → duck ใต้เสียงพากย์ → ดังต่อ (outro) จนจบ → fade ปลาย ──
// เปลี่ยนเพลง: วางไฟล์ใน public/ แล้วแก้ MUSIC (เช่น 'music.mp3')
// outroSilence = เฟรมก่อนจบคลิปที่ให้เพลงเงียบสนิท (default 0 · backward-compat)
// introFade   = เฟรม fade-in เปิดเพลง (default 30 = 1วิ · ลดลงเพื่อให้คลิปที่วนลูปต่อต้น-ท้ายลื่น เงียบสั้น)
// outroFade   = เฟรม fade-out ปลายเพลง (default 45 = 1.5วิ)
export function Music({timing = defaultTiming, music = 'audio/shostakovich-waltz2-loop.wav',
                       outroSilence = 0, introFade = 30, outroFade = 45} = {}) {
  const {INTRO_FRAMES, VO_END, DURATION} = timing;
  const MUSIC = music;
  const f = useCurrentFrame();
  const fadeEnd = DURATION - outroSilence;            // เพลง fade ลง 0 ที่นี่ แล้วเงียบจนจบคลิป
  const vol = interpolate(
    f,
    [0, introFade, INTRO_FRAMES, INTRO_FRAMES + 20, VO_END, VO_END + 30, fadeEnd - outroFade, fadeEnd],
    [0, 0.85, 0.85, 0.16, 0.16, 0.80, 0.80, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  return <Audio src={staticFile(MUSIC)} loop volume={vol} />;
}
