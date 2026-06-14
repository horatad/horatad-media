import { Composition } from 'remotion';
import { MarsRetrograde } from './scenes/MarsRetrograde.jsx';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="MarsRetrograde"
        component={MarsRetrograde}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
}