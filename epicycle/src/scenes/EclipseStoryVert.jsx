import {AbsoluteFill,Sequence,useCurrentFrame,interpolate} from 'remotion';
import {EclipseGround} from './EclipseGround.jsx';
import {Eclipse} from './Eclipse.jsx';
import {EclipseSaros} from './EclipseSaros.jsx';
import {Caption} from '../Caption.jsx';
import {Narration} from '../Narration.jsx';
import {Music} from '../Music.jsx';
import {Credit} from '../Credit.jsx';
import * as timingEclipse from '../timing-eclipse.js';

// ── EclipseStory แนวตั้ง (Shorts 1080×1920) ──
// วาง 4 ฉากย่อยจัตุรัส (1080²) ในกล่องกลาง-บน · re-time ให้ตรง narration (ground→solar→lunar→saros)
// + Caption(พากย์)/Narration/Music/Credit overlay
const BOX_TOP=0;                         // กล่อง 1080×1080 ชนขอบบน (ท้องฟ้าฉาก ground เต็มขอบ ไร้รอยต่อ) · caption y1410 ใต้กล่อง
const {SCENES,DURATION}=timingEclipse;
const fade=(f,dur)=>interpolate(f,[0,16,dur-16,dur],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
function Scene({dur,children}){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{opacity:fade(f,dur)}}>{children}</AbsoluteFill>;
}
const seq=(s)=>({from:s.from,durationInFrames:s.to-s.from});

export function EclipseStoryVert(){
  const frame=useCurrentFrame();
  const loopFade=interpolate(frame,[0,15,DURATION-15,DURATION],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const g=seq(SCENES.ground),so=seq(SCENES.solar),lu=seq(SCENES.lunar),sa=seq(SCENES.saros);
  return(
    <AbsoluteFill style={{background:'#02030a'}}>
      <AbsoluteFill style={{opacity:loopFade}}>
        {/* กล่องฉากย่อย (จัตุรัส) กลาง-บน */}
        <div style={{position:'absolute',top:BOX_TOP,left:0,width:1080,height:1080,overflow:'hidden'}}>
          <Sequence from={g.from} durationInFrames={g.durationInFrames}>
            <Scene dur={g.durationInFrames}><EclipseGround offset={0}/></Scene>
          </Sequence>
          <Sequence from={so.from} durationInFrames={so.durationInFrames}>
            <Scene dur={so.durationInFrames}><Eclipse offset={201}/></Scene>
          </Sequence>
          <Sequence from={lu.from} durationInFrames={lu.durationInFrames}>
            <Scene dur={lu.durationInFrames}><Eclipse offset={833}/></Scene>
          </Sequence>
          <Sequence from={sa.from} durationInFrames={sa.durationInFrames}>
            <Scene dur={sa.durationInFrames}><EclipseSaros offset={0}/></Scene>
          </Sequence>
        </div>
        <Caption timing={timingEclipse}/>
        <Credit timing={timingEclipse} label="based on" source="SAROS" sub="วัฏจักรอุปราคา ~18 ปี"/>
      </AbsoluteFill>
      <Narration timing={timingEclipse} voDir="vo-eclipse"/>
      <Music timing={timingEclipse} music="audio/lunar-bgm-clip.mp3"/>
    </AbsoluteFill>
  );
}
