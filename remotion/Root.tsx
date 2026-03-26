import { Composition } from 'remotion';
import { MainVideo } from './compositions/MainVideo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        brandAssets: {
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          backgroundColor: '#0f0f0f',
          companyName: 'Your Brand',
          fontFamily: 'Inter',
        },
        script: {
          scenes: [
            { type: 'intro', heading: 'Welcome', durationInFrames: 90 },
            { type: 'feature', heading: 'Our Product', body: 'Description here', durationInFrames: 120 },
            { type: 'cta', heading: 'Get Started', body: 'Sign up today', durationInFrames: 90 },
            { type: 'outro', heading: 'Thank You', durationInFrames: 90 },
          ],
        },
      }}
    />
  );
};
