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

export async function renderVideo({ jobId, brandAssets, script, compositionId, jobs }: RenderOptions) {
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${jobId}.mp4`);
  const remotionRoot = path.join(__dirname, '../remotion');

  jobs[jobId] = { status: 'bundling', progress: 5 };

  const bundleLocation = await bundle({
    entryPoint: path.join(remotionRoot, 'index.ts'),
    webpackOverride: (config) => config,
  });

  jobs[jobId] = { status: 'rendering', progress: 20 };

  const inputProps = { brandAssets, script };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
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
