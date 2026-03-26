# Remotion Render Server

A Node.js server that renders programmatic videos using Remotion, built for the Video SaaS pipeline.

## Endpoints

- `GET /` — Health check
- `POST /render` — Start a render job
- `GET /status/:jobId` — Check render progress
- `GET /videos/:jobId.mp4` — Download rendered video

## POST /render payload

```json
{
  "brandAssets": {
    "logoUrl": "https://...",
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "backgroundColor": "#0f0f0f",
    "fontFamily": "Inter",
    "companyName": "Acme Inc",
    "websiteUrl": "https://acme.com"
  },
  "script": {
    "scenes": [
      { "type": "intro", "heading": "Welcome to Acme", "durationInFrames": 90 },
      { "type": "feature", "heading": "Our Product", "body": "Description here", "durationInFrames": 120 },
      { "type": "cta", "heading": "Get Started", "body": "Sign up today", "durationInFrames": 90 },
      { "type": "outro", "heading": "Thank You", "durationInFrames": 60 }
    ]
  }
}
```

## Deploy on Railway

1. Connect this repo to Railway
2. Railway will auto-detect the Dockerfile and build it
3. Set `PORT` env var if needed (defaults to 3000)
