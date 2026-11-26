import * as THREE from 'three';

export interface PBRTextureSet {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

/**
 * Procedural Offscreen 2D Canvas Texture Generator for the Moroccan Kasbah & Riad Courtyard.
 * 100% self-contained & offline-safe — zero external texture URLs.
 * Generates cached PBR albedo, bump, and roughness maps for:
 * - Authentic Moroccan Zellige geometric mosaic tiles (cobalt, emerald, saffron, ivory)
 * - Sun-baked Pisé (rammed-earth) adobe plaster walls
 * - Sebka diamond blind-arcade relief latticework
 * - Sunlit Riad courtyard terracotta & zellige floor
 * - Segmented Date Palm bark & wind-rippled desert sand
 */
export class ZelligeTextureGenerator {
  private static textureCache = new Map<string, THREE.CanvasTexture>();
  private static setCache = new Map<string, PBRTextureSet>();

  private static makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    return [canvas, ctx];
  }

  private static finalizeTexture(
    canvas: HTMLCanvasElement,
    repeatX: number,
    repeatY: number,
    isColor: boolean
  ): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = 4;
    if (isColor) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    return tex;
  }

  /**
   * 1. Authentic Moroccan Zellige Geometric Mosaic (Color + Matching Roughness + Grout Bump)
   * Cobalt Majorelle blue, emerald green, saffron gold, terracotta, and warm ivory 8-point stars.
   */
  static getZelligeMosaicMaps(repeatX = 3, repeatY = 1): PBRTextureSet {
    const key = `zellige_mosaic_${repeatX}_${repeatY}`;
    if (this.setCache.has(key)) return this.setCache.get(key)!;

    const size = 512;
    const [colCanvas, col] = this.makeCanvas(size);
    const [roughCanvas, rough] = this.makeCanvas(size);
    const [bumpCanvas, bump] = this.makeCanvas(size);

    // Warm ivory mortar base
    col.fillStyle = '#F7EED8';
    col.fillRect(0, 0, size, size);
    // Grout is matte (high roughness ~215) & recessed (dark bump ~60)
    rough.fillStyle = '#D8D8D8';
    rough.fillRect(0, 0, size, size);
    bump.fillStyle = '#404040';
    bump.fillRect(0, 0, size, size);

    const drawTilePoly = (
      pts: Array<[number, number]>,
      fillHex: string,
      roughShade = '#2C2C2C',
      bumpShade = '#DFDFDF'
    ) => {
      const trace = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.closePath();
      };

      trace(col);
      col.fillStyle = fillHex;
      col.fill();
      col.strokeStyle = '#EFE3C8';
      col.lineWidth = 3.5;
      col.stroke();

      trace(rough);
      rough.fillStyle = roughShade; // glazed ceramic tile = low roughness (glossy!)
      rough.fill();
      rough.strokeStyle = '#DCDCDC';
      rough.lineWidth = 4;
      rough.stroke();

      trace(bump);
      bump.fillStyle = bumpShade; // raised tile face
      bump.fill();
      bump.strokeStyle = '#383838';
      bump.lineWidth = 4;
      bump.stroke();
    };

    const drawEightPointStar = (cx: number, cy: number, outerR: number, innerR: number, fillHex: string) => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      drawTilePoly(pts, fillHex);
    };

    const cell = 128;
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const cx = gx * cell + cell / 2;
        const cy = gy * cell + cell / 2;
        const even = (gx + gy) % 2 === 0;

        // Octagonal tile field behind star
        const octPts: Array<[number, number]> = [];
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
          octPts.push([cx + Math.cos(a) * 58, cy + Math.sin(a) * 58]);
        }
        drawTilePoly(octPts, even ? '#1D5FD1' : '#0E8F7B', '#323232');

        // Radiant 8-pointed Moroccan star in center
        drawEightPointStar(cx, cy, 44, 24, even ? '#F59E0B' : '#FFF7E6');

        // Inner jewel rosette
        drawEightPointStar(cx, cy, 20, 12, even ? '#0F8B78' : '#D95F38');

        // Corner interlocking emerald/cobalt cross petals
        const corners: Array<[number, number]> = [
          [gx * cell, gy * cell],
          [(gx + 1) * cell, gy * cell],
          [gx * cell, (gy + 1) * cell],
          [(gx + 1) * cell, (gy + 1) * cell],
        ];
        for (const [kx, ky] of corners) {
          drawTilePoly(
            [
              [kx, ky - 20],
              [kx + 20, ky],
              [kx, ky + 20],
              [kx - 20, ky],
            ],
            even ? '#14A392' : '#1D5FD1',
            '#2A2A2A'
          );
        }
      }
    }

    // Subtle hand-cut ceramic glaze sheen variation across tiles
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 6 + Math.random() * 14;
      col.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)';
      col.beginPath();
      col.arc(x, y, r, 0, Math.PI * 2);
      col.fill();
    }

    const set: PBRTextureSet = {
      map: this.finalizeTexture(colCanvas, repeatX, repeatY, true),
      bumpMap: this.finalizeTexture(bumpCanvas, repeatX, repeatY, false),
      roughnessMap: this.finalizeTexture(roughCanvas, repeatX, repeatY, false),
    };
    this.setCache.set(key, set);
    return set;
  }

  /**
   * 2. Sun-Baked Moroccan Pisé (Rammed-Earth / Adobe) Plaster Maps
   * Warm terracotta-ochre layering with fine plaster grain so Kasbah walls look authentic & tactile.
   */
  static getPisePlasterMaps(baseHex = '#DF8B5E', repeatX = 2, repeatY = 2): PBRTextureSet {
    const key = `pise_${baseHex}_${repeatX}_${repeatY}`;
    if (this.setCache.has(key)) return this.setCache.get(key)!;

    const size = 512;
    const [colCanvas, col] = this.makeCanvas(size);
    const [bumpCanvas, bump] = this.makeCanvas(size);
    const [roughCanvas, rough] = this.makeCanvas(size);

    col.fillStyle = baseHex;
    col.fillRect(0, 0, size, size);
    bump.fillStyle = '#808080';
    bump.fillRect(0, 0, size, size);
    rough.fillStyle = '#C6C6C6'; // matte sun-baked earthen plaster (~0.78 roughness)
    rough.fillRect(0, 0, size, size);

    // Horizontal rammed-earth (pisé) compaction strata bands
    for (let y = 0; y < size; y += 32) {
      const warmShift = (Math.sin(y * 0.08) + 1) * 0.5;
      col.fillStyle = warmShift > 0.5 ? 'rgba(255, 224, 178, 0.09)' : 'rgba(130, 52, 24, 0.08)';
      col.fillRect(0, y, size, 16 + Math.random() * 14);

      // Subtle timber-form seam line
      col.fillStyle = 'rgba(110, 44, 18, 0.11)';
      col.fillRect(0, y, size, 2);
      bump.fillStyle = '#626262';
      bump.fillRect(0, y, size, 3);
    }

    // Soft sunlit ochre plaster mottling & trowel strokes
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 8 + Math.random() * 28;
      col.fillStyle =
        Math.random() > 0.48 ? 'rgba(255, 232, 196, 0.07)' : 'rgba(154, 65, 32, 0.06)';
      col.beginPath();
      col.arc(x, y, r, 0, Math.PI * 2);
      col.fill();

      const rv = Math.floor(175 + Math.random() * 55);
      rough.fillStyle = `rgb(${rv},${rv},${rv})`;
      rough.beginPath();
      rough.arc(x, y, r * 0.8, 0, Math.PI * 2);
      rough.fill();
    }

    // Fine sandy plaster micro-grain in bump map
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 1 + Math.random() * 2.6;
      const bv = Math.floor(102 + Math.random() * 52);
      bump.fillStyle = `rgb(${bv},${bv},${bv})`;
      bump.fillRect(x, y, s, s);
    }

    const set: PBRTextureSet = {
      map: this.finalizeTexture(colCanvas, repeatX, repeatY, true),
      bumpMap: this.finalizeTexture(bumpCanvas, repeatX, repeatY, false),
      roughnessMap: this.finalizeTexture(roughCanvas, repeatX, repeatY, false),
    };
    this.setCache.set(key, set);
    return set;
  }

  /**
   * 3. Decorative Moroccan Sebka Diamond Lattice Relief (Color + Bump) for Upper Kasbah Towers
   */
  static getSebkaReliefMaps(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
    const key = 'sebka_relief';
    if (this.textureCache.has(`${key}_col`) && this.textureCache.has(`${key}_bump`)) {
      return {
        map: this.textureCache.get(`${key}_col`)!,
        bumpMap: this.textureCache.get(`${key}_bump`)!,
      };
    }

    const size = 256;
    const [colCanvas, col] = this.makeCanvas(size);
    const [bumpCanvas, bump] = this.makeCanvas(size);

    col.fillStyle = '#C96F43';
    col.fillRect(0, 0, size, size);
    bump.fillStyle = '#505050';
    bump.fillRect(0, 0, size, size);

    const step = 32;
    for (let y = -step; y <= size + step; y += step) {
      for (let x = -step; x <= size + step; x += step) {
        const ox = (Math.floor(y / step) % 2) * (step / 2);
        const cx = x + ox;
        const cy = y;

        // Scalloped sebka diamond lozenge
        const drawLozenge = (ctx: CanvasRenderingContext2D, stroke: string, lw: number) => {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(cx, cy - step * 0.58);
          ctx.quadraticCurveTo(cx + step * 0.34, cy - step * 0.14, cx + step * 0.44, cy);
          ctx.quadraticCurveTo(cx + step * 0.34, cy + step * 0.14, cx, cy + step * 0.58);
          ctx.quadraticCurveTo(cx - step * 0.34, cy + step * 0.14, cx - step * 0.44, cy);
          ctx.quadraticCurveTo(cx - step * 0.34, cy - step * 0.14, cx, cy - step * 0.58);
          ctx.closePath();
          ctx.stroke();
        };

        drawLozenge(col, '#F7DFBE', 4.2);
        drawLozenge(bump, '#EAEAEA', 5.0);
      }
    }

    const map = this.finalizeTexture(colCanvas, 2, 2, true);
    const bumpMap = this.finalizeTexture(bumpCanvas, 2, 2, false);
    this.textureCache.set(`${key}_col`, map);
    this.textureCache.set(`${key}_bump`, bumpMap);
    return { map, bumpMap };
  }

  /**
   * 4. Sunlit Riad Courtyard Flagstone & Zellige Border Plaza Texture
   */
  static getRiadCourtyardFloor(): THREE.CanvasTexture {
    const key = 'riad_courtyard_floor';
    if (this.textureCache.has(key)) return this.textureCache.get(key)!;

    const size = 512;
    const [canvas, ctx] = this.makeCanvas(size);

    // Warm sunlit golden-sand stone gradient
    const grad = ctx.createRadialGradient(256, 256, 35, 256, 256, 256);
    grad.addColorStop(0, '#F7DFB0');
    grad.addColorStop(0.52, '#ECC482');
    grad.addColorStop(1, '#D89E54');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle stone grid flagstones
    ctx.strokeStyle = 'rgba(161, 98, 43, 0.14)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Concentric Moroccan zellige medallion paths framing the courtyard stage
    ctx.strokeStyle = 'rgba(29, 95, 209, 0.28)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(256, 256, 138, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(15, 139, 120, 0.30)';
    ctx.lineWidth = 6;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.arc(256, 256, 156, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(229, 99, 59, 0.22)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(256, 256, 204, 0, Math.PI * 2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.textureCache.set(key, tex);
    return tex;
  }

  /**
   * 5. Ring-Textured Date Palm Bark (Color + Bump)
   */
  static getPalmBarkMaps(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
    const key = 'palm_bark';
    if (this.textureCache.has(`${key}_col`) && this.textureCache.has(`${key}_bump`)) {
      return {
        map: this.textureCache.get(`${key}_col`)!,
        bumpMap: this.textureCache.get(`${key}_bump`)!,
      };
    }

    const size = 256;
    const [colCanvas, col] = this.makeCanvas(size);
    const [bumpCanvas, bump] = this.makeCanvas(size);

    col.fillStyle = '#8C5228';
    col.fillRect(0, 0, size, size);
    bump.fillStyle = '#787878';
    bump.fillRect(0, 0, size, size);

    // Distinct horizontal frond-scar rings characteristic of Moroccan date palms
    for (let y = 0; y < size; y += 16) {
      col.fillStyle = '#6B3B1A';
      col.fillRect(0, y, size, 4);
      col.fillStyle = '#A86A3B';
      col.fillRect(0, y + 4, size, 6);

      bump.fillStyle = '#3A3A3A';
      bump.fillRect(0, y, size, 4);
      bump.fillStyle = '#D8D8D8';
      bump.fillRect(0, y + 4, size, 7);

      // Diamond leaf-base texture along each ring
      for (let x = 0; x < size; x += 24) {
        const ox = ((y / 16) % 2) * 12;
        col.fillStyle = 'rgba(72, 36, 14, 0.35)';
        col.beginPath();
        col.moveTo(x + ox, y + 14);
        col.lineTo(x + ox + 12, y + 4);
        col.lineTo(x + ox + 24, y + 14);
        col.closePath();
        col.fill();
      }
    }

    const map = this.finalizeTexture(colCanvas, 1, 5, true);
    const bumpMap = this.finalizeTexture(bumpCanvas, 1, 5, false);
    this.textureCache.set(`${key}_col`, map);
    this.textureCache.set(`${key}_bump`, bumpMap);
    return { map, bumpMap };
  }

  /**
   * 6. Wind-Rippled Desert Sand Dune Bump Map
   */
  static getSandRippleBump(): THREE.CanvasTexture {
    const key = 'sand_ripple_bump';
    if (this.textureCache.has(key)) return this.textureCache.get(key)!;

    const size = 256;
    const [canvas, ctx] = this.makeCanvas(size);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      const wave = Math.sin((y / size) * Math.PI * 16) * 28;
      const v = Math.max(40, Math.min(220, Math.floor(128 + wave)));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 1);
    }

    const tex = this.finalizeTexture(canvas, 6, 6, false);
    this.textureCache.set(key, tex);
    return tex;
  }

  static disposeAll() {
    this.textureCache.forEach((t) => t.dispose());
    this.textureCache.clear();
    this.setCache.forEach((s) => {
      s.map.dispose();
      s.bumpMap.dispose();
      s.roughnessMap.dispose();
    });
    this.setCache.clear();
  }
}
