import {Sequence, Audio, staticFile} from 'remotion';
import * as defaultTiming from './timing.js';

// ── Voiceover ไทย (edge-tts NiwatNeural) sync จาก timing.js — เสียงเริ่มพร้อม caption · เว้นวรรค 1 วิ ──
export function Narration({timing = defaultTiming, voDir = 'vo'} = {}) {
  const {SEG} = timing;
  return (
    <>
      {SEG.map((s, i) => (
        <Sequence key={i} from={s.from}>
          <Audio src={staticFile(voDir + '/seg' + String(i).padStart(2, '0') + '.mp3')} />
        </Sequence>
      ))}
    </>
  );
}
