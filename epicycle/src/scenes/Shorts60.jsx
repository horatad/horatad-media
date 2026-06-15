import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {FullEpicycle} from './FullEpicycle.jsx';
import {TextOverlay} from '../TextOverlay.jsx';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Credit} from '../Credit.jsx';
import {Music} from '../Music.jsx';
import {DURATION} from '../timing.js';

// ── Shorts60 — YouTube Shorts vertical 9:16 (1080×1920 · 30fps) ──
// reuse epicycle animation เดิม (FullEpicycle) เป็น background + text overlay 7-beat + caption + voiceover + bgm
// ตาม SHORTS_BEST_PRACTICES.md · timing จาก src/timing.js

// FullEpicycle วาด canvas 1080×1080 — วางกึ่งกลางแนวตั้งค่อนบน ให้ text มีที่ด้านล่าง (caption)
const EPI_TOP = 330;   // ใต้ ring เหนือโซน YT UI

export function Shorts60() {
  const f = useCurrentFrame();
  // loop เนียน: fade content ผ่านพื้นดำที่ต้น (0–15) และปลาย (1785–1800)
  // → เมื่อ YouTube วนกลับ frame 0 ภาพไม่กระตุก (epicycle หลายดาวคาบไม่ลงตัว จึง position-loop เป๊ะไม่ได้)
  const loopFade = interpolate(f, [0, 15, DURATION - 15, DURATION], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#010814'}}>
      <AbsoluteFill style={{opacity: loopFade}}>
        <div style={{position: 'absolute', left: 0, top: EPI_TOP, width: 1080, height: 1080, overflow: 'hidden'}}>
          <FullEpicycle hideHeadline speed={3} hideRetro outerScale={1.69} innerScale={1.3} zodiacScale={1.5} />
        </div>
        <TextOverlay />
        <Caption />
        <Credit />
      </AbsoluteFill>
      <Narration />
      <Music music="audio/skaters-waltz.mp3" introFade={9} outroFade={15} outroSilence={9} />
    </AbsoluteFill>
  );
}
