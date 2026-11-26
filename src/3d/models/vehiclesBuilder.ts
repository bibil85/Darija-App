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
 * Bespoke Multi-Part Sculpted 3D Vehicles Builder.
 * Every vehicle uses beveled extruded silhouettes, rotating axle wheels or spinning propellers,
 * glowing headlights, and friendly Pixar windshield eyes with touch-tracking pupils!
 */
export function buildVehicleModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): boolean {
  const buildWheel = (parent: THREE.Object3D, x: number, y: number, z: number, radius = 0.22) => {
    const wheel = new THREE.Group();
    wheel.position.set(x, y, z);
    const tireMat = MaterialLibrary.toy('#1E293B', { roughness: 0.72, clearcoat: 0.1 });
    const rimMat = MaterialLibrary.gold('#E2E8F0');
    const hubMat = MaterialLibrary.glossy('#EF4444', 0.8);

    addPart(wheel, new THREE.CylinderGeometry(radius, radius, 0.14, 18), tireMat, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addPart(wheel, new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.16, 14), rimMat, [0, 0, 0], [Math.PI / 2, 0, 0]);
    // Wheel spokes so spinning motion is visibly crisp!
    addPart(wheel, new THREE.BoxGeometry(radius * 0.95, 0.04, 0.17), hubMat);
    addPart(wheel, new THREE.BoxGeometry(0.04, radius * 0.95, 0.17), hubMat);
    parent.add(wheel);
    return wheel;
  };

  switch (wordId) {
    case 'car': {
      // Tonobil — Beveled Pixar Toy Coupe with rotating wheels, chrome bumper, headlights & tracking eyes!
      const redMat = MaterialLibrary.glossy('#EF4444', 0.95);
      const roofMat = MaterialLibrary.glossy('#FFFFFF', 0.9);
      const winMat = MaterialLibrary.glossy('#BAE6FD', 0.92);
      const chromeMat = MaterialLibrary.gold('#E2E8F0');
      const lightMat = MaterialLibrary.glow('#FDE047', 0.9);

      const body = new THREE.Group();
      body.position.set(0, 0.4, 0);
      container.add(body);
      parts.head = body;

      // Sculpted rounded side silhouette extruded along Z!
      const carShape = new THREE.Shape();
      carShape.moveTo(-0.68, 0);
      carShape.lineTo(0.68, 0);
      carShape.quadraticCurveTo(0.74, 0.04, 0.72, 0.22);
      carShape.quadraticCurveTo(0.66, 0.34, 0.42, 0.36);
      carShape.lineTo(0.26, 0.66);
      carShape.quadraticCurveTo(0.2, 0.72, -0.24, 0.72);
      carShape.quadraticCurveTo(-0.34, 0.7, -0.44, 0.38);
      carShape.quadraticCurveTo(-0.68, 0.36, -0.72, 0.16);
      carShape.closePath();

      const chassisGeo = new THREE.ExtrudeGeometry(carShape, {
        depth: 0.74,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.06,
        bevelSegments: 3,
      });
      chassisGeo.translate(0, 0, -0.37);
      addPart(body, chassisGeo, redMat);

      // White racing roof cap + recessed windshield
      addPart(body, new THREE.BoxGeometry(0.56, 0.06, 0.68), roofMat, [-0.04, 0.75, 0]);
      addPart(body, new THREE.BoxGeometry(0.14, 0.24, 0.64), winMat, [0.32, 0.52, 0], [0, 0, 0.42]);
      addPart(body, new THREE.BoxGeometry(0.46, 0.22, 0.88), winMat, [-0.05, 0.52, 0]);

      // Chrome bumpers & glowing headlights
      addPart(body, new THREE.CapsuleGeometry(0.05, 0.62, 6, 10), chromeMat, [0.76, 0.08, 0], [Math.PI / 2, 0, 0]);
      addPart(body, new THREE.CapsuleGeometry(0.05, 0.62, 6, 10), chromeMat, [-0.74, 0.08, 0], [Math.PI / 2, 0, 0]);
      addPart(body, new THREE.SphereGeometry(0.095, 12, 10), lightMat, [0.74, 0.22, 0.24]);
      addPart(body, new THREE.SphereGeometry(0.095, 12, 10), lightMat, [0.74, 0.22, -0.24]);

      parts.wheels = [
        buildWheel(body, -0.42, 0.02, 0.42, 0.22),
        buildWheel(body, 0.42, 0.02, 0.42, 0.22),
        buildWheel(body, -0.42, 0.02, -0.42, 0.22),
        buildWheel(body, 0.42, 0.02, -0.42, 0.22),
      ];

      // Cute Pixar windshield eyes facing camera (+Z)!
      addTrackingPixarFace(body, parts, {
        eyeY: 0.52,
        eyeZ: 0.44,
        eyeSpread: 0.14,
        eyeScale: 0.68,
        irisHex: '#1D5FD1',
        smileY: 0.24,
        smileZ: 0.46,
      });
      return true;
    }

    case 'bus': {
      // Tobis — Chunky Rounded Saffron Moroccan School Bus with panoramic windows & roof rack!
      const busMat = MaterialLibrary.glossy('#F59E0B', 0.88);
      const stripeMat = MaterialLibrary.glossy('#1D5FD1', 0.85);
      const winMat = MaterialLibrary.glossy('#BAE6FD', 0.92);
      const lightMat = MaterialLibrary.glow('#FEF08A', 0.9);

      const body = new THREE.Group();
      body.position.set(0, 0.42, 0);
      container.add(body);
      parts.head = body;

      const busShape = createRoundedRectShape(1.54, 0.86, 0.18);
      const busGeo = new THREE.ExtrudeGeometry(busShape, {
        depth: 0.72,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.06,
        bevelSegments: 3,
      });
      busGeo.translate(0, 0.45, -0.36);
      addPart(body, busGeo, busMat);
      addPart(body, new THREE.BoxGeometry(1.7, 0.12, 0.91), stripeMat, [0, 0.24, 0]);

      // Panoramic side windows
      for (const wx of [-0.46, 0, 0.46]) {
        addPart(body, new THREE.BoxGeometry(0.32, 0.28, 0.88), winMat, [wx, 0.58, 0]);
      }
      // Roof beacon
      addPart(body, new THREE.CylinderGeometry(0.14, 0.18, 0.12, 12), stripeMat, [0, 0.98, 0]);
      // Headlights
      addPart(body, new THREE.SphereGeometry(0.09, 10, 8), lightMat, [0.81, 0.24, 0.22]);
      addPart(body, new THREE.SphereGeometry(0.09, 10, 8), lightMat, [0.81, 0.24, -0.22]);

      parts.wheels = [
        buildWheel(body, -0.48, 0.02, 0.42, 0.22),
        buildWheel(body, 0.48, 0.02, 0.42, 0.22),
        buildWheel(body, -0.48, 0.02, -0.42, 0.22),
        buildWheel(body, 0.48, 0.02, -0.42, 0.22),
      ];

      addTrackingPixarFace(body, parts, {
        eyeY: 0.58,
        eyeZ: 0.45,
        eyeSpread: 0.18,
        eyeScale: 0.72,
        irisHex: '#1E3A8A',
        smileY: 0.28,
        smileZ: 0.46,
      });
      return true;
    }

    case 'plane': {
      // Tiyara — Plump Pixar Prop Plane with swept wings, tail fin & spinning nose propeller!
      const hullMat = MaterialLibrary.glossy('#38BDF8', 0.92);
      const wingMat = MaterialLibrary.glossy('#F97316', 0.88);
      const noseMat = MaterialLibrary.glossy('#EF4444', 0.9);
      const propMat = MaterialLibrary.gold('#FDE047');

      const body = new THREE.Group();
      body.position.set(0, 0.88, 0);
      body.rotation.y = -0.32;
      container.add(body);
      parts.head = body;

      // Sculpted Lathed Fuselage along X axis
      const fuseGeo = createLathedProfile([
        [0.01, -0.78], [0.14, -0.68], [0.3, -0.2], [0.36, 0.26], [0.32, 0.56], [0.18, 0.7], [0.01, 0.74],
      ], 22);
      addPart(body, fuseGeo, hullMat, [0, 0, 0], [0, 0, -Math.PI / 2]);

      // Cockpit canopy bubble
      addPart(body, new THREE.SphereGeometry(0.24, 16, 12), MaterialLibrary.glossy('#E0F2FE', 0.96), [0.1, 0.28, 0], undefined, [1.35, 0.8, 0.85]);

      // Swept Beveled Wings + Tail Stabilizer
      const wingGeo = createLeafGeometry(0.95, 0.28, 0.08);
      addPart(body, wingGeo, wingMat, [0.08, -0.02, 0.22], [Math.PI / 2, 0, 0.15]);
      addPart(body, wingGeo, wingMat, [0.08, -0.02, -0.22], [-Math.PI / 2, 0, -0.15]);
      addPart(body, createLeafGeometry(0.45, 0.16, 0.06), wingMat, [-0.62, 0.12, 0], [0, 0, 0.35]);

      // Spinning Front Propeller Pivot!
      const propeller = new THREE.Group();
      propeller.position.set(0.76, 0, 0);
      addPart(propeller, new THREE.SphereGeometry(0.11, 12, 10), noseMat);
      addPart(propeller, new THREE.BoxGeometry(0.04, 0.76, 0.12), propMat);
      addPart(propeller, new THREE.BoxGeometry(0.04, 0.12, 0.76), propMat);
      body.add(propeller);
      parts.propeller = propeller;

      addTrackingPixarFace(body, parts, {
        eyeY: 0.12,
        eyeZ: 0.34,
        eyeSpread: 0.16,
        eyeScale: 0.72,
        irisHex: '#1D5FD1',
        smileY: -0.08,
        smileZ: 0.36,
      });
      return true;
    }

    case 'boat': {
      // Bato — Sculpted Wooden Sailboat with curved hull, billowing sail & waving pennant!
      const hullMat = MaterialLibrary.glossy('#E5633B', 0.85);
      const deckMat = MaterialLibrary.toy('#FEF3C7', { bump: 'wood' });
      const mastMat = MaterialLibrary.toy('#92400E', { bump: 'wood' });
      const sailMat = MaterialLibrary.toy('#FFFFFF', { roughness: 0.45 });
      const flagMat = MaterialLibrary.glossy('#14A392', 0.75);

      const body = new THREE.Group();
      body.position.set(0, 0.45, 0);
      container.add(body);
      parts.head = body;

      // Sculpted Curved Boat Hull
      const hullShape = new THREE.Shape();
      hullShape.moveTo(-0.72, 0.36);
      hullShape.lineTo(0.76, 0.36);
      hullShape.quadraticCurveTo(0.62, -0.05, 0.38, -0.08);
      hullShape.lineTo(-0.42, -0.08);
      hullShape.quadraticCurveTo(-0.62, -0.04, -0.72, 0.36);
      const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
        depth: 0.68,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.06,
        bevelSegments: 3,
      });
      hullGeo.translate(0, 0, -0.34);
      addPart(body, hullGeo, hullMat);
      addPart(body, new THREE.BoxGeometry(1.38, 0.08, 0.72), deckMat, [0, 0.38, 0]);

      // Wooden Mast & Billowing Sail (compact proportions so pennant clears top HUD!)
      addPart(body, new THREE.CylinderGeometry(0.045, 0.055, 0.92, 10), mastMat, [-0.04, 0.82, 0]);
      const sail = new THREE.Group();
      sail.position.set(-0.02, 0.44, 0);
      const sailShape = new THREE.Shape();
      sailShape.moveTo(0, 0);
      sailShape.quadraticCurveTo(0.42, 0.26, 0.58, 0.04);
      sailShape.quadraticCurveTo(0.28, 0.48, 0, 0.78);
      sailShape.closePath();
      const sailGeo = new THREE.ExtrudeGeometry(sailShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
      sailGeo.translate(0, 0, -0.025);
      addPart(sail, sailGeo, sailMat);
      // Pennant flag on top
      addPart(sail, createLeafGeometry(0.26, 0.085, 0.03), flagMat, [0, 0.8, 0], [0, 0, -Math.PI / 2]);
      body.add(sail);
      parts.foliage = sail;

      addTrackingPixarFace(body, parts, {
        eyeY: 0.18,
        eyeZ: 0.42,
        eyeSpread: 0.18,
        eyeScale: 0.72,
        irisHex: '#0F766E',
        smileY: 0.04,
        smileZ: 0.44,
      });
      return true;
    }

    case 'train': {
      // Tran — Classic Pixar Steam Locomotive with boiler, brass dome, cowcatcher & spinning wheels!
      const engineMat = MaterialLibrary.glossy('#16A34A', 0.88);
      const cabMat = MaterialLibrary.glossy('#EF4444', 0.88);
      const goldMat = MaterialLibrary.gold('#FBBF24');
      const stackMat = MaterialLibrary.toy('#1E293B');

      const body = new THREE.Group();
      body.position.set(0, 0.4, 0);
      container.add(body);
      parts.head = body;

      // Chassis base
      addPart(body, new THREE.BoxGeometry(1.48, 0.16, 0.72), stackMat, [0, 0.06, 0]);
      // Round boiler drum
      addPart(body, new THREE.CylinderGeometry(0.32, 0.32, 0.92, 20), engineMat, [0.22, 0.42, 0], [0, 0, Math.PI / 2]);
      // Tall engineer cab
      addPart(body, new THREE.BoxGeometry(0.56, 0.78, 0.72), cabMat, [-0.42, 0.54, 0]);
      addPart(body, new THREE.BoxGeometry(0.64, 0.1, 0.8), goldMat, [-0.42, 0.96, 0]);
      // Flared chimney smokestack + brass steam dome + front cowcatcher
      addPart(body, new THREE.CylinderGeometry(0.14, 0.09, 0.36, 14), stackMat, [0.46, 0.84, 0]);
      addPart(body, new THREE.SphereGeometry(0.14, 14, 12), goldMat, [0.12, 0.74, 0]);
      addPart(body, new THREE.ConeGeometry(0.28, 0.34, 4), cabMat, [0.8, 0.14, 0], [0, Math.PI / 4, -Math.PI / 2]);
      // Floating white steam puff above stack!
      const puff = new THREE.Group();
      puff.position.set(0.46, 1.15, 0);
      addPart(puff, new THREE.SphereGeometry(0.14, 10, 8), MaterialLibrary.toy('#FFFFFF', { bump: 'none' }));
      addPart(puff, new THREE.SphereGeometry(0.1, 10, 8), MaterialLibrary.toy('#FFFFFF', { bump: 'none' }), [-0.14, 0.12, 0]);
      body.add(puff);
      parts.foliage = puff;

      parts.wheels = [
        buildWheel(body, -0.44, 0.02, 0.4, 0.24),
        buildWheel(body, 0.08, -0.02, 0.4, 0.19),
        buildWheel(body, 0.48, -0.02, 0.4, 0.19),
        buildWheel(body, -0.44, 0.02, -0.4, 0.24),
        buildWheel(body, 0.08, -0.02, -0.4, 0.19),
        buildWheel(body, 0.48, -0.02, -0.4, 0.19),
      ];

      addTrackingPixarFace(body, parts, {
        eyeY: 0.48,
        eyeZ: 0.34,
        eyeSpread: 0.16,
        eyeScale: 0.68,
        irisHex: '#1E293B',
        smileY: 0.28,
        smileZ: 0.35,
      });
      return true;
    }

    default:
      return false;
  }
}
