import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface BrandAssets {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  companyName?: string;
  websiteUrl?: string;
}

interface Scene {
  type: 'intro' | 'feature' | 'cta' | 'outro';
  heading: string;
  body?: string;
  durationInFrames?: number;
}

interface MainVideoProps {
  brandAssets: BrandAssets;
  script: { scenes: Scene[] };
}

const FadeInText: React.FC<{ text: string; delay?: number; fontSize?: number; color?: string }> = ({
  text, delay = 0, fontSize = 64, color = '#ffffff'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const translateY = interpolate(frame - delay, [0, 20], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, fontSize, color, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
      {text}
    </div>
  );
};

const SceneSlide: React.FC<{ scene: Scene; brand: BrandAssets }> = ({ scene, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bg = brand.backgroundColor || '#0f0f0f';
  const primary = brand.primaryColor || '#6366f1';
  const secondary = brand.secondaryColor || '#8b5cf6';

  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: scene.type === 'intro'
          ? `linear-gradient(135deg, ${bg} 0%, ${primary}33 100%)`
          : scene.type === 'cta'
          ? `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
          : bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        opacity: bgOpacity,
        fontFamily: brand.fontFamily || 'Inter, sans-serif',
      }}
    >
      {/* Accent bar */}
      <div style={{
        width: '80px', height: '4px',
        background: scene.type === 'cta' ? '#ffffff' : primary,
        marginBottom: '32px',
        borderRadius: '2px',
      }} />

      <FadeInText
        text={scene.heading}
        delay={10}
        fontSize={scene.type === 'intro' ? 96 : 72}
        color={scene.type === 'cta' ? '#ffffff' : '#ffffff'}
      />

      {scene.body && (
        <div style={{ marginTop: '32px' }}>
          <FadeInText
            text={scene.body}
            delay={20}
            fontSize={36}
            color={scene.type === 'cta' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)'}
          />
        </div>
      )}

      {scene.type === 'intro' && brand.companyName && (
        <div style={{ marginTop: '48px' }}>
          <FadeInText
            text={brand.companyName}
            delay={30}
            fontSize={28}
            color={primary}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC<MainVideoProps> = ({ brandAssets, script }) => {
  const scenes = script.scenes;

  return (
    <Series>
      {scenes.map((scene, i) => (
        <Series.Sequence key={i} durationInFrames={scene.durationInFrames || 120}>
          <SceneSlide scene={scene} brand={brandAssets} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
