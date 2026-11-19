import * as THREE from 'three';

export interface ProceduralTextureSet {
  powerCapWhite: THREE.CanvasTexture;
  powerCapBlack: THREE.CanvasTexture;
  smallBottleLabel: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  pedestalCaustic: THREE.CanvasTexture;
  droplet: THREE.CanvasTexture;
  bubble: THREE.CanvasTexture;
  brushedBump: THREE.CanvasTexture;
  dispose: () => void;
}

function makePowerCapTexture(darkMode: boolean, maxAniso: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Outer brushed silver bezel
  const bezelGrad = ctx.createLinearGradient(0, 0, size, size);
  bezelGrad.addColorStop(0, '#eef3f8');
  bezelGrad.addColorStop(0.5, '#c5d0dc');
  bezelGrad.addColorStop(1, '#9ba8b8');
  ctx.fillStyle = bezelGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle recessed dark channel for LED ring
  ctx.beginPath();
  ctx.arc(cx, cy, 206, 0, Math.PI * 2);
  ctx.fillStyle = '#071b33';
  ctx.fill();

  // Glowing cyan ribbed LED ring segments (28 crisp radial dashes)
  const segments = 28;
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2 + 0.04;
    const a1 = ((i + 1) / segments) * Math.PI * 2 - 0.04;
    ctx.beginPath();
    ctx.arc(cx, cy, 174, a0, a1);
    ctx.lineWidth = 34;
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 174, a0 + 0.02, a1 - 0.02);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#cffafe';
    ctx.stroke();
  }

  // Center tactile button cap
  const btnGrad = ctx.createRadialGradient(cx - 28, cy - 28, 12, cx, cy, 138);
  if (darkMode) {
    btnGrad.addColorStop(0, '#272c35');
    btnGrad.addColorStop(1, '#11141a');
  } else {
    btnGrad.addColorStop(0, '#ffffff');
    btnGrad.addColorStop(1, '#e3ebf3');
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 136, 0, Math.PI * 2);
  ctx.fillStyle = btnGrad;
  ctx.fill();

  // Crisp metallic inner hairline ring
  ctx.beginPath();
  ctx.arc(cx, cy, 136, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.12)';
  ctx.stroke();

  // Power symbol (iconic coral red)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + 4, 48, -Math.PI * 0.32, Math.PI * 1.32);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - 58);
  ctx.lineTo(cx, cy - 6);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

function makeSmallBottleLabelTexture(maxAniso: number): THREE.CanvasTexture {
  const w = 1024;
  const h = 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#ecfdf5');
  bg.addColorStop(0.5, '#d1fae5');
  bg.addColorStop(1, '#a7f3d0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Decorative water wave ribbons
  ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  for (let x = 0; x <= w; x += 32) {
    ctx.lineTo(x, h * 0.62 + Math.sin((x / w) * Math.PI * 4) * 24);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  for (let x = 0; x <= w; x += 32) {
    ctx.lineTo(x, h * 0.78 + Math.cos((x / w) * Math.PI * 4) * 16);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Top & bottom trim lines
  ctx.fillStyle = '#059669';
  ctx.fillRect(0, 0, w, 12);
  ctx.fillRect(0, h - 12, w, 12);

  // Clean mineral water typography on front side
  ctx.fillStyle = '#064e3b';
  ctx.font = '700 44px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PURE SPRING', w * 0.25, 134);
  ctx.fillText('PURE SPRING', w * 0.75, 134);

  ctx.fillStyle = '#047857';
  ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
  ctx.fillText('NATURAL MINERAL · 1.5 L', w * 0.25, 184);
  ctx.fillText('NATURAL MINERAL · 1.5 L', w * 0.75, 184);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makeContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 4, 12, 0.72)');
  grad.addColorStop(0.45, 'rgba(0, 8, 22, 0.36)');
  grad.addColorStop(0.78, 'rgba(0, 12, 30, 0.10)');
  grad.addColorStop(1, 'rgba(0, 12, 30, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makePedestalCausticTexture(maxAniso: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  const glow = ctx.createRadialGradient(c, c, 10, c, c, 248);
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
  glow.addColorStop(0.48, 'rgba(14, 116, 204, 0.08)');
  glow.addColorStop(0.82, 'rgba(14, 116, 204, 0.02)');
  glow.addColorStop(1, 'rgba(3, 11, 23, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // Precision studio measurement rings
  const rings = [86, 148, 210, 244];
  rings.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      idx === 2 ? 'rgba(56, 189, 248, 0.24)' : 'rgba(148, 210, 255, 0.10)';
    ctx.lineWidth = idx === 2 ? 2 : 1;
    ctx.stroke();
  });

  // Subtle cross ticks
  ctx.strokeStyle = 'rgba(148, 210, 255, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * 195, c + Math.sin(a) * 195);
    ctx.lineTo(c + Math.cos(a) * 224, c + Math.sin(a) * 224);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

function makeDropletTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(28, 26, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(165, 243, 252, 0.9)');
  grad.addColorStop(0.75, 'rgba(56, 189, 248, 0.35)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeBubbleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.strokeStyle = 'rgba(186, 230, 253, 0.78)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(32, 32, 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(23, 22, 4.5, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeBrushedMetalBumpTexture(maxAniso: number): THREE.CanvasTexture {
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    const shade = 112 + Math.floor(Math.sin(y * 0.9) * 14 + (Math.random() - 0.5) * 24);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, w, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = maxAniso;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTextures(maxAniso: number): ProceduralTextureSet {
  const powerCapWhite = makePowerCapTexture(false, maxAniso);
  const powerCapBlack = makePowerCapTexture(true, maxAniso);
  const smallBottleLabel = makeSmallBottleLabelTexture(maxAniso);
  const contactShadow = makeContactShadowTexture();
  const pedestalCaustic = makePedestalCausticTexture(maxAniso);
  const droplet = makeDropletTexture();
  const bubble = makeBubbleTexture();
  const brushedBump = makeBrushedMetalBumpTexture(maxAniso);

  return {
    powerCapWhite,
    powerCapBlack,
    smallBottleLabel,
    contactShadow,
    pedestalCaustic,
    droplet,
    bubble,
    brushedBump,
    dispose() {
      powerCapWhite.dispose();
      powerCapBlack.dispose();
      smallBottleLabel.dispose();
      contactShadow.dispose();
      pedestalCaustic.dispose();
      droplet.dispose();
      bubble.dispose();
      brushedBump.dispose();
    },
  };
}
