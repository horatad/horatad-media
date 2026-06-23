import {Composition} from 'remotion';
import {FullEpicycle} from './scenes/FullEpicycle.jsx';
import {FullEpicycleInner} from './scenes/FullEpicycleInner.jsx';
import {Adhikamasa} from './scenes/Adhikamasa.jsx';
import {AllTrails} from './scenes/AllTrails.jsx';
import {HelioRetro} from './scenes/HelioRetro.jsx';
import {HelioDual} from './scenes/HelioDual.jsx';
import {Eclipse} from './scenes/Eclipse.jsx';
import {EclipseGround} from './scenes/EclipseGround.jsx';
import {EclipseSaros} from './scenes/EclipseSaros.jsx';
import {EclipsePhase} from './scenes/EclipsePhase.jsx';
import {MercuryRetro} from './scenes/MercuryRetro.jsx';
import {Shorts60} from './scenes/Shorts60.jsx';
import {TwoSystemsVert} from './scenes/TwoSystemsVert.jsx';
import {MoonPhaseVert} from './scenes/MoonPhaseVert.jsx';
import {VenusPhaseVert} from './scenes/VenusPhaseVert.jsx';
import {VenusBrightestVert} from './scenes/VenusBrightestVert.jsx';
import {OppositionVert} from './scenes/OppositionVert.jsx';
import {EclipseStoryVert} from './scenes/EclipseStoryVert.jsx';
import {OccultationVert} from './scenes/OccultationVert.jsx';
import {SmileyFace} from './scenes/SmileyFace.jsx';
import {DURATION as SHORTS60_FRAMES} from './timing.js';
const FRAMES=2700;
export const RemotionRoot=()=>(
  <>
    <Composition id="FullEpicycle" component={FullEpicycle} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="FullEpicycleInner" component={FullEpicycleInner} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="Adhikamasa" component={Adhikamasa} durationInFrames={1200} fps={30} width={1080} height={1080}/>
    <Composition id="AllTrails" component={AllTrails} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="HelioRetro" component={HelioRetro} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="HelioDual" component={HelioDual} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="Eclipse" component={Eclipse} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="EclipseGround" component={EclipseGround} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="EclipseSaros" component={EclipseSaros} durationInFrames={320} fps={30} width={1080} height={1080}/>
    <Composition id="EclipsePhase" component={EclipsePhase} durationInFrames={FRAMES} fps={30} width={1080} height={1080}/>
    <Composition id="MercuryRetro" component={MercuryRetro} durationInFrames={1740} fps={30} width={1080} height={1920}/>
    <Composition id="Shorts60" component={Shorts60} durationInFrames={SHORTS60_FRAMES} fps={30} width={1080} height={1920}/>
    <Composition id="TwoSystemsVert" component={TwoSystemsVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="MoonPhaseVert" component={MoonPhaseVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="VenusPhaseVert" component={VenusPhaseVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="VenusBrightestVert" component={VenusBrightestVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="OppositionVert" component={OppositionVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="EclipseStoryVert" component={EclipseStoryVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="OccultationVert" component={OccultationVert} durationInFrames={1770} fps={30} width={1080} height={1920}/>
    <Composition id="SmileyFace" component={SmileyFace} durationInFrames={1770} fps={30} width={1080} height={1920}/>
  </>
);