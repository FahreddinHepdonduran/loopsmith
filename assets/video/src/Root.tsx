import "./index.css";
import { Composition } from "remotion";
import { LaunchLoop } from "./LaunchLoop";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LaunchLoop"
      component={LaunchLoop}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1080}
    />
  );
};
