// src/Root.tsx — Register all Remotion compositions
import React from "react";
import { Composition, Series } from "remotion";
import { EpicycleExplainer } from "./scenes/EpicycleExplainer";
import { MarsRetrograde }    from "./scenes/MarsRetrograde";
import { FullSystem }        from "./scenes/FullSystem";

const FPS = 30;
const W = 1080, H = 1080;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Individual scenes */}
    <Composition id="EpicycleExplainer" component={EpicycleExplainer}
      durationInFrames={300} fps={FPS} width={W} height={H} />

    <Composition id="MarsRetrograde" component={MarsRetrograde}
      durationInFrames={450} fps={FPS} width={W} height={H} />

    <Composition id="FullSystem" component={FullSystem}
      durationInFrames={450} fps={FPS} width={W} height={H} />

    {/* Full video = all scenes concatenated */}
    <Composition id="EpicycleFull" component={EpicycleFull}
      durationInFrames={300+450+450} fps={FPS} width={W} height={H} />
  </>
);

// Combined full video using Series
const EpicycleFull: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={300}><EpicycleExplainer /></Series.Sequence>
    <Series.Sequence durationInFrames={450}><MarsRetrograde /></Series.Sequence>
    <Series.Sequence durationInFrames={450}><FullSystem /></Series.Sequence>
  </Series>
);
