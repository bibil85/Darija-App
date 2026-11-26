import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { ArticulatedParts } from './types.ts';
import {
  addPart,
  addTrackingPixarFace,
  createLathedProfile,
  createLeafGeometry,
  createRoundedRectShape,
} from './geometryHelpers.ts';

/**
 * Bespoke Multi-Part Sculpted 3D Food Builder.
 * Replaces simple boxes/spheres with lathed organic fruits, Moroccan Khobz bread with steam curls,
 * beveled dairy milk carton with pouring spout, curved banana with peel petals, and ceramic egg cup!
 */
export function buildFoodModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): boolean {
  switch (wordId) {
    case 'apple': {
      const appleMat = MaterialLibrary.glossy('#EF4444', 0.94);
      const leafMat = MaterialLibrary.glossy('#22C55E', 0.65);
      const stemMat = MaterialLibrary.toy('#78350F', { bump: 'wood' });

      const body = new THREE.Group();
      body.position.set(0, 0.72, 0);
      container.add(body);
      parts.head = body;

      // Sculpted organic dimpled apple profile
      const appleGeo = createLathedProfile([
        [0.01, -0.44], [0.22, -0.52], [0.46, -0.42], [0.6, -0.08],
        [0.58, 0.26], [0.36, 0.52], [0.16, 0.48], [0.04, 0.38],
      ], 28);
      addPart(body, appleGeo, appleMat);

      // Curved wooden stem + extruded beveled leaf on wobble pivot
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.38, 0),
        new THREE.Vector3(0.02, 0.58, 0),
        new THREE.Vector3(0.1, 0.72, 0.02),
      ]);
      addPart(body, new THREE.TubeGeometry(stemCurve, 10, 0.042, 8, false), stemMat);

      const leaf = new THREE.Group();
      leaf.position.set(0.06, 0.56, 0);
      addPart(leaf, createLeafGeometry(0.42, 0.17, 0.045), leafMat, [0, 0, 0], [0.15, 0, -0.85]);
      body.add(leaf);
      parts.foliage = leaf;

      addTrackingPixarFace(body, parts, { eyeY: 0.04, eyeZ: 0.56, eyeSpread: 0.18, eyeScale: 0.82, smileY: -0.14, smileZ: 0.58 });
      return true;
    }

    case 'milk': {
      // Sculpted beveled gable-top dairy carton with pouring cap!
      const whiteMat = MaterialLibrary.glossy('#FFFFFF', 0.72);
      const blueMat = MaterialLibrary.glossy('#2563EB', 0.85);
      const bandMat = MaterialLibrary.toy('#DBEAFE');

      const body = new THREE.Group();
      body.position.set(0, 0.74, 0);
      container.add(body);
      parts.head = body;

      const baseShape = createRoundedRectShape(0.7, 0.62, 0.1);
      const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
        depth: 0.9,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 2,
      });
      baseGeo.rotateX(Math.PI / 2);
      addPart(body, baseGeo, whiteMat, [0, 0.42, 0]);

      // Blue splash stripe & beveled gable roof
      addPart(body, new THREE.BoxGeometry(0.76, 0.3, 0.68), bandMat, [0, -0.06, 0]);
      addPart(body, new THREE.ConeGeometry(0.54, 0.36, 4), blueMat, [0, 0.62, 0], [0, Math.PI / 4, 0]);
      addPart(body, new THREE.BoxGeometry(0.68, 0.14, 0.12), blueMat, [0, 0.82, 0]);
      // Recessed twist pouring cap on gable slope
      addPart(body, new THREE.CylinderGeometry(0.11, 0.12, 0.1, 14), MaterialLibrary.glossy('#60A5FA'), [0.18, 0.64, 0.18], [0.55, 0, -0.25]);

      addTrackingPixarFace(body, parts, { eyeY: 0.04, eyeZ: 0.36, eyeSpread: 0.17, eyeScale: 0.78, smileY: -0.12, smileZ: 0.37 });
      return true;
    }

    case 'water': {
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: '#E0F2FE',
        roughness: 0.08,
        transmission: 0.55,
        transparent: true,
        opacity: 0.58,
        clearcoat: 1.0,
      });
      const waterMat = MaterialLibrary.glossy('#38BDF8', 0.96);

      const body = new THREE.Group();
      body.position.set(0, 0.74, 0);
      container.add(body);
      parts.head = body;

      // Lathed tapered glass tumbler with thick rounded base & lip
      const glassGeo = createLathedProfile([
        [0.01, -0.52], [0.34, -0.52], [0.36, -0.46], [0.48, 0.52], [0.43, 0.54], [0.32, -0.44], [0.01, -0.44],
      ], 26);
      addPart(body, glassGeo, glassMat);
      addPart(body, new THREE.CylinderGeometry(0.41, 0.33, 0.78, 22), waterMat, [0, -0.08, 0]);

      // Floating glossy splash droplet crown on top
      const drops = new THREE.Group();
      drops.position.set(0, 0.42, 0);
      const dropGeo = createLathedProfile([
        [0.01, -0.14], [0.13, -0.08], [0.14, 0.02], [0.07, 0.14], [0.01, 0.22],
      ], 14);
      addPart(drops, dropGeo, waterMat, [0.28, 0.2, 0.08], [0, 0, -0.3]);
      addPart(drops, dropGeo, waterMat, [-0.26, 0.16, -0.06], [0, 0, 0.35], [0.7, 0.7, 0.7]);
      body.add(drops);
      parts.foliage = drops;

      addTrackingPixarFace(body, parts, { eyeY: -0.02, eyeZ: 0.44, eyeSpread: 0.16, eyeScale: 0.76, smileY: -0.18, smileZ: 0.44 });
      return true;
    }

    case 'bread': {
      // Traditional Moroccan Round Khobz Loaf with artisan scored crust, sesame seeds & rising steam swirls!
      const crustMat = MaterialLibrary.toy('#D97706', { roughness: 0.58, clearcoat: 0.12 });
      const topMat = MaterialLibrary.toy('#F59E0B', { roughness: 0.52, clearcoat: 0.16 });
      const scoreMat = MaterialLibrary.toy('#92400E', { roughness: 0.7 });
      const seedMat = MaterialLibrary.toy('#FEF3C7');
      const steamMat = MaterialLibrary.glow('#FFFFFF', 0.45);

      const body = new THREE.Group();
      body.position.set(0, 0.54, 0);
      container.add(body);
      parts.head = body;

      const loafGeo = createLathedProfile([
        [0.01, -0.26], [0.62, -0.24], [0.74, -0.04], [0.68, 0.2], [0.46, 0.38], [0.01, 0.44],
      ], 26);
      addPart(body, loafGeo, crustMat);
      addPart(body, new THREE.SphereGeometry(0.56, 20, 14), topMat, [0, 0.12, 0], undefined, [1.1, 0.5, 1.0]);

      // Artisan criss-cross bread scores + golden sesame seeds
      addPart(body, new THREE.CapsuleGeometry(0.028, 0.44, 6, 8), scoreMat, [0, 0.4, -0.12], [0, 0, Math.PI / 2]);
      addPart(body, new THREE.CapsuleGeometry(0.028, 0.44, 6, 8), scoreMat, [0, 0.39, 0.12], [0, 0, Math.PI / 2]);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        addPart(body, new THREE.SphereGeometry(0.026, 6, 6), seedMat, [Math.cos(a) * 0.34, 0.38, Math.sin(a) * 0.28], undefined, [1.6, 0.6, 0.9]);
      }

      // Rising animated steam curls
      const steam = new THREE.Group();
      steam.position.set(0, 0.54, 0);
      for (const sx of [-0.24, 0, 0.24]) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(sx, 0, 0),
          new THREE.Vector3(sx - 0.06, 0.16, 0.04),
          new THREE.Vector3(sx + 0.06, 0.34, -0.04),
        ]);
        addPart(steam, new THREE.TubeGeometry(curve, 10, 0.022, 6, false), steamMat);
      }
      body.add(steam);
      parts.foliage = steam;

      addTrackingPixarFace(body, parts, { eyeY: 0.06, eyeZ: 0.66, eyeSpread: 0.2, eyeScale: 0.84, smileY: -0.12, smileZ: 0.68 });
      return true;
    }

    case 'banana': {
      // Curved Banana with sculpted peeled-back collar petals!
      const yellowMat = MaterialLibrary.glossy('#FACC15', 0.8);
      const fleshMat = MaterialLibrary.toy('#FEF9C3');
      const tipMat = MaterialLibrary.toy('#713F12');

      const body = new THREE.Group();
      body.position.set(0, 0.78, 0);
      container.add(body);
      parts.head = body;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.46, -0.34, 0),
        new THREE.Vector3(0.02, -0.26, 0.05),
        new THREE.Vector3(0.34, 0.08, 0.04),
        new THREE.Vector3(0.4, 0.52, 0),
      ]);
      addPart(body, new THREE.TubeGeometry(curve, 22, 0.18, 6, false), yellowMat);
      addPart(body, new THREE.CylinderGeometry(0.06, 0.12, 0.2, 8), tipMat, [0.41, 0.6, 0], [0, 0, -0.2]);
      addPart(body, new THREE.SphereGeometry(0.1, 10, 8), tipMat, [-0.48, -0.35, 0]);
      // Cute peeled-back collar petal near top!
      addPart(body, createLeafGeometry(0.32, 0.12, 0.04), yellowMat, [0.34, 0.32, 0.14], [1.2, 0.3, -0.4]);
      addPart(body, new THREE.SphereGeometry(0.11, 10, 8), fleshMat, [0.36, 0.38, 0.04]);

      addTrackingPixarFace(body, parts, { eyeY: -0.06, eyeZ: 0.22, eyeSpread: 0.15, eyeScale: 0.72, smileY: -0.22, smileZ: 0.23 });
      return true;
    }

    case 'egg': {
      // Smooth lathed egg nestled inside a scalloped Moroccan ceramic egg cup!
      const shellMat = MaterialLibrary.glossy('#FFFBEB', 0.84);
      const cupMat = MaterialLibrary.glossy('#14A392', 0.85);
      const goldMat = MaterialLibrary.gold('#FBBF24');

      const body = new THREE.Group();
      body.position.set(0, 0.78, 0);
      container.add(body);
      parts.head = body;

      const cupGeo = createLathedProfile([
        [0.01, -0.72], [0.32, -0.72], [0.34, -0.64], [0.16, -0.54], [0.18, -0.38], [0.46, -0.18], [0.48, -0.1], [0.42, -0.1], [0.36, -0.34],
      ], 24);
      addPart(body, cupGeo, cupMat);
      addPart(body, new THREE.TorusGeometry(0.45, 0.032, 8, 24), goldMat, [0, -0.1, 0], [Math.PI / 2, 0, 0]);

      const eggGeo = createLathedProfile([
        [0.01, -0.34], [0.34, -0.26], [0.42, 0.04], [0.36, 0.34], [0.2, 0.56], [0.01, 0.62],
      ], 24);
      addPart(body, eggGeo, shellMat);

      addTrackingPixarFace(body, parts, { eyeY: 0.16, eyeZ: 0.38, eyeSpread: 0.15, eyeScale: 0.8, smileY: 0.02, smileZ: 0.42 });
      return true;
    }

    case 'orange': {
      // Dimpled Moroccan Limouna with green star calyx & beveled citrus leaf
      const orangeMat = MaterialLibrary.glossy('#FB923C', 0.84);
      const leafMat = MaterialLibrary.glossy('#22C55E', 0.68);

      const body = new THREE.Group();
      body.position.set(0, 0.72, 0);
      container.add(body);
      parts.head = body;

      const orangeGeo = createLathedProfile([
        [0.01, -0.54], [0.38, -0.5], [0.58, -0.18], [0.6, 0.14], [0.44, 0.48], [0.01, 0.54],
      ], 28);
      addPart(body, orangeGeo, orangeMat);

      // Green calyx star + stem + veined leaf
      const foliage = new THREE.Group();
      foliage.position.set(0, 0.54, 0);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        addPart(foliage, createLeafGeometry(0.18, 0.06, 0.03), leafMat, [0, 0, 0], [Math.PI * 0.44, a, 0]);
      }
      addPart(foliage, createLeafGeometry(0.42, 0.18, 0.045), leafMat, [0.04, 0.08, 0], [0.1, 0.2, -0.78]);
      body.add(foliage);
      parts.foliage = foliage;

      addTrackingPixarFace(body, parts, { eyeY: 0.04, eyeZ: 0.58, eyeSpread: 0.19, eyeScale: 0.84, smileY: -0.14, smileZ: 0.58 });
      return true;
    }

    case 'grapes': {
      // Plump translucent-sheen grape cluster with twisted curly tendril vine & 3-lobe leaf!
      const grapeMat = MaterialLibrary.glossy('#9333EA', 0.94);
      const leafMat = MaterialLibrary.glossy('#22C55E', 0.65);
      const vineMat = MaterialLibrary.toy('#78350F', { bump: 'wood' });

      const body = new THREE.Group();
      body.position.set(0, 0.82, 0);
      container.add(body);
      parts.head = body;

      const coords: Array<[number, number, number]> = [
        [-0.24, 0.28, 0.06], [0, 0.3, 0.1], [0.24, 0.28, 0.06],
        [-0.26, 0.02, 0.12], [0, 0.04, 0.18], [0.26, 0.02, 0.12],
        [-0.14, -0.24, 0.1], [0.14, -0.24, 0.1], [0, -0.46, 0.04],
        [-0.14, 0.16, -0.14], [0.14, 0.16, -0.14], [0, -0.12, -0.14],
      ];
      const gGeo = new THREE.SphereGeometry(0.18, 16, 14);
      for (const p of coords) addPart(body, gGeo, grapeMat, p);

      // Spiral curly vine tendril
      const vinePts: THREE.Vector3[] = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        vinePts.push(new THREE.Vector3(0.06 + Math.cos(t * Math.PI * 3) * 0.1 * t, 0.4 + t * 0.36, Math.sin(t * Math.PI * 3) * 0.1 * t));
      }
      addPart(body, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vinePts), 18, 0.032, 6, false), vineMat);

      const leaf = new THREE.Group();
      leaf.position.set(-0.04, 0.54, 0);
      addPart(leaf, createLeafGeometry(0.4, 0.18, 0.045), leafMat, [0, 0, 0], [0.15, 0, 0.85]);
      body.add(leaf);
      parts.foliage = leaf;
      return true;
    }

    default:
      return false;
  }
}
