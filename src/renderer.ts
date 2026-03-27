import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

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

interface RenderOptions {
  jobId: string;
  brandAssets: BrandAssets;
  script: { scenes: Scene[]; totalDurationInFrames?: number };
  compositionId: string;
  jobs: Record<string, { status: string; progress: number; videoUrl?: string; error?: string }>;
}

// Clamp durationInFrames to max 60 per scene to keep memory low
function clampScript(script: { scenes: Scene[] }) {
  return {
    ...script,
    scenes: script.scenes.map(scene => ({
      ...scene,
      durationInFrames: Math.min(scene.durationInFrames || 60, 60),
    })),
  };
}

export async function renderVideo({ jobId, brandAssets, script, compositionId, jobs }: RenderOptions) {
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${jobId}.mp4`);
  const remotionRoot = path.join(__dirname, '../remotion');

  // Cap scenes to avoid OOM on free Railway tier
  const clampedScript = clampScript(script);

  jobs[jobId] = { status: 'bundling', progress: 5 };

  const bundleLocation = await bundle({
    entryPoint: path.join(remotionRoot, 'index.ts'),
    webpackOverride: (config) => config,
  });

  jobs[jobId] = { status: 'rendering', progress: 20 };

  const inputProps = { brandAssets, script: clampedScript };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  await renderMedia({
    composition: {
      ...composition,
      width: 1280,
      height: 720,
    },
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    // Single concurrency = much lower RAM usage
    concurrency: 1,
    // Disable audio to further reduce memory pressure
    muted: false,
    onProgress: ({ progress }) => {
      jobs[jobId] = {
        status: 'rendering',
        progress: Math.round(20 + progress * 75),
      };
    },
  });

  const videoUrl = `/videos/${jobId}.mp4`;
  jobs[jobId] = { status: 'done', progress: 100, videoUrl };

  console.log(`✅ Render complete for job ${jobId}: ${videoUrl}`);
}
