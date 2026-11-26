import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { ArticulatedParts } from './types.ts';
import {
  addPart,
  addTrackingPixarFace,
  addWhiskers,
  createLathedProfile,
  createLeafGeometry,
} from './geometryHelpers.ts';

/**
 * Bespoke Multi-Part Sculpted 3D Animals Builder.
 * Every animal features lathed organic torsos, sculpted snouts/muzzles,
 * independent ear & tail pivots, paws/hooves, and touch-tracking Pixar pupils!
 */
export function buildAnimalModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): boolean {
  switch (wordId) {
    case 'lion': {
      // Sba3 — Sculpted Moroccan Atlas Lion Cub!
      const furMat = MaterialLibrary.toy('#FBBF24', { roughness: 0.36, clearcoat: 0.24 });
      const bellyMat = MaterialLibrary.toy('#FEF3C7', { roughness: 0.44 });
      const maneMat = MaterialLibrary.toy('#D95D39', { roughness: 0.48, clearcoat: 0.16 });
      const noseMat = MaterialLibrary.glossy('#5C3218', 0.92);
      const crownMat = MaterialLibrary.glossy('#1D5FD1', 0.92);
      const goldMat = MaterialLibrary.gold('#FDE047');
      const padMat = MaterialLibrary.toy('#E87D5A');

      // Lathed pear-shaped cub torso (not a plain sphere!)
      const torsoGeo = createLathedProfile([
        [0.01, 0.04], [0.36, 0.08], [0.46, 0.28], [0.43, 0.56], [0.34, 0.78], [0.22, 0.88], [0.01, 0.9],
      ]);
      addPart(container, torsoGeo, furMat, [0, 0.02, -0.04]);
      addPart(container, new THREE.SphereGeometry(0.28, 16, 14), bellyMat, [0, 0.42, 0.23], undefined, [0.92, 1.05, 0.52]);

      // 4 Sculpted Paws with cute toe-beans!
      const pawCoords: Array<[number, number, number, number]> = [
        [-0.28, 0.13, 0.26, 0.15], [0.28, 0.13, 0.26, -0.15],
        [-0.32, 0.12, -0.18, 0.4], [0.32, 0.12, -0.18, -0.4],
      ];
      for (const [px, py, pz, ry] of pawCoords) {
        const paw = new THREE.Group();
        paw.position.set(px, py, pz);
        paw.rotation.y = ry;
        addPart(paw, new THREE.SphereGeometry(0.14, 12, 10), furMat, [0, 0, 0], undefined, [1.0, 0.65, 1.3]);
        for (const tx of [-0.06, 0, 0.06]) {
          addPart(paw, new THREE.SphereGeometry(0.038, 8, 8), padMat, [tx, -0.02, 0.14]);
        }
        container.add(paw);
      }

      // Articulated S-curved wagging tail with sculpted flame tuft
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 0.34, -0.42);
      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.26, 0.14, -0.22),
        new THREE.Vector3(0.4, 0.42, -0.18),
        new THREE.Vector3(0.32, 0.66, -0.08),
      ]);
      addPart(tailPivot, new THREE.TubeGeometry(tailCurve, 14, 0.052, 8, false), furMat);
      addPart(tailPivot, createLeafGeometry(0.28, 0.14, 0.1), maneMat, [0.32, 0.62, -0.08], [0.2, 0.4, 0.3]);
      container.add(tailPivot);
      parts.tail = tailPivot;

      // Head Pivot
      const head = new THREE.Group();
      head.position.set(0, 1.12, 0.06);
      container.add(head);
      parts.head = head;

      // Sculpted Extruded Mane Petals arranged in a lush 3D sunflower ring!
      const manePetalGeo = createLeafGeometry(0.34, 0.18, 0.14);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        addPart(
          head,
          manePetalGeo,
          maneMat,
          [Math.cos(a) * 0.38, Math.sin(a) * 0.38, -0.1],
          [0, 0, a - Math.PI / 2]
        );
      }

      // Sculpted slightly-cheeked lion head
      const headGeo = createLathedProfile([
        [0.01, -0.42], [0.36, -0.34], [0.49, -0.12], [0.47, 0.18], [0.34, 0.4], [0.01, 0.46],
      ]);
      addPart(head, headGeo, furMat, [0, 0, 0.02]);

      // Articulated rounded ears with recessed inner concha
      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.36, 0.38, 0.03);
        addPart(ear, new THREE.SphereGeometry(0.16, 14, 12), furMat, [0, 0, 0], undefined, [1.0, 1.0, 0.65]);
        addPart(ear, new THREE.SphereGeometry(0.095, 10, 8), padMat, [0, 0, 0.075], undefined, [1.0, 1.0, 0.4]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      // Sculpted Royal Majorelle-Blue Scalloped Moroccan Crown
      const crownGeo = createLathedProfile([
        [0.18, 0], [0.22, 0.12], [0.25, 0.24], [0.16, 0.24], [0.01, 0.16],
      ], 12);
      addPart(head, crownGeo, crownMat, [0, 0.42, 0.02]);
      addPart(head, new THREE.OctahedronGeometry(0.085, 0), goldMat, [0, 0.68, 0.04]);

      // Sculpted 3D Muzzle / Snout with twin cheek puffs, glossy nose & curved whiskers!
      const snout = new THREE.Group();
      snout.position.set(0, -0.1, 0.36);
      addPart(snout, new THREE.SphereGeometry(0.15, 14, 12), bellyMat, [-0.1, -0.02, 0.04], undefined, [1.1, 0.9, 0.95]);
      addPart(snout, new THREE.SphereGeometry(0.15, 14, 12), bellyMat, [0.1, -0.02, 0.04], undefined, [1.1, 0.9, 0.95]);
      addPart(snout, new THREE.SphereGeometry(0.11, 12, 10), bellyMat, [0, -0.11, 0.01]);
      // Glossy triangular button nose
      addPart(snout, new THREE.ConeGeometry(0.095, 0.11, 3), noseMat, [0, 0.06, 0.16], [Math.PI * 0.42, Math.PI, 0]);
      addWhiskers(snout, -0.01, 0.08, 0.18, '#7C2D12');
      head.add(snout);
      parts.snout = snout;

      addTrackingPixarFace(head, parts, {
        eyeY: 0.1,
        eyeZ: 0.42,
        eyeSpread: 0.19,
        irisHex: '#78350F',
        eyebrowHex: '#9A3412',
        smileY: -0.19,
        smileZ: 0.52,
      });
      return true;
    }

    case 'cat': {
      // Mouch — Sleek Sculpted Feline with twitching triangular ears, muzzle, whiskers & swishing tail!
      const furMat = MaterialLibrary.toy('#FB923C', { roughness: 0.36, clearcoat: 0.25 });
      const stripeMat = MaterialLibrary.toy('#C2410C', { roughness: 0.45 });
      const creamMat = MaterialLibrary.toy('#FFEDD5');
      const pinkMat = MaterialLibrary.glossy('#FB7185', 0.75);

      const torsoGeo = createLathedProfile([
        [0.01, 0.04], [0.34, 0.08], [0.42, 0.28], [0.36, 0.58], [0.24, 0.8], [0.01, 0.86],
      ]);
      addPart(container, torsoGeo, furMat, [0, 0.02, 0]);
      addPart(container, new THREE.SphereGeometry(0.24, 14, 12), creamMat, [0, 0.42, 0.21], undefined, [0.88, 1.05, 0.5]);
      // Seated paws
      addPart(container, new THREE.CapsuleGeometry(0.085, 0.2, 6, 10), furMat, [-0.18, 0.14, 0.26], [Math.PI / 2, 0, 0.12]);
      addPart(container, new THREE.CapsuleGeometry(0.085, 0.2, 6, 10), furMat, [0.18, 0.14, 0.26], [Math.PI / 2, 0, -0.12]);

      // High-arched S-curve swishing feline tail!
      const tail = new THREE.Group();
      tail.position.set(0, 0.28, -0.36);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.22, 0.2, -0.22),
        new THREE.Vector3(0.32, 0.56, -0.14),
        new THREE.Vector3(0.18, 0.84, -0.06),
      ]);
      addPart(tail, new THREE.TubeGeometry(curve, 16, 0.062, 8, false), furMat);
      addPart(tail, new THREE.SphereGeometry(0.065, 10, 8), creamMat, [0.18, 0.84, -0.06]);
      container.add(tail);
      parts.tail = tail;

      const head = new THREE.Group();
      head.position.set(0, 1.06, 0.06);
      container.add(head);
      parts.head = head;

      addPart(head, new THREE.SphereGeometry(0.45, 22, 18), furMat, [0, 0, 0], undefined, [1.08, 0.92, 0.94]);
      // Tabby forehead stripes
      for (const sx of [-0.1, 0, 0.1]) {
        addPart(head, new THREE.CapsuleGeometry(0.025, 0.14, 4, 8), stripeMat, [sx, 0.34, 0.24], [0.5, 0, 0]);
      }

      // Sculpted Pointy Triangular Cat Ears with pink inner concha
      const earShape = new THREE.Shape();
      earShape.moveTo(-0.18, 0);
      earShape.lineTo(0.18, 0);
      earShape.quadraticCurveTo(0.06, 0.24, 0, 0.42);
      earShape.quadraticCurveTo(-0.06, 0.24, -0.18, 0);
      const earGeo = new THREE.ExtrudeGeometry(earShape, {
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 2,
      });
      earGeo.translate(0, 0, -0.04);

      const innerShape = new THREE.Shape();
      innerShape.moveTo(-0.1, 0.04);
      innerShape.lineTo(0.1, 0.04);
      innerShape.lineTo(0, 0.29);
      innerShape.closePath();
      const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
      innerGeo.translate(0, 0, -0.015);

      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.26, 0.3, 0.02);
        ear.rotation.z = -side * 0.28;
        addPart(ear, earGeo, furMat, [0, 0, 0]);
        addPart(ear, innerGeo, pinkMat, [0, 0, 0.055]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      // Sculpted Cat Muzzle + Pink Nose + Whiskers
      const snout = new THREE.Group();
      snout.position.set(0, -0.08, 0.36);
      addPart(snout, new THREE.SphereGeometry(0.11, 12, 10), creamMat, [-0.08, -0.02, 0.02]);
      addPart(snout, new THREE.SphereGeometry(0.11, 12, 10), creamMat, [0.08, -0.02, 0.02]);
      addPart(snout, new THREE.ConeGeometry(0.065, 0.08, 3), pinkMat, [0, 0.04, 0.1], [Math.PI * 0.45, Math.PI, 0]);
      addWhiskers(snout, 0, 0.04, 0.15, '#7C2D12');
      head.add(snout);
      parts.snout = snout;

      addTrackingPixarFace(head, parts, {
        eyeY: 0.08,
        eyeZ: 0.39,
        eyeSpread: 0.19,
        irisHex: '#10B981',
        smileY: -0.15,
        smileZ: 0.45,
      });
      return true;
    }

    case 'dog': {
      // Kelb — Sculpted Puppy with elongated snout, happy tongue, red collar, and floppy hinge ears!
      const furMat = MaterialLibrary.toy('#D97706');
      const earMat = MaterialLibrary.toy('#78350F');
      const creamMat = MaterialLibrary.toy('#FEF3C7');
      const collarMat = MaterialLibrary.glossy('#EF4444', 0.85);
      const tongueMat = MaterialLibrary.glossy('#FB7185', 0.8);

      const torsoGeo = createLathedProfile([
        [0.01, 0.04], [0.36, 0.08], [0.46, 0.3], [0.42, 0.62], [0.3, 0.82], [0.01, 0.88],
      ]);
      addPart(container, torsoGeo, furMat, [0, 0.02, 0]);
      addPart(container, new THREE.SphereGeometry(0.24, 14, 12), creamMat, [0, 0.44, 0.24], undefined, [0.9, 1.0, 0.55]);
      // Front paws
      addPart(container, new THREE.CapsuleGeometry(0.09, 0.22, 6, 10), furMat, [-0.22, 0.14, 0.26], [Math.PI / 2, 0, 0.1]);
      addPart(container, new THREE.CapsuleGeometry(0.09, 0.22, 6, 10), furMat, [0.22, 0.14, 0.26], [Math.PI / 2, 0, -0.1]);
      // Collar + dangling gold tag
      addPart(container, new THREE.TorusGeometry(0.32, 0.06, 10, 22), collarMat, [0, 0.78, 0.04], [Math.PI / 2, 0, 0]);
      addPart(container, new THREE.CylinderGeometry(0.085, 0.085, 0.03, 14), MaterialLibrary.gold(), [0, 0.69, 0.37], [Math.PI / 2, 0, 0]);

      const tail = new THREE.Group();
      tail.position.set(0, 0.38, -0.4);
      const tCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.16, -0.22),
        new THREE.Vector3(0, 0.38, -0.18),
      ]);
      addPart(tail, new THREE.TubeGeometry(tCurve, 10, 0.068, 8, false), furMat);
      container.add(tail);
      parts.tail = tail;

      const head = new THREE.Group();
      head.position.set(0, 1.12, 0.08);
      container.add(head);
      parts.head = head;

      addPart(head, new THREE.SphereGeometry(0.44, 22, 18), furMat);
      // Cute dark eye-patch spot
      addPart(head, new THREE.SphereGeometry(0.22, 14, 12), earMat, [-0.18, 0.08, 0.26], undefined, [1.0, 1.0, 0.55]);

      // Sculpted Elongated Puppy Snout + Glossy Nose + Happy Panting Tongue
      const snout = new THREE.Group();
      snout.position.set(0, -0.09, 0.34);
      addPart(snout, new THREE.CapsuleGeometry(0.18, 0.18, 8, 12), creamMat, [0, 0, 0.06], [Math.PI / 2, 0, 0], [1.18, 1.0, 0.85]);
      addPart(snout, new THREE.SphereGeometry(0.095, 14, 12), MaterialLibrary.glossy('#1E130B', 1), [0, 0.07, 0.24], undefined, [1.25, 0.85, 0.85]);
      // Happy sticking-out tongue!
      addPart(snout, createLeafGeometry(0.22, 0.09, 0.04), tongueMat, [0, -0.08, 0.14], [Math.PI * 0.82, 0, 0]);
      head.add(snout);
      parts.snout = snout;

      // Sculpted Long Floppy Ears on Hinge Pivots
      const earGeo = createLeafGeometry(0.52, 0.2, 0.1);
      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.4, 0.18, 0.02);
        addPart(ear, earGeo, earMat, [side * 0.04, 0, 0], [0.1, side * 0.3, Math.PI - side * 0.18]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      addTrackingPixarFace(head, parts, {
        eyeY: 0.1,
        eyeZ: 0.39,
        eyeSpread: 0.18,
        irisHex: '#5C3218',
        eyebrowHex: '#78350F',
        smileY: -0.17,
        smileZ: 0.52,
      });
      return true;
    }

    case 'cow': {
      // Begra — Sculpted Cow with curved horns, broad pink snout, hooves & tail switch!
      const whiteMat = MaterialLibrary.toy('#FFFFFF');
      const spotMat = MaterialLibrary.toy('#27272A');
      const pinkMat = MaterialLibrary.toy('#FBCFE8');
      const hornMat = MaterialLibrary.toy('#FDE68A');
      const nostrilMat = MaterialLibrary.toy('#BE185D');

      const torsoGeo = createLathedProfile([
        [0.01, 0.06], [0.4, 0.12], [0.52, 0.38], [0.46, 0.68], [0.32, 0.88], [0.01, 0.92],
      ]);
      addPart(container, torsoGeo, whiteMat, [0, 0.02, 0]);
      addPart(container, new THREE.SphereGeometry(0.22, 14, 12), spotMat, [0.3, 0.46, 0.24], undefined, [1, 1, 0.65]);
      addPart(container, new THREE.SphereGeometry(0.2, 14, 12), spotMat, [-0.32, 0.4, -0.16], undefined, [1, 1, 0.65]);
      // Hooves
      addPart(container, new THREE.CylinderGeometry(0.11, 0.12, 0.18, 12), spotMat, [-0.24, 0.1, 0.26]);
      addPart(container, new THREE.CylinderGeometry(0.11, 0.12, 0.18, 12), spotMat, [0.24, 0.1, 0.26]);

      const tail = new THREE.Group();
      tail.position.set(0, 0.44, -0.46);
      const tCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.08, -0.12, -0.16),
        new THREE.Vector3(0.14, -0.26, -0.12),
      ]);
      addPart(tail, new THREE.TubeGeometry(tCurve, 10, 0.036, 6, false), whiteMat);
      addPart(tail, createLeafGeometry(0.18, 0.08, 0.06), spotMat, [0.14, -0.28, -0.12], [Math.PI, 0, 0]);
      container.add(tail);
      parts.tail = tail;

      const head = new THREE.Group();
      head.position.set(0, 1.12, 0.12);
      container.add(head);
      parts.head = head;

      addPart(head, new THREE.SphereGeometry(0.43, 20, 18), whiteMat);
      addPart(head, new THREE.SphereGeometry(0.2, 12, 10), spotMat, [-0.24, 0.2, 0.22]);

      // Sculpted Curved TubeGeometry Horns
      for (const side of [-1, 1] as const) {
        const hCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.24, 0.34, 0),
          new THREE.Vector3(side * 0.36, 0.48, 0.04),
          new THREE.Vector3(side * 0.28, 0.6, 0.08),
        ]);
        addPart(head, new THREE.TubeGeometry(hCurve, 10, 0.055, 8, false), hornMat);
      }

      // Broad Sculpted Pink Muzzle with Nostrils
      const snout = new THREE.Group();
      snout.position.set(0, -0.14, 0.32);
      addPart(snout, new THREE.SphereGeometry(0.28, 18, 14), pinkMat, [0, 0, 0], undefined, [1.34, 0.8, 0.82]);
      addPart(snout, new THREE.SphereGeometry(0.045, 8, 8), nostrilMat, [-0.14, 0.05, 0.2], undefined, [1.2, 0.8, 0.5]);
      addPart(snout, new THREE.SphereGeometry(0.045, 8, 8), nostrilMat, [0.14, 0.05, 0.2], undefined, [1.2, 0.8, 0.5]);
      head.add(snout);
      parts.snout = snout;

      // Side-mounted leaf-shaped ears
      const earGeo = createLeafGeometry(0.32, 0.13, 0.06);
      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.4, 0.18, 0);
        addPart(ear, earGeo, whiteMat, [0, 0, 0], [0, 0, -side * Math.PI * 0.45]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      addTrackingPixarFace(head, parts, {
        eyeY: 0.1,
        eyeZ: 0.38,
        eyeSpread: 0.19,
        irisHex: '#3B2314',
        smileY: -0.22,
        smileZ: 0.54,
      });
      return true;
    }

    case 'bird': {
      // Tir — Aerodynamic Sculpted Songbird with feathered wings, 2-part beak & crest plumes!
      const bodyMat = MaterialLibrary.glossy('#38BDF8', 0.72);
      const wingMat = MaterialLibrary.toy('#0284C7');
      const bellyMat = MaterialLibrary.toy('#E0F2FE');
      const beakMat = MaterialLibrary.glossy('#FBBF24', 0.85);

      const body = new THREE.Group();
      body.position.set(0, 0.74, 0);
      container.add(body);
      parts.head = body;

      // Lathed plump songbird teardrop torso
      const birdGeo = createLathedProfile([
        [0.01, -0.5], [0.38, -0.42], [0.54, -0.06], [0.48, 0.28], [0.32, 0.48], [0.01, 0.54],
      ]);
      addPart(body, birdGeo, bodyMat);
      addPart(body, new THREE.SphereGeometry(0.36, 14, 12), bellyMat, [0, -0.1, 0.26], undefined, [0.92, 0.95, 0.6]);

      // Plumed Head Crest Feathers
      const plumeGeo = createLeafGeometry(0.28, 0.08, 0.04);
      addPart(body, plumeGeo, wingMat, [0, 0.48, 0.04], [-0.35, 0, 0.1]);
      addPart(body, plumeGeo, bodyMat, [0, 0.46, -0.04], [-0.55, 0, -0.15]);

      // 2-Part Sculpted Beak (upper + lower!)
      const snout = new THREE.Group();
      snout.position.set(0, 0.02, 0.48);
      addPart(snout, new THREE.ConeGeometry(0.11, 0.28, 8), beakMat, [0, 0.03, 0.12], [Math.PI * 0.46, 0, 0]);
      addPart(snout, new THREE.ConeGeometry(0.08, 0.2, 8), beakMat, [0, -0.05, 0.08], [Math.PI * 0.58, 0, 0]);
      body.add(snout);
      parts.snout = snout;

      // Sculpted Extruded Flapping Wings
      const wingGeo = createLeafGeometry(0.54, 0.24, 0.08);
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 0.48, 0.04, -0.02);
        addPart(wing, wingGeo, wingMat, [0, 0, 0], [0.15, side * 0.2, -side * Math.PI * 0.55]);
        body.add(wing);
        if (side < 0) parts.wingL = wing;
        else parts.wingR = wing;
      }

      // Layered Fan Tail Feathers
      const tail = new THREE.Group();
      tail.position.set(0, -0.12, -0.48);
      const featherGeo = createLeafGeometry(0.42, 0.12, 0.04);
      for (const rz of [-0.3, 0, 0.3]) {
        addPart(tail, featherGeo, wingMat, [0, 0, 0], [-Math.PI * 0.42, 0, rz]);
      }
      body.add(tail);
      parts.tail = tail;

      // Perched feet
      addPart(container, new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), beakMat, [-0.14, 0.16, 0.04]);
      addPart(container, new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), beakMat, [0.14, 0.16, 0.04]);

      addTrackingPixarFace(body, parts, {
        eyeY: 0.16,
        eyeZ: 0.44,
        eyeSpread: 0.2,
        irisHex: '#0F172A',
        smile: false,
      });
      return true;
    }

    case 'rabbit': {
      // Gnina — Sculpted Bunny with tall curved twitching ears, puffy cheeks, buck teeth & pom-pom tail!
      const furMat = MaterialLibrary.toy('#FFFFFF');
      const innerMat = MaterialLibrary.toy('#FBCFE8');
      const noseMat = MaterialLibrary.glossy('#EC4899', 0.85);

      const torsoGeo = createLathedProfile([
        [0.01, 0.04], [0.36, 0.08], [0.44, 0.3], [0.36, 0.58], [0.24, 0.78], [0.01, 0.84],
      ]);
      addPart(container, torsoGeo, furMat, [0, 0.02, 0]);
      // Big bunny hind feet
      addPart(container, new THREE.CapsuleGeometry(0.1, 0.24, 6, 10), furMat, [-0.22, 0.11, 0.22], [Math.PI / 2, 0, 0.22]);
      addPart(container, new THREE.CapsuleGeometry(0.1, 0.24, 6, 10), furMat, [0.22, 0.11, 0.22], [Math.PI / 2, 0, -0.22]);

      const tail = new THREE.Group();
      tail.position.set(0, 0.3, -0.42);
      addPart(tail, new THREE.SphereGeometry(0.17, 14, 12), furMat);
      container.add(tail);
      parts.tail = tail;

      const head = new THREE.Group();
      head.position.set(0, 1.02, 0.04);
      container.add(head);
      parts.head = head;

      addPart(head, new THREE.SphereGeometry(0.43, 20, 18), furMat, [0, 0, 0], undefined, [1.08, 0.94, 0.94]);

      // Sculpted Tall Leaf-Curved Bunny Ears with recessed pink inner grooves!
      const earGeo = createLeafGeometry(0.76, 0.17, 0.09);
      const innerGeo = createLeafGeometry(0.54, 0.09, 0.04);
      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.18, 0.36, 0);
        ear.rotation.z = -side * 0.14;
        addPart(ear, earGeo, furMat, [0, 0, 0]);
        addPart(ear, innerGeo, innerMat, [0, 0.08, 0.045]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      // Sculpted Twitchy Bunny Snout + Buck Teeth + Whiskers
      const snout = new THREE.Group();
      snout.position.set(0, -0.07, 0.36);
      addPart(snout, new THREE.SphereGeometry(0.11, 12, 10), furMat, [-0.08, -0.02, 0.02]);
      addPart(snout, new THREE.SphereGeometry(0.11, 12, 10), furMat, [0.08, -0.02, 0.02]);
      addPart(snout, new THREE.SphereGeometry(0.062, 10, 8), noseMat, [0, 0.04, 0.1], undefined, [1.25, 0.85, 0.85]);
      // Cute buck teeth
      addPart(snout, new THREE.BoxGeometry(0.055, 0.085, 0.03), MaterialLibrary.eyeWhite(), [-0.032, -0.1, 0.08]);
      addPart(snout, new THREE.BoxGeometry(0.055, 0.085, 0.03), MaterialLibrary.eyeWhite(), [0.032, -0.1, 0.08]);
      addWhiskers(snout, 0, 0.03, 0.16, '#94A3B8');
      head.add(snout);
      parts.snout = snout;

      addTrackingPixarFace(head, parts, {
        eyeY: 0.08,
        eyeZ: 0.38,
        eyeSpread: 0.18,
        irisHex: '#3B2314',
        smile: false,
      });
      return true;
    }

    case 'fish': {
      // Houta — Streamlined Tropical Clownfish with sculpted fins, contoured stripes & forked tail!
      const fishMat = MaterialLibrary.glossy('#FB923C', 0.88);
      const stripeMat = MaterialLibrary.glossy('#FFFFFF', 0.85);
      const finMat = MaterialLibrary.glossy('#FBBF24', 0.78);

      const body = new THREE.Group();
      body.position.set(0, 0.8, 0);
      container.add(body);
      parts.head = body;

      // Lathed streamlined fish body rotated along X axis
      const fishGeo = createLathedProfile([
        [0.01, -0.64], [0.16, -0.5], [0.42, -0.18], [0.48, 0.14], [0.36, 0.44], [0.14, 0.62], [0.01, 0.66],
      ]);
      const mesh = addPart(body, fishGeo, fishMat, [0, 0, 0], [0, 0, -Math.PI / 2], [0.95, 1.0, 0.68]);
      mesh.castShadow = true;

      // Contoured white tropical stripe bands
      addPart(body, new THREE.TorusGeometry(0.41, 0.068, 10, 22), stripeMat, [0.1, 0, 0], [0, Math.PI / 2, 0], [0.7, 1.0, 1.0]);
      addPart(body, new THREE.TorusGeometry(0.32, 0.055, 10, 20), stripeMat, [-0.26, 0, 0], [0, Math.PI / 2, 0], [0.7, 1.0, 1.0]);

      // Sculpted Dorsal & Forked Tail Fins
      const dorsalGeo = createLeafGeometry(0.44, 0.2, 0.06);
      addPart(body, dorsalGeo, finMat, [-0.08, 0.4, 0], [0, 0, 0.35]);

      const tail = new THREE.Group();
      tail.position.set(-0.62, 0, 0);
      const lobeGeo = createLeafGeometry(0.44, 0.16, 0.06);
      addPart(tail, lobeGeo, finMat, [0, 0.04, 0], [0, 0, Math.PI * 0.72]);
      addPart(tail, lobeGeo, finMat, [0, -0.04, 0], [0, 0, Math.PI * 0.28]);
      body.add(tail);
      parts.tail = tail;

      // Flapping Pectoral Fins
      const pecGeo = createLeafGeometry(0.32, 0.14, 0.05);
      for (const side of [-1, 1] as const) {
        const fin = new THREE.Group();
        fin.position.set(0.06, -0.1, side * 0.3);
        addPart(fin, pecGeo, finMat, [0, 0, 0], [side * 0.7, 0, 0.5]);
        body.add(fin);
        if (side < 0) parts.wingL = fin;
        else parts.wingR = fin;
      }

      // Cute puckered fish lips
      addPart(body, new THREE.TorusGeometry(0.085, 0.032, 8, 14), MaterialLibrary.glossy('#F43F5E'), [0.64, -0.04, 0], [0, Math.PI / 2, 0]);

      addTrackingPixarFace(body, parts, {
        eyeY: 0.1,
        eyeZ: 0.3,
        eyeSpread: 0.16,
        eyeScale: 0.85,
        irisHex: '#0284C7',
        smile: false,
      });
      return true;
    }

    case 'elephant': {
      // Fil — Sculpted Elephant with curved ringed trunk, giant extruded fan ears & ivory tusks!
      const greyMat = MaterialLibrary.toy('#94A3B8', { roughness: 0.42 });
      const pinkMat = MaterialLibrary.toy('#FBCFE8');
      const ivoryMat = MaterialLibrary.glossy('#FFFBEB', 0.85);
      const nailMat = MaterialLibrary.toy('#E2E8F0');

      const torsoGeo = createLathedProfile([
        [0.01, 0.12], [0.42, 0.18], [0.54, 0.44], [0.48, 0.74], [0.34, 0.92], [0.01, 0.96],
      ]);
      addPart(container, torsoGeo, greyMat, [0, 0.04, -0.06]);

      // 4 Sturdy Pillar Legs with little toenails!
      const legs: Array<[number, number]> = [[-0.28, 0.24], [0.28, 0.24], [-0.28, -0.24], [0.28, -0.24]];
      for (const [lx, lz] of legs) {
        addPart(container, new THREE.CylinderGeometry(0.14, 0.16, 0.36, 12), greyMat, [lx, 0.18, lz]);
        for (const nx of [-0.06, 0, 0.06]) {
          addPart(container, new THREE.SphereGeometry(0.035, 8, 8), nailMat, [lx + nx, 0.05, lz + 0.14]);
        }
      }

      const head = new THREE.Group();
      head.position.set(0, 1.12, 0.14);
      container.add(head);
      parts.head = head;

      addPart(head, new THREE.SphereGeometry(0.45, 22, 18), greyMat);

      // Articulated Curved Trunk with soft sculptural rings!
      const snout = new THREE.Group();
      snout.position.set(0, -0.05, 0.38);
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.26, 0.24),
        new THREE.Vector3(0, -0.34, 0.44),
        new THREE.Vector3(0, -0.14, 0.56),
      ]);
      addPart(snout, new THREE.TubeGeometry(trunkCurve, 18, 0.115, 12, false), greyMat);
      addPart(snout, new THREE.TorusGeometry(0.11, 0.025, 8, 16), greyMat, [0, -0.14, 0.56], [Math.PI / 3, 0, 0]);
      head.add(snout);
      parts.snout = snout;

      // Curved Ivory Tusks
      for (const side of [-1, 1] as const) {
        const tuskCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.2, -0.16, 0.36),
          new THREE.Vector3(side * 0.26, -0.22, 0.52),
          new THREE.Vector3(side * 0.22, -0.12, 0.62),
        ]);
        addPart(head, new THREE.TubeGeometry(tuskCurve, 8, 0.042, 8, false), ivoryMat);
      }

      // Giant Sculpted Fan Ears on Flap Pivots!
      const earShape = new THREE.Shape();
      earShape.moveTo(0, 0.18);
      earShape.bezierCurveTo(0.45, 0.42, 0.62, -0.05, 0.42, -0.34);
      earShape.bezierCurveTo(0.24, -0.46, 0.04, -0.28, 0, -0.12);
      earShape.closePath();
      const fanGeo = new THREE.ExtrudeGeometry(earShape, {
        depth: 0.07,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
      });
      fanGeo.translate(0, 0, -0.035);

      for (const side of [-1, 1] as const) {
        const ear = new THREE.Group();
        ear.position.set(side * 0.38, 0.08, -0.04);
        const m = addPart(ear, fanGeo, greyMat, [0, 0, 0], [0, side < 0 ? Math.PI : 0, 0]);
        m.castShadow = true;
        addPart(ear, new THREE.SphereGeometry(0.22, 12, 10), pinkMat, [side * 0.24, 0.02, 0.05], undefined, [1.0, 1.2, 0.25]);
        head.add(ear);
        if (side < 0) parts.earL = ear;
        else parts.earR = ear;
      }

      addTrackingPixarFace(head, parts, {
        eyeY: 0.12,
        eyeZ: 0.39,
        eyeSpread: 0.2,
        irisHex: '#1E293B',
        smile: false,
      });
      return true;
    }

    default:
      return false;
  }
}
