// MOKHS site server: serves the React app and the Motion AI endpoint.
// The Gemini API key stays on the server and is never sent to the browser.
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { MOTION_SYSTEM_PROMPT, sanitizeScript } from './src/motion/types';

dotenv.config({ path: ['.env.local', '.env'] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

// Simple per-IP limit: 12 AI requests per minute
const hits = new Map<string, number[]>();
function allowed(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (list.length >= 12) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

async function main() {
  const app = express();
  app.use(express.json({ limit: '8kb' }));

  app.post('/api/motion', async (req, res) => {
    const prompt = String(req.body?.prompt ?? '').trim().slice(0, 400);
    if (!prompt) return res.status(400).json({ error: 'empty prompt' });
    if (!ai) return res.status(503).json({ error: 'AI director not configured' });
    if (!allowed(req.ip || 'x')) return res.status(429).json({ error: 'Too many requests, try again in a minute' });

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          systemInstruction: MOTION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });
      const text = response.text ?? '';
      const script = sanitizeScript(JSON.parse(text));
      if (!script) return res.status(502).json({ error: 'AI returned no playable shots' });
      res.json({ script, model: MODEL });
    } catch (err) {
      console.error('[motion-ai]', err);
      res.status(502).json({ error: 'AI director failed' });
    }
  });

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(__dirname, 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      const index = path.join(dist, 'index.html');
      if (fs.existsSync(index)) res.sendFile(index);
      else res.status(404).send('Run "npm run build" first.');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MOKHS site on http://localhost:${PORT}  (Motion AI: ${ai ? MODEL : 'built-in director only'})`);
  });
}

main();
