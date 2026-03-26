import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { renderVideo } from './renderer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const jobs: Record<string, { status: string; progress: number; videoUrl?: string; error?: string }> = {};

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'remotion-render-server' });
});

// Start a render job
app.post('/render', async (req, res) => {
  const { brandAssets, script, compositionId = 'MainVideo' } = req.body;

  if (!brandAssets || !script) {
    return res.status(400).json({ error: 'brandAssets and script are required' });
  }

  const jobId = uuidv4();
  jobs[jobId] = { status: 'queued', progress: 0 };

  res.json({ jobId, status: 'queued' });

  // Run render in background
  renderVideo({ jobId, brandAssets, script, compositionId, jobs }).catch((err) => {
    console.error(`Render failed for job ${jobId}:`, err);
    jobs[jobId] = { status: 'failed', progress: 0, error: err.message };
  });
});

// Check job status
app.get('/status/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ jobId: req.params.jobId, ...job });
});

// Serve rendered videos
app.use('/videos', express.static(path.join(__dirname, '../output')));

app.listen(PORT, () => {
  console.log(`🎬 Remotion render server running on port ${PORT}`);
});
