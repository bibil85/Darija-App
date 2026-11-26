import * as THREE from 'three';

/**
 * Procedural offscreen CanvasTexture generator for tactile "Nintendo / Pixar Toy-Box" surfaces.
 * Generates cached bump/color textures with zero external image requests (100% offline-safe).
 */
export class TextureGenerator {
  private static cache = new Map<string, THREE.CanvasTexture>();

  private static createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    return [canvas, ctx];
  }

  /** Soft sculpted clay / toy-plastic micro-grain bump map */
  static getClayBump(): THREE.CanvasTexture {
    const key = 'clay_bump';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 256;
    const [canvas, ctx] = this.createCanvas(size);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Soft organic dappled speckles for tactile toy surface
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 4;
      const v = Math.floor(112 + Math.random() * 34);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    this.cache.set(key, tex);
    return tex;
  }

  /** Warm painted wooden toy grain texture (for chairs, tables, doors, baskets) */
  static getWoodBump(): THREE.CanvasTexture {
    const key = 'wood_bump';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 256;
    const [canvas, ctx] = this.createCanvas(size);
    ctx.fillStyle = '#7e7e7e';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 3) {
      const shade = Math.floor(110 + Math.sin(y * 0.18) * 16 + Math.random() * 14);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, size, 2.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    this.cache.set(key, tex);
    return tex;
  }

  /** Woven Moroccan basket pattern bump texture */
  static getWovenBump(): THREE.CanvasTexture {
    const key = 'woven_bump';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 128;
    const [canvas, ctx] = this.createCanvas(size);
    ctx.fillStyle = '#606060';
    ctx.fillRect(0, 0, size, size);

    const step = 16;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const even = ((x / step + y / step) % 2) === 0;
        ctx.fillStyle = even ? '#c8c8c8' : '#909090';
        ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    this.cache.set(key, tex);
    return tex;
  }

  /** Authentic Moroccan Zellige geometric star tile color texture (for courtyard plaza & Memory tiles) */
  static getZelligeTileTexture(): THREE.CanvasTexture {
    const key = 'zellige_color';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 256;
    const [canvas, ctx] = this.createCanvas(size);

    // Majorelle blue ceramic base
    ctx.fillStyle = '#1D5FD1';
    ctx.fillRect(0, 0, size, size);

    // Subtle glaze sheen
    const grad = ctx.createRadialGradient(90, 80, 10, 128, 128, 170);
    grad.addColorStop(0, 'rgba(255,255,255,0.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Cream border inlay
    ctx.strokeStyle = '#FFF7E6';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // 8-point Moroccan star in saffron & mint tile
    const drawSquare = (rot: number, fill: string, r: number) => {
      ctx.save();
      ctx.translate(128, 128);
      ctx.rotate(rot);
      ctx.fillStyle = fill;
      ctx.strokeStyle = '#FFF7E6';
      ctx.lineWidth = 6;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    };
    drawSquare(0, '#14A392', 58);
    drawSquare(Math.PI / 4, '#F59E0B', 58);

    // Center terracotta medallion
    ctx.fillStyle = '#E5633B';
    ctx.beginPath();
    ctx.arc(128, 128, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFF7E6';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(128, 128, 12, 0, Math.PI * 2);
    ctx.fill();

    // Corner saffron diamonds
    const corners = [
      [34, 34],
      [222, 34],
      [34, 222],
      [222, 222],
    ];
    ctx.fillStyle = '#FBBF24';
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx - 12, cy);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.cache.set(key, tex);
    return tex;
  }

  /** Warm sunlit sand/terracotta courtyard ground texture */
  static getCourtyardGroundTexture(): THREE.CanvasTexture {
    const key = 'courtyard_ground';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 512;
    const [canvas, ctx] = this.createCanvas(size);

    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0, '#F5D69E');
    grad.addColorStop(0.55, '#EAB971');
    grad.addColorStop(1, '#D6984E');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Soft mosaic ring inlays
    ctx.strokeStyle = 'rgba(29, 95, 209, 0.22)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(20, 163, 146, 0.24)';
    ctx.lineWidth = 5;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.arc(256, 256, 195, 0, Math.PI * 2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  /** Crisp 3D Numeral Badge CanvasTexture for Numbers 1–10 */
  static getNumberBadgeTexture(num: number, bgHex: string): THREE.CanvasTexture {
    const key = `num_${num}_${bgHex}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 256;
    const [canvas, ctx] = this.createCanvas(size);
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, size, size);

    // Subtle specular dome highlight
    const grad = ctx.createRadialGradient(90, 75, 10, 128, 128, 150);
    grad.addColorStop(0, 'rgba(255,255,255,0.38)');
    grad.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Crisp white border ring
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(128, 128, 108, 0, Math.PI * 2);
    ctx.stroke();

    // Chunky numeral
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${num === 10 ? 116 : 136}px Fredoka, Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;
    ctx.fillText(String(num), 128, 134);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  static disposeAll() {
    this.cache.forEach((tex) => tex.dispose());
    this.cache.clear();
  }
}
