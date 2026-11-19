// Records the 3D motion as a downloadable video (Reel 9:16 or Wide 16:9).
// The WebGL frame is composited with background, captions and the MOKHS mark
// on a 2D canvas right after each render, so no preserveDrawingBuffer is needed.

export type ReelFormat = 'reel' | 'wide';

export interface RecordingResult {
  url: string;
  blob: Blob;
  ext: 'mp4' | 'webm';
  seconds: number;
}

const MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

export function recordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}

// MOKHS cube mark (same paths as the logo, 200x200 box)
const MARK_PATHS: Array<[string, string]> = [
  ['M100 8L184 56L100 104L16 56Z', '#5fd8ff'],
  ['M16 56L100 104V196L16 148Z', '#1f86ff'],
  ['M184 56L100 104V196L184 148Z', '#3a3fe0'],
];

export class ReelRecorder {
  readonly format: ReelFormat;
  private out: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private mime = '';
  private startedAt = 0;
  private marks: Array<[Path2D, string]>;
  private mStroke: Path2D;

  constructor(format: ReelFormat) {
    this.format = format;
    this.out = document.createElement('canvas');
    if (format === 'reel') {
      this.out.width = 720;
      this.out.height = 1280;
    } else {
      this.out.width = 1280;
      this.out.height = 720;
    }
    this.ctx = this.out.getContext('2d')!;
    this.marks = MARK_PATHS.map(([d, c]) => [new Path2D(d), c]);
    this.mStroke = new Path2D('M44 152V86L100 122L156 86V152');
  }

  start() {
    const stream = this.out.captureStream(30);
    this.mime = MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    this.recorder = new MediaRecorder(
      stream,
      this.mime ? { mimeType: this.mime, videoBitsPerSecond: 6_000_000 } : undefined,
    );
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) this.chunks.push(e.data);
    };
    this.recorder.start(250);
    this.startedAt = performance.now();
  }

  /** Called by the engine right after each WebGL render. */
  drawFrame(src: HTMLCanvasElement, caption: string, progress: number) {
    const { ctx, out } = this;
    const W = out.width;
    const H = out.height;

    // Background (matches the website's water theme)
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#062048');
    bg.addColorStop(0.55, '#030b17');
    bg.addColorStop(1, '#01060e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 10, W * 0.5, H * 0.42, Math.max(W, H) * 0.6);
    glow.addColorStop(0, 'rgba(34,199,255,0.22)');
    glow.addColorStop(1, 'rgba(34,199,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Centre-crop the WebGL frame to the target aspect
    const sw = src.width;
    const sh = src.height;
    if (sw && sh) {
      const target = W / H;
      let cw = sw;
      let ch = sw / target;
      if (ch > sh) {
        ch = sh;
        cw = sh * target;
      }
      ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H);
    }

    // Cinematic letterbox bars
    const bar = Math.round(H * 0.06);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);

    // Watermark: cube mark + MOKHS
    const ms = Math.round(Math.min(W, H) * 0.075);
    ctx.save();
    ctx.translate(Math.round(W * 0.05), bar + Math.round(H * 0.025));
    ctx.scale(ms / 200, ms / 200);
    for (const [p, c] of this.marks) {
      ctx.fillStyle = c;
      ctx.fill(p);
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 17;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(this.mStroke);
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(ms * 0.42)}px Outfit, Arial, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText('MOKHS', Math.round(W * 0.05) + ms + 12, bar + Math.round(H * 0.025) + ms * 0.42);
    ctx.fillStyle = '#7fe6ff';
    ctx.font = `700 ${Math.round(ms * 0.22)}px Outfit, Arial, sans-serif`;
    ctx.fillText('AQUA', Math.round(W * 0.05) + ms + 12, bar + Math.round(H * 0.025) + ms * 0.8);

    // Caption
    if (caption) {
      const fs = Math.round(Math.min(W, H) * (this.format === 'reel' ? 0.06 : 0.05));
      ctx.font = `800 ${fs}px Outfit, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const lines = wrap(ctx, caption, W * 0.86);
      const lh = fs * 1.18;
      const y0 = H - bar - Math.round(H * 0.06) - (lines.length - 1) * lh;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffffff';
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2, y0 + i * lh));
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    // Progress line inside the bottom bar
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(Math.round(W * 0.05), H - Math.round(bar / 2) - 2, Math.round(W * 0.9), 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(Math.round(W * 0.05), H - Math.round(bar / 2) - 2, Math.round(W * 0.9 * progress), 4);
  }

  stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      const rec = this.recorder;
      if (!rec) {
        reject(new Error('not recording'));
        return;
      }
      rec.onstop = () => {
        const type = this.mime || 'video/webm';
        const blob = new Blob(this.chunks, { type });
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          ext: type.includes('mp4') ? 'mp4' : 'webm',
          seconds: (performance.now() - this.startedAt) / 1000,
        });
      };
      try {
        rec.stop();
      } catch (e) {
        reject(e);
      }
      rec.stream.getTracks().forEach((t) => t.stop());
    });
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
