import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { ArticulatedParts } from './types.ts';
import {
  addPart,
  addTrackingPixarFace,
  createBeveledStarGeometry,
  createLeafGeometry,
} from './geometryHelpers.ts';

/**
 * Bespoke Multi-Part Sculpted 3D Nature & Sky Builder.
 * Layered sun flame-rays, beveled crescent moon with star charm, curved-trunk orange tree,
 * cupped 8-petal flower blossom, and rainbow cumulus cloud — all with living motion & tracking pupils!
 */
export function buildNatureModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): boolean {
  switch (wordId) {
    case 'sun': {
      const sunMat = MaterialLibrary.glow('#FDE047', 0.36);
      const rayMat = MaterialLibrary.gold('#F59E0B');
      const outerRayMat = MaterialLibrary.glossy('#FB923C', 0.8);

      const body = new THREE.Group();
      body.position.set(0, 0.84, 0);
      container.add(body);
      parts.head = body;

      addPart(body, new THREE.SphereGeometry(0.46, 24, 20), sunMat);

      // Sculpted leaf-flame ray halo rotating smoothly!
      const rays = new THREE.Group();
      const rayGeo = createLeafGeometry(0.36, 0.12, 0.08);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        addPart(
          rays,
          rayGeo,
          i % 2 === 0 ? rayMat : outerRayMat,
          [Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0],
          [0, 0, a - Math.PI / 2]
        );
      }
      body.add(rays);
      parts.orbiters = rays;

      addTrackingPixarFace(body, parts, { eyeY: 0.06, eyeZ: 0.44, eyeSpread: 0.16, eyeScale: 0.8, irisHex: '#92400E', smileY: -0.12, smileZ: 0.45 });
      return true;
    }

    case 'moon': {
      const moonMat = MaterialLibrary.glow('#FDE047', 0.28);
      const starMat = MaterialLibrary.gold('#FBBF24');

      const body = new THREE.Group();
      body.position.set(0, 0.84, 0);
      container.add(body);
      parts.head = body;

      // Extruded Beveled Crescent Moon Silhouette!
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 0.62, Math.PI * 0.25, Math.PI * 1.75, false);
      shape.absarc(0.24, 0, 0.5, Math.PI * 1.62, Math.PI * 0.38, true);
      const moonGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.06,
        bevelSegments: 3,
      });
      moonGeo.center();
      addPart(body, moonGeo, moonMat);

      // Dangling golden star charm hanging from upper moon tip!
      const charm = new THREE.Group();
      charm.position.set(0.26, 0.44, 0);
      addPart(charm, new THREE.CylinderGeometry(0.014, 0.014, 0.3, 6), starMat, [0, -0.15, 0]);
      addPart(charm, createBeveledStarGeometry(0.18, 0.08, 0.08), starMat, [0, -0.34, 0]);
      body.add(charm);
      parts.foliage = charm;

      addTrackingPixarFace(body, parts, { eyeY: 0.05, eyeZ: 0.18, eyeSpread: 0.11, eyeScale: 0.62, irisHex: '#4338CA', smileY: -0.1, smileZ: 0.19 });
      return true;
    }

    case 'star': {
      const starMat = MaterialLibrary.glow('#FDE047', 0.32);
      const body = new THREE.Group();
      body.position.set(0, 0.84, 0);
      container.add(body);
      parts.head = body;

      addPart(body, createBeveledStarGeometry(0.68, 0.32, 0.26), starMat);

      // Tiny orbiting sparkle diamonds!
      const orbiters = new THREE.Group();
      const sparkMat = MaterialLibrary.gold('#FFFFFF');
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        addPart(orbiters, new THREE.OctahedronGeometry(0.08, 0), sparkMat, [Math.cos(a) * 0.78, Math.sin(a) * 0.25, Math.sin(a) * 0.78]);
      }
      body.add(orbiters);
      parts.orbiters = orbiters;

      addTrackingPixarFace(body, parts, { eyeY: 0.04, eyeZ: 0.2, eyeSpread: 0.15, eyeScale: 0.72, irisHex: '#92400E', smileY: -0.1, smileZ: 0.21 });
      return true;
    }

    case 'tree': {
      // Sculpted Curved-Trunk Moroccan Orange Tree with root flare, layered lush canopy & oranges!
      const trunkMat = MaterialLibrary.toy('#92400E', { bump: 'wood' });
      const leafMat = MaterialLibrary.toy('#22C55E', { clearcoat: 0.22 });
      const darkLeafMat = MaterialLibrary.toy('#15803D', { clearcoat: 0.18 });
      const orangeMat = MaterialLibrary.glossy('#FB923C', 0.88);

      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.06, 0.42, 0.02),
        new THREE.Vector3(0.04, 0.86, 0),
      ]);
      addPart(container, new THREE.TubeGeometry(trunkCurve, 12, 0.16, 10, false), trunkMat);
      // Root flares
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        addPart(container, new THREE.CapsuleGeometry(0.075, 0.24, 6, 8), trunkMat, [Math.cos(a) * 0.18, 0.08, Math.sin(a) * 0.18], [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]);
      }

      const foliage = new THREE.Group();
      foliage.position.set(0.02, 0.88, 0);
      addPart(foliage, new THREE.DodecahedronGeometry(0.46, 1), leafMat, [0, 0.34, 0]);
      addPart(foliage, new THREE.DodecahedronGeometry(0.36, 1), darkLeafMat, [-0.34, 0.08, 0.08]);
      addPart(foliage, new THREE.DodecahedronGeometry(0.36, 1), leafMat, [0.34, 0.1, -0.06]);
      addPart(foliage, new THREE.DodecahedronGeometry(0.32, 1), darkLeafMat, [0, 0.06, -0.3]);
      // Glossy Moroccan oranges tucked into the leaves!
      addPart(foliage, new THREE.SphereGeometry(0.1, 12, 10), orangeMat, [-0.28, 0.18, 0.36]);
      addPart(foliage, new THREE.SphereGeometry(0.1, 12, 10), orangeMat, [0.26, 0.32, 0.32]);
      addPart(foliage, new THREE.SphereGeometry(0.09, 12, 10), orangeMat, [0.02, 0.56, 0.26]);
      container.add(foliage);
      parts.foliage = foliage;
      return true;
    }

    case 'flower': {
      // Sculpted Curved-Stem Moroccan Blossom with 8 cupped beveled petals & smiling face!
      const stemMat = MaterialLibrary.toy('#16A34A');
      const petalMat = MaterialLibrary.glossy('#F472B6', 0.72);
      const centerMat = MaterialLibrary.glossy('#FDE047', 0.75);

      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.06, 0.44, 0.04),
        new THREE.Vector3(0, 0.94, 0),
      ]);
      addPart(container, new THREE.TubeGeometry(stemCurve, 12, 0.055, 8, false), stemMat);
      addPart(container, createLeafGeometry(0.38, 0.16, 0.04), stemMat, [-0.04, 0.36, 0], [0.2, 0, 1.05]);
      addPart(container, createLeafGeometry(0.38, 0.16, 0.04), stemMat, [0.02, 0.48, 0], [0.2, 0, -1.05]);

      const head = new THREE.Group();
      head.position.set(0, 0.96, 0);
      container.add(head);
      parts.head = head;

      const petalGeo = createLeafGeometry(0.42, 0.18, 0.06);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const pGroup = new THREE.Group();
        pGroup.rotation.z = a;
        addPart(pGroup, petalGeo, petalMat, [0, 0.18, -0.02], [-0.25, 0, 0]);
        head.add(pGroup);
      }
      addPart(head, new THREE.SphereGeometry(0.28, 18, 16), centerMat, [0, 0, 0.06], undefined, [1, 1, 0.62]);
      addTrackingPixarFace(head, parts, { eyeY: 0.04, eyeZ: 0.24, eyeSpread: 0.11, eyeScale: 0.58, irisHex: '#92400E', smileY: -0.07, smileZ: 0.25 });
      return true;
    }

    case 'cloud': {
      // Sculpted Cumulus Cloud with mini 3D rainbow arch & dangling raindrops!
      const cloudMat = MaterialLibrary.toy('#FFFFFF', { roughness: 0.46, clearcoat: 0.16 });
      const dropMat = MaterialLibrary.glossy('#38BDF8', 0.92);

      const body = new THREE.Group();
      body.position.set(0, 0.88, 0);
      container.add(body);
      parts.head = body;

      // Mini 3D Rainbow Arch tucked behind the cloud!
      const rainbowColors = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6'];
      rainbowColors.forEach((hex, idx) => {
        addPart(
          body,
          new THREE.TorusGeometry(0.58 - idx * 0.065, 0.036, 8, 22, Math.PI),
          MaterialLibrary.glossy(hex, 0.75),
          [0, 0.08, -0.22]
        );
      });

      addPart(body, new THREE.SphereGeometry(0.38, 18, 14), cloudMat, [0, 0.06, 0]);
      addPart(body, new THREE.SphereGeometry(0.3, 14, 12), cloudMat, [-0.36, -0.05, 0.02]);
      addPart(body, new THREE.SphereGeometry(0.32, 14, 12), cloudMat, [0.36, -0.04, 0.02]);
      addPart(body, new THREE.SphereGeometry(0.26, 14, 12), cloudMat, [0.16, 0.22, -0.05]);

      const drops = new THREE.Group();
      const dropGeo = createLeafGeometry(0.22, 0.07, 0.05);
      addPart(drops, dropGeo, dropMat, [-0.24, -0.34, 0], [0, 0, Math.PI]);
      addPart(drops, dropGeo, dropMat, [0, -0.42, 0], [0, 0, Math.PI]);
      addPart(drops, dropGeo, dropMat, [0.24, -0.34, 0], [0, 0, Math.PI]);
      body.add(drops);
      parts.foliage = drops;

      addTrackingPixarFace(body, parts, { eyeY: 0.04, eyeZ: 0.36, eyeSpread: 0.16, eyeScale: 0.72, irisHex: '#0284C7', smileY: -0.1, smileZ: 0.37 });
      return true;
    }

    default:
      return false;
  }
}
