import {AbsoluteFill,Sequence,useCurrentFrame,interpolate,Audio,staticFile} from 'remotion';
import {EclipseGround} from './EclipseGround.jsx';
import {Eclipse} from './Eclipse.jsx';
import {EclipseSaros} from './EclipseSaros.jsx';

// ── คลิปเล่าเรื่อง: B(ภาพจริง) → A(แผนที่ราหู-เกตุ: สุริยะ→จันทร) → Saros(ปิด) ──
const fade=(f,dur)=>interpolate(f,[0,16,dur-16,dur],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
function Scene({dur,children}){
  const f=useCurrentFrame();
  return <AbsoluteFill style={{opacity:fade(f,dur)}}>{children}</AbsoluteFill>;
}

export function EclipseStory(){
  return(
    <AbsoluteFill style={{background:'#02030a'}}>
      {/* 1) เปิด — ภาพจริงมองจากพื้นโลก (สุริยุปราคาเต็มดวง) */}
      <Sequence from={0} durationInFrames={280}>
        <Scene dur={280}><EclipseGround offset={0}/></Scene>
      </Sequence>
      {/* 2) เฉลย — แผนที่ฟ้า ราหู-เกตุ : สุริยุปราคา */}
      <Sequence from={270} durationInFrames={210}>
        <Scene dur={210}><Eclipse offset={201}/></Scene>
      </Sequence>
      {/* 3) เฉลยต่อ — จันทรุปราคา */}
      <Sequence from={470} durationInFrames={210}>
        <Scene dur={210}><Eclipse offset={833}/></Scene>
      </Sequence>
      {/* 4) ปิด — Saros */}
      <Sequence from={670} durationInFrames={320}>
        <Scene dur={320}><EclipseSaros offset={0}/></Scene>
      </Sequence>
    </AbsoluteFill>
  );
}
