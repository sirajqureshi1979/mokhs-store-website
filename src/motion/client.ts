// Browser side: ask the server's Gemini endpoint for a motion script,
// and fall back to the built-in director if the AI is unavailable.
import { localDirector } from './localDirector';
import { sanitizeScript, type MotionScript } from './types';

export interface DirectorResult {
  script: MotionScript;
  source: 'gemini' | 'built-in';
  note?: string;
}

// Where the Gemini director lives. Same-origin server by default.
// On static hosting (GitHub Pages) set VITE_MOTION_API to an external endpoint,
// or set it to "off" to always use the built-in director.
const MOTION_API: string = import.meta.env.VITE_MOTION_API || '/api/motion';
const STATIC_HOST = /github\.io$/.test(location.hostname);

export async function directMotion(prompt: string): Promise<DirectorResult> {
  if (MOTION_API === 'off' || (STATIC_HOST && !import.meta.env.VITE_MOTION_API)) {
    return { script: localDirector(prompt), source: 'built-in' };
  }
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(MOTION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const script = sanitizeScript(data?.script);
    if (!script) throw new Error('empty script');
    return { script, source: 'gemini' };
  } catch (err) {
    return {
      script: localDirector(prompt),
      source: 'built-in',
      note: 'AI director offline — used the built-in director.',
    };
  } finally {
    window.clearTimeout(timer);
  }
}
