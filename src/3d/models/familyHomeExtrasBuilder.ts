import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { TextureGenerator } from '../../../engine/TextureGenerator.ts';
import { ArticulatedParts } from './types.ts';
import {
  addPart,
  addTrackingPixarFace,
  createBeveledStarGeometry,
  createLathedProfile,
  createLeafGeometry,
  createRoundedRectShape,
} from './geometryHelpers.ts';

/**
 * Bespoke Multi-Part Sculpted 3D Builders for Family, Home Objects, Colors, Body Parts & Numbers 1–10.
 * Every character/object exposes touch-tracking Pixar pupils and rich sculpted toy-box details.
 */
export function buildFamilyHomeExtrasModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): boolean {
  const buildPerson = (opts: {
    outfitHex: string;
    skinHex?: string;
    hairHex?: string;
    scale?: number;
    hasBun?: boolean;
    hasPigtails?: boolean;
    hasCap?: boolean;
    hasFez?: boolean;
    hasBeard?: boolean;
    hasGlasses?: boolean;
    hasPacifier?: boolean;
    goldTrim?: boolean;
  }) => {
    const s = opts.scale ?? 1;
    const outfitMat = MaterialLibrary.toy(opts.outfitHex, { clearcoat: 0.3 });
    const skinMat = MaterialLibrary.toy(opts.skinHex ?? '#F6C59F', { roughness: 0.4, clearcoat: 0.18 });
    const hairMat = MaterialLibrary.toy(opts.hairHex ?? '#3B2314', { roughness: 0.5 });

    // Lathed sculpted Moroccan kaftan / tunic body!
    const tunicGeo = createLathedProfile([
      [0.01, 0.02], [0.42 * s, 0.04], [0.38 * s, 0.36 * s], [0.27 * s, 0.68 * s], [0.16 * s, 0.74 * s],
    ], 20);
    addPart(container, tunicGeo, outfitMat);

    if (opts.goldTrim) {
      addPart(container, new THREE.BoxGeometry(0.08 * s, 0.52 * s, 0.06 * s), MaterialLibrary.gold(), [0, 0.38 * s, 0.34 * s]);
    }

    // Articulated arms
    addPart(container, new THREE.CapsuleGeometry(0.09 * s, 0.26 * s, 6, 10), outfitMat, [-0.36 * s, 0.44 * s, 0.05], [0, 0, 0.35]);
    addPart(container, new THREE.CapsuleGeometry(0.09 * s, 0.26 * s, 6, 10), outfitMat, [0.36 * s, 0.44 * s, 0.05], [0, 0, -0.35]);
    addPart(container, new THREE.SphereGeometry(0.08 * s, 10, 8), skinMat, [-0.46 * s, 0.3 * s, 0.07]);
    addPart(container, new THREE.SphereGeometry(0.08 * s, 10, 8), skinMat, [0.46 * s, 0.3 * s, 0.07]);

    const head = new THREE.Group();
    head.position.set(0, 1.0 * s, 0);
    container.add(head);
    parts.head = head;

    addPart(head, new THREE.SphereGeometry(0.38 * s, 22, 18), skinMat);
    // Little ears
    addPart(head, new THREE.SphereGeometry(0.09 * s, 10, 8), skinMat, [-0.37 * s, 0, 0]);
    addPart(head, new THREE.SphereGeometry(0.09 * s, 10, 8), skinMat, [0.37 * s, 0, 0]);

    if (!opts.hasPacifier) {
      addPart(head, new THREE.SphereGeometry(0.4 * s, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat, [0, 0.04 * s, -0.02], [-0.15, 0, 0]);
    } else {
      addPart(head, new THREE.TorusGeometry(0.08 * s, 0.03 * s, 8, 12, Math.PI * 1.4), hairMat, [0, 0.41 * s, 0.05]);
    }

    if (opts.hasBun) addPart(head, new THREE.SphereGeometry(0.18 * s, 14, 12), hairMat, [0, 0.44 * s, -0.14]);
    if (opts.hasPigtails) {
      const ribbonMat = MaterialLibrary.glossy('#F472B6');
      addPart(head, new THREE.SphereGeometry(0.18 * s, 12, 10), hairMat, [-0.42 * s, 0.1 * s, -0.06]);
      addPart(head, new THREE.SphereGeometry(0.18 * s, 12, 10), hairMat, [0.42 * s, 0.1 * s, -0.06]);
      addPart(head, new THREE.SphereGeometry(0.07 * s, 10, 8), ribbonMat, [-0.34 * s, 0.22 * s, 0.05]);
      addPart(head, new THREE.SphereGeometry(0.07 * s, 10, 8), ribbonMat, [0.34 * s, 0.22 * s, 0.05]);
    }
    if (opts.hasCap) {
      const capMat = MaterialLibrary.glossy('#EF4444');
      addPart(head, new THREE.SphereGeometry(0.41 * s, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), capMat, [0, 0.08 * s, 0]);
      addPart(head, new THREE.CylinderGeometry(0.32 * s, 0.34 * s, 0.05 * s, 14), capMat, [0, 0.16 * s, 0.24 * s], [0.15, 0, 0]);
    }
    if (opts.hasFez) {
      addPart(head, new THREE.CylinderGeometry(0.2 * s, 0.26 * s, 0.3 * s, 18), MaterialLibrary.toy('#DC2626'), [0, 0.45 * s, 0]);
      addPart(head, new THREE.CapsuleGeometry(0.03 * s, 0.18 * s, 6, 8), MaterialLibrary.toy('#1F2937'), [0.22 * s, 0.46 * s, 0.04], [0, 0, -0.25]);
    }
    if (opts.hasBeard) {
      addPart(head, new THREE.SphereGeometry(0.32 * s, 16, 12, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), hairMat, [0, -0.05 * s, 0.1 * s]);
    }
    if (opts.hasGlasses) {
      const frameMat = MaterialLibrary.gold('#475569');
      addPart(head, new THREE.TorusGeometry(0.11 * s, 0.02 * s, 8, 16), frameMat, [-0.15 * s, 0.04 * s, 0.38 * s]);
      addPart(head, new THREE.TorusGeometry(0.11 * s, 0.02 * s, 8, 16), frameMat, [0.15 * s, 0.04 * s, 0.38 * s]);
      addPart(head, new THREE.BoxGeometry(0.09 * s, 0.025 * s, 0.025 * s), frameMat, [0, 0.04 * s, 0.38 * s]);
    }
    if (opts.hasPacifier) {
      addPart(head, new THREE.SphereGeometry(0.08 * s, 10, 8), MaterialLibrary.glossy('#F472B6'), [0, -0.12 * s, 0.38 * s]);
      addPart(head, new THREE.TorusGeometry(0.06 * s, 0.02 * s, 8, 12), MaterialLibrary.glossy('#FBCFE8'), [0, -0.14 * s, 0.44 * s]);
    }

    addTrackingPixarFace(head, parts, {
      eyeY: 0.04 * s,
      eyeZ: 0.34 * s,
      eyeSpread: 0.15 * s,
      eyeScale: 0.72 * s,
      irisHex: '#451A03',
      smileY: -0.13 * s,
      smileZ: 0.36 * s,
    });
  };

  switch (wordId) {
    // ================= FAMILY =================
    case 'mama':
      buildPerson({ outfitHex: '#EC4899', hasBun: true, goldTrim: true });
      return true;
    case 'baba':
      buildPerson({ outfitHex: '#1D5FD1', skinHex: '#E8B288', hasBeard: true });
      return true;
    case 'brother':
      buildPerson({ outfitHex: '#14B8A6', scale: 0.9, hasCap: true });
      return true;
    case 'sister':
      buildPerson({ outfitHex: '#A855F7', scale: 0.9, hasPigtails: true });
      return true;
    case 'grandpa':
      buildPerson({ outfitHex: '#F59E0B', hairHex: '#E5E7EB', hasFez: true, hasGlasses: true, goldTrim: true });
      return true;
    case 'grandma':
      buildPerson({ outfitHex: '#FB7185', hairHex: '#E5E7EB', hasBun: true, hasGlasses: true, goldTrim: true });
      return true;
    case 'baby':
      buildPerson({ outfitHex: '#93C5FD', skinHex: '#FDE0C8', scale: 0.82, hasPacifier: true });
      return true;
    case 'friend': {
      const left = new THREE.Group();
      left.position.set(-0.34, 0, 0);
      const right = new THREE.Group();
      right.position.set(0.34, 0, 0);
      container.add(left, right);
      addPart(left, new THREE.CylinderGeometry(0.18, 0.28, 0.5, 16), MaterialLibrary.toy('#22C55E'), [0, 0.28, 0]);
      addPart(left, new THREE.SphereGeometry(0.28, 18, 16), MaterialLibrary.toy('#F6C59F'), [0, 0.72, 0]);
      addPart(right, new THREE.CylinderGeometry(0.18, 0.28, 0.5, 16), MaterialLibrary.toy('#F59E0B'), [0, 0.28, 0]);
      addPart(right, new THREE.SphereGeometry(0.28, 18, 16), MaterialLibrary.toy('#E4A87B'), [0, 0.72, 0]);
      addTrackingPixarFace(left, parts, { eyeY: 0.75, eyeZ: 0.25, eyeSpread: 0.1, eyeScale: 0.55, smileY: 0.64, smileZ: 0.26 });
      addTrackingPixarFace(right, {}, { eyeY: 0.75, eyeZ: 0.25, eyeSpread: 0.1, eyeScale: 0.55, smileY: 0.64, smileZ: 0.26 });
      return true;
    }

    // ================= AROUND ME / HOME =================
    case 'ball': {
      const body = new THREE.Group();
      body.position.set(0, 0.68, 0);
      container.add(body);
      parts.orbiters = body;

      addPart(body, new THREE.SphereGeometry(0.58, 26, 22), MaterialLibrary.glossy('#FFFFFF', 0.95));
      addPart(body, new THREE.TorusGeometry(0.57, 0.08, 10, 24), MaterialLibrary.glossy('#EF4444', 0.9), [0, 0, 0], [Math.PI / 2, 0, 0]);
      addPart(body, new THREE.TorusGeometry(0.57, 0.08, 10, 24), MaterialLibrary.glossy('#1D5FD1', 0.9), [0, 0, 0], [0, Math.PI / 2, 0]);
      addPart(body, createBeveledStarGeometry(0.22, 0.1, 0.06), MaterialLibrary.gold('#FBBF24'), [0, 0, 0.56]);
      return true;
    }

    case 'house': {
      const wallMat = MaterialLibrary.toy('#FFFBEB', { roughness: 0.55 });
      const roofMat = MaterialLibrary.toy('#E5633B', { roughness: 0.45 });
      const doorMat = MaterialLibrary.glossy('#1D5FD1', 0.85);
      const winMat = MaterialLibrary.glow('#BAE6FD', 0.4);

      const wallShape = createRoundedRectShape(1.06, 0.82, 0.08);
      const wallGeo = new THREE.ExtrudeGeometry(wallShape, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
      wallGeo.translate(0, 0.44, -0.45);
      addPart(container, wallGeo, wallMat);
      addPart(container, new THREE.ConeGeometry(0.88, 0.58, 4), roofMat, [0, 1.12, 0], [0, Math.PI / 4, 0]);
      // Seamless beveled Moroccan arch door!
      const arch = new THREE.Shape();
      arch.moveTo(-0.16, 0);
      arch.lineTo(0.16, 0);
      arch.lineTo(0.16, 0.36);
      arch.absarc(0, 0.36, 0.16, 0, Math.PI, false);
      const archGeo = new THREE.ExtrudeGeometry(arch, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015 });
      addPart(container, archGeo, doorMat, [0, 0.03, 0.45]);
      addPart(container, new THREE.BoxGeometry(0.2, 0.22, 0.06), winMat, [-0.32, 0.54, 0.48]);
      addPart(container, new THREE.BoxGeometry(0.2, 0.22, 0.06), winMat, [0.32, 0.54, 0.48]);
      return true;
    }

    case 'bed': {
      const woodMat = MaterialLibrary.toy('#92400E', { bump: 'wood' });
      const sheetMat = MaterialLibrary.toy('#FFFFFF');
      const blanketMat = MaterialLibrary.toy('#8B5CF6');
      const pillowMat = MaterialLibrary.toy('#FDE68A');

      addPart(container, new THREE.BoxGeometry(1.3, 0.28, 0.86), woodMat, [0, 0.24, 0]);
      addPart(container, new THREE.BoxGeometry(0.14, 0.86, 0.88), woodMat, [-0.62, 0.46, 0]);
      addPart(container, new THREE.BoxGeometry(0.12, 0.5, 0.88), woodMat, [0.62, 0.3, 0]);
      addPart(container, new THREE.BoxGeometry(1.16, 0.22, 0.78), sheetMat, [0, 0.44, 0]);
      addPart(container, new THREE.BoxGeometry(0.76, 0.25, 0.82), blanketMat, [0.18, 0.46, 0]);
      addPart(container, new THREE.CapsuleGeometry(0.14, 0.34, 8, 12), pillowMat, [-0.36, 0.6, 0], [Math.PI / 2, 0, 0]);
      return true;
    }

    case 'chair': {
      const woodMat = MaterialLibrary.toy('#D97706', { bump: 'wood', clearcoat: 0.35 });
      const cushionMat = MaterialLibrary.toy('#14A392');

      addPart(container, new THREE.BoxGeometry(0.76, 0.14, 0.72), woodMat, [0, 0.56, 0]);
      addPart(container, new THREE.BoxGeometry(0.68, 0.1, 0.64), cushionMat, [0, 0.66, 0]);
      addPart(container, new THREE.BoxGeometry(0.76, 0.68, 0.12), woodMat, [0, 0.96, -0.3]);
      for (const [lx, lz] of [[-0.3, -0.28], [0.3, -0.28], [-0.3, 0.28], [0.3, 0.28]] as const) {
        addPart(container, new THREE.CylinderGeometry(0.06, 0.05, 0.54, 10), woodMat, [lx, 0.28, lz]);
      }
      return true;
    }

    case 'book': {
      const coverMat = MaterialLibrary.glossy('#14B8A6', 0.62);
      const pageMat = MaterialLibrary.toy('#FFFBEB');
      const goldMat = MaterialLibrary.gold('#FBBF24');

      const body = new THREE.Group();
      body.position.set(0, 0.68, 0);
      body.rotation.x = 0.28;
      container.add(body);
      parts.head = body;

      addPart(body, new THREE.BoxGeometry(0.62, 0.09, 0.86), coverMat, [-0.3, -0.02, 0], [0, 0, -0.22]);
      addPart(body, new THREE.BoxGeometry(0.62, 0.09, 0.86), coverMat, [0.3, -0.02, 0], [0, 0, 0.22]);
      addPart(body, new THREE.BoxGeometry(0.56, 0.07, 0.78), pageMat, [-0.28, 0.05, 0], [0, 0, -0.22]);
      addPart(body, new THREE.BoxGeometry(0.56, 0.07, 0.78), pageMat, [0.28, 0.05, 0], [0, 0, 0.22]);
      addPart(body, createBeveledStarGeometry(0.18, 0.08, 0.07), goldMat, [0.28, 0.26, 0]);
      return true;
    }

    case 'key': {
      const goldMat = MaterialLibrary.gold('#FBBF24');
      const gemMat = MaterialLibrary.glossy('#1D5FD1', 0.95);
      const body = new THREE.Group();
      body.position.set(0, 0.74, 0);
      body.rotation.z = 0.45;
      container.add(body);
      parts.head = body;

      addPart(body, new THREE.TorusGeometry(0.32, 0.095, 12, 24), goldMat, [-0.42, 0, 0]);
      addPart(body, new THREE.OctahedronGeometry(0.14, 0), gemMat, [-0.42, 0, 0]);
      addPart(body, new THREE.CylinderGeometry(0.08, 0.08, 0.92, 12), goldMat, [0.26, 0, 0], [0, 0, Math.PI / 2]);
      addPart(body, new THREE.BoxGeometry(0.12, 0.26, 0.1), goldMat, [0.46, -0.14, 0]);
      addPart(body, new THREE.BoxGeometry(0.12, 0.2, 0.1), goldMat, [0.64, -0.11, 0]);
      return true;
    }

    case 'table': {
      const woodMat = MaterialLibrary.toy('#B45309', { bump: 'wood', clearcoat: 0.35 });
      const potMat = MaterialLibrary.gold('#E2E8F0');

      addPart(container, new THREE.CylinderGeometry(0.68, 0.68, 0.12, 24), woodMat, [0, 0.66, 0]);
      for (const [lx, lz] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]] as const) {
        addPart(container, new THREE.CylinderGeometry(0.06, 0.05, 0.64, 10), woodMat, [lx, 0.32, lz]);
      }
      // Sculpted Lathed Moroccan Silver Teapot with spout & handle!
      const potGeo = createLathedProfile([
        [0.01, 0], [0.16, 0.02], [0.24, 0.16], [0.18, 0.32], [0.08, 0.42], [0.01, 0.46],
      ], 20);
      addPart(container, potGeo, potMat, [0, 0.72, 0]);
      addPart(container, new THREE.TorusGeometry(0.12, 0.025, 8, 14, Math.PI * 1.2), potMat, [-0.22, 0.9, 0], [0, 0, Math.PI * 0.5]);
      const spout = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.2, 0.84, 0),
        new THREE.Vector3(0.34, 0.94, 0),
        new THREE.Vector3(0.38, 1.06, 0),
      ]);
      addPart(container, new THREE.TubeGeometry(spout, 10, 0.026, 8, false), potMat);
      return true;
    }

    // ================= COLORS =================
    case 'red':
    case 'blue':
    case 'yellow':
    case 'green':
    case 'orange_color':
    case 'purple': {
      const hexMap: Record<string, string> = {
        red: '#EF4444', blue: '#1D5FD1', yellow: '#FACC15',
        green: '#22C55E', orange_color: '#F97316', purple: '#A855F7',
      };
      const blobMat = MaterialLibrary.glossy(hexMap[wordId], 0.96);

      const body = new THREE.Group();
      body.position.set(0, 0.68, 0);
      container.add(body);
      parts.head = body;

      const dropGeo = createLathedProfile([
        [0.01, -0.52], [0.46, -0.46], [0.58, -0.14], [0.44, 0.24], [0.18, 0.56], [0.01, 0.74],
      ], 26);
      addPart(body, dropGeo, blobMat);

      const splashes = new THREE.Group();
      addPart(splashes, new THREE.SphereGeometry(0.11, 10, 8), blobMat, [0.62, 0.26, 0.1]);
      addPart(splashes, new THREE.SphereGeometry(0.08, 10, 8), blobMat, [-0.58, -0.18, 0.16]);
      body.add(splashes);
      parts.orbiters = splashes;

      addTrackingPixarFace(body, parts, { eyeY: -0.02, eyeZ: 0.52, eyeSpread: 0.18, eyeScale: 0.85, smileY: -0.18, smileZ: 0.55 });
      return true;
    }

    // ================= BODY PARTS (10) =================
    case 'head': {
      const skinMat = MaterialLibrary.toy('#F6C59F');
      const hairMat = MaterialLibrary.toy('#3B2314');
      const head = new THREE.Group();
      head.position.set(0, 0.78, 0);
      container.add(head);
      parts.head = head;
      addPart(head, new THREE.SphereGeometry(0.52, 22, 18), skinMat);
      addPart(head, new THREE.SphereGeometry(0.14, 12, 10), skinMat, [-0.52, 0, 0]);
      addPart(head, new THREE.SphereGeometry(0.14, 12, 10), skinMat, [0.52, 0, 0]);
      for (let i = -2; i <= 2; i++) addPart(head, new THREE.SphereGeometry(0.2, 12, 10), hairMat, [i * 0.2, 0.44 - Math.abs(i) * 0.06, -0.04]);
      addPart(head, new THREE.TorusGeometry(0.42, 0.045, 8, 22), MaterialLibrary.gold(), [0, 0.64, 0], [Math.PI / 2, 0, 0]);
      addTrackingPixarFace(head, parts, { eyeY: 0.04, eyeZ: 0.48, eyeSpread: 0.2, smileY: -0.16, smileZ: 0.5 });
      return true;
    }

    case 'eyes': {
      // Giant pair of live touch-tracking 3D Pixar eyes!
      const body = new THREE.Group();
      body.position.set(0, 0.78, 0);
      container.add(body);
      addTrackingPixarFace(body, parts, {
        eyeY: 0,
        eyeZ: 0,
        eyeSpread: 0.42,
        eyeScale: 2.8,
        irisHex: '#1D5FD1',
        blush: false,
        smile: false,
      });
      return true;
    }

    case 'nose': {
      const skinMat = MaterialLibrary.toy('#F6C59F');
      const noseMat = MaterialLibrary.glossy('#FB7185', 0.88);
      const head = new THREE.Group();
      head.position.set(0, 0.78, 0);
      container.add(head);
      parts.head = head;
      addPart(head, new THREE.SphereGeometry(0.52, 20, 18), skinMat);
      addPart(head, new THREE.SphereGeometry(0.22, 16, 14), noseMat, [0, -0.02, 0.54], undefined, [1.15, 0.95, 1.1]);
      addTrackingPixarFace(head, parts, { eyeY: 0.16, eyeZ: 0.45, eyeSpread: 0.2, eyeScale: 0.8, smileY: -0.24, smileZ: 0.48 });
      return true;
    }

    case 'mouth': {
      const lipMat = MaterialLibrary.glossy('#E11D48', 0.85);
      const innerMat = MaterialLibrary.toy('#881337');
      const body = new THREE.Group();
      body.position.set(0, 0.74, 0);
      container.add(body);
      parts.mouth = body;
      addPart(body, new THREE.SphereGeometry(0.56, 20, 16), innerMat, [0, 0, 0], undefined, [1.25, 0.75, 0.55]);
      addPart(body, new THREE.TorusGeometry(0.54, 0.1, 12, 24), lipMat, [0, 0, 0.12], undefined, [1.2, 0.72, 0.7]);
      addPart(body, new THREE.BoxGeometry(0.68, 0.16, 0.12), MaterialLibrary.eyeWhite(), [0, 0.16, 0.22]);
      addPart(body, new THREE.SphereGeometry(0.24, 14, 12), MaterialLibrary.glossy('#FB7185', 0.75), [0, -0.18, 0.22], undefined, [1.2, 0.55, 0.7]);
      return true;
    }

    case 'ears': {
      const skinMat = MaterialLibrary.toy('#F6C59F');
      const waveMat = MaterialLibrary.glow('#F59E0B', 0.55);
      const body = new THREE.Group();
      body.position.set(0, 0.76, 0);
      container.add(body);
      parts.earL = body;
      addPart(body, new THREE.TorusGeometry(0.36, 0.15, 12, 22, Math.PI * 1.45), skinMat, [0, 0.04, 0], [0, 0, -Math.PI * 0.4]);
      addPart(body, new THREE.SphereGeometry(0.22, 14, 12), skinMat, [-0.04, -0.24, 0]);
      const waves = new THREE.Group();
      addPart(waves, new THREE.TorusGeometry(0.28, 0.035, 8, 16, Math.PI * 0.7), waveMat, [-0.46, 0.06, 0], [0, 0, Math.PI * 0.65]);
      addPart(waves, new THREE.TorusGeometry(0.42, 0.035, 8, 16, Math.PI * 0.7), waveMat, [-0.52, 0.06, 0], [0, 0, Math.PI * 0.65]);
      body.add(waves);
      parts.foliage = waves;
      return true;
    }

    case 'hands': {
      const skinMat = MaterialLibrary.toy('#F6C59F');
      const hand = new THREE.Group();
      hand.position.set(0, 0.62, 0);
      container.add(hand);
      parts.tail = hand;
      addPart(hand, new THREE.BoxGeometry(0.62, 0.52, 0.2), skinMat);
      [-0.23, -0.08, 0.08, 0.23].forEach((fx, i) => {
        const fh = [0.34, 0.44, 0.4, 0.3][i];
        addPart(hand, new THREE.CapsuleGeometry(0.068, fh, 6, 10), skinMat, [fx, 0.28 + fh * 0.45, 0]);
      });
      addPart(hand, new THREE.CapsuleGeometry(0.075, 0.26, 6, 10), skinMat, [-0.42, 0.02, 0.02], [0, 0, 0.85]);
      addPart(hand, new THREE.SphereGeometry(0.11, 10, 8), MaterialLibrary.glossy('#FB7185', 0.85), [0, 0.02, 0.14]);
      return true;
    }

    case 'feet': {
      const skinMat = MaterialLibrary.toy('#F6C59F');
      const makeFoot = (x: number, rotZ: number) => {
        const g = new THREE.Group();
        g.position.set(x, 0.62, 0);
        g.rotation.z = rotZ;
        addPart(g, new THREE.CapsuleGeometry(0.18, 0.44, 8, 12), skinMat, [0, 0, 0], [0, 0, 0], [1, 1, 0.55]);
        [-0.14, -0.05, 0.04, 0.12, 0.19].forEach((tx, idx) => {
          addPart(g, new THREE.SphereGeometry(idx === 0 ? 0.078 : 0.052, 10, 8), skinMat, [tx * (x < 0 ? -1 : 1), 0.36 + (idx === 0 ? 0.03 : 0), 0.02]);
        });
        container.add(g);
        return g;
      };
      parts.wingL = makeFoot(-0.34, 0.12);
      parts.wingR = makeFoot(0.34, -0.12);
      return true;
    }

    case 'belly': {
      const body = new THREE.Group();
      body.position.set(0, 0.72, 0);
      container.add(body);
      parts.head = body;
      addPart(body, new THREE.SphereGeometry(0.6, 22, 18), MaterialLibrary.toy('#FBBF24'), [0, 0, 0], undefined, [1.06, 0.96, 0.92]);
      addPart(body, new THREE.SphereGeometry(0.42, 18, 14), MaterialLibrary.toy('#FEF3C7'), [0, -0.04, 0.32], undefined, [1.0, 0.92, 0.65]);
      addPart(body, new THREE.SphereGeometry(0.06, 10, 8), MaterialLibrary.toy('#D97706'), [0, -0.12, 0.6]);
      return true;
    }

    case 'hair': {
      const hairMat = MaterialLibrary.toy('#451A03');
      const bowMat = MaterialLibrary.glossy('#F472B6', 0.85);
      const head = new THREE.Group();
      head.position.set(0, 0.78, 0);
      container.add(head);
      parts.head = head;
      for (const [x, y, z, r] of [[0, 0.08, 0, 0.42], [-0.36, 0.04, 0.04, 0.28], [0.36, 0.04, 0.04, 0.28], [-0.22, 0.34, 0, 0.28], [0.22, 0.34, 0, 0.28], [0, -0.14, -0.1, 0.3]] as const) {
        addPart(head, new THREE.SphereGeometry(r, 14, 12), hairMat, [x, y, z]);
      }
      addPart(head, createLeafGeometry(0.34, 0.15, 0.06), bowMat, [0, -0.12, 0.42], [0, 0, Math.PI / 2]);
      addPart(head, createLeafGeometry(0.34, 0.15, 0.06), bowMat, [0, -0.12, 0.42], [0, 0, -Math.PI / 2]);
      addPart(head, new THREE.SphereGeometry(0.11, 12, 10), bowMat, [0, -0.12, 0.44]);
      return true;
    }

    case 'teeth': {
      const toothMat = MaterialLibrary.glossy('#FFFFFF', 0.96);
      const body = new THREE.Group();
      body.position.set(0, 0.72, 0);
      container.add(body);
      parts.head = body;
      addPart(body, new THREE.SphereGeometry(0.46, 20, 16), toothMat, [0, 0.14, 0], undefined, [1.12, 0.95, 0.78]);
      addPart(body, new THREE.CapsuleGeometry(0.16, 0.34, 8, 10), toothMat, [-0.2, -0.24, 0], [0, 0, 0.12]);
      addPart(body, new THREE.CapsuleGeometry(0.16, 0.34, 8, 10), toothMat, [0.2, -0.24, 0], [0, 0, -0.12]);
      addTrackingPixarFace(body, parts, { eyeY: 0.14, eyeZ: 0.36, eyeSpread: 0.16, eyeScale: 0.76, irisHex: '#0891B2', smileY: -0.02, smileZ: 0.38 });
      return true;
    }

    // ================= NUMBERS 1–10 =================
    case 'num_1':
    case 'num_2':
    case 'num_3':
    case 'num_4':
    case 'num_5':
    case 'num_6':
    case 'num_7':
    case 'num_8':
    case 'num_9':
    case 'num_10': {
      const count = parseInt(wordId.replace('num_', ''), 10);
      const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#0EA5E9', '#1D5FD1', '#8B5CF6', '#D946EF', '#EC4899'];
      const hex = colors[(count - 1) % colors.length];
      const badgeTex = TextureGenerator.getNumberBadgeTexture(count, hex);
      const faceMat = new THREE.MeshPhysicalMaterial({ map: badgeTex, roughness: 0.24, clearcoat: 0.8 });
      const rimMat = MaterialLibrary.gold('#FBBF24');

      const body = new THREE.Group();
      body.position.set(0, 0.82, 0);
      container.add(body);
      parts.head = body;

      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.22, 32), [rimMat, faceMat, faceMat]);
      coin.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
      coin.castShadow = true;
      coin.receiveShadow = true;
      body.add(coin);

      const orbiters = new THREE.Group();
      const miniStarGeo = createBeveledStarGeometry(0.14, 0.065, 0.06);
      const starMat = MaterialLibrary.gold('#FDE047');
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const radius = count > 6 ? 0.86 : 0.78;
        addPart(orbiters, miniStarGeo, starMat, [Math.cos(a) * radius, Math.sin(a) * 0.25, Math.sin(a) * radius]);
      }
      body.add(orbiters);
      parts.orbiters = orbiters;
      return true;
    }

    default:
      return false;
  }
}
