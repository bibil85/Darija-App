import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { ArticulatedParts } from './types.ts';

/** Add a shadow-casting/receiving mesh cleanly to any hierarchical pivot */
export function addPart(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  pos?: [number, number, number],
  rot?: [number, number, number],
  scale?: [number, number, number]
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  parent.add(mesh);
  return mesh;
}

/**
 * Create a smooth sculpted rounded-rectangle 2D shape for beveled ExtrudeGeometry
 * (used for vehicle chassis, windows, stylized furniture, clouds, and toy plaques).
 */
export function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  const radius = Math.min(r, hw, hh);
  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return shape;
}

/** Create an extruded beveled teardrop/leaf/ear/petal silhouette */
export function createLeafGeometry(length = 0.42, width = 0.22, depth = 0.05): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width, length * 0.28, width * 0.85, length * 0.78, 0, length);
  shape.bezierCurveTo(-width * 0.85, length * 0.78, -width, length * 0.28, 0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.45,
    bevelSize: width * 0.12,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/** Create a beveled 5-point 3D star */
export function createBeveledStarGeometry(outerR = 0.58, innerR = 0.26, depth = 0.2): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

/**
 * Create sculpted organic lathed body from normalized [radius, y] control points.
 * Replaces plain spheres with plump pear-shaped Pixar toy silhouettes!
 */
export function createLathedProfile(points: Array<[number, number]>, segments = 24): THREE.LatheGeometry {
  const vecs = points.map(([r, y]) => new THREE.Vector2(Math.max(0.005, r), y));
  return new THREE.LatheGeometry(vecs, segments);
}

/**
 * Attach expressive Pixar-grade 3D eyes with independent touch-tracking pupil pivots (`pupilL`, `pupilR`),
 * glossy iris rings, dual specular catchlights, rosy cheeks, and optional eyebrows & smile!
 */
export function addTrackingPixarFace(
  parent: THREE.Object3D,
  parts: ArticulatedParts,
  opts?: {
    eyeY?: number;
    eyeZ?: number;
    eyeSpread?: number;
    eyeScale?: number;
    irisHex?: string;
    eyebrowHex?: string;
    blush?: boolean;
    smile?: boolean;
    smileY?: number;
    smileZ?: number;
  }
) {
  const eyeY = opts?.eyeY ?? 0.1;
  const eyeZ = opts?.eyeZ ?? 0.44;
  const spread = opts?.eyeSpread ?? 0.19;
  const s = opts?.eyeScale ?? 1;

  const whiteMat = MaterialLibrary.eyeWhite();
  const irisMat = MaterialLibrary.glossy(opts?.irisHex ?? '#5C3218', 0.95);
  const pupilMat = MaterialLibrary.eyePupil();

  const buildEye = (side: -1 | 1) => {
    const socket = new THREE.Group();
    socket.position.set(side * spread, eyeY, eyeZ);

    // Glossy slightly-oval sclera
    addPart(socket, new THREE.SphereGeometry(0.115 * s, 16, 14), whiteMat, [0, 0, 0], undefined, [1.0, 1.14, 0.72]);

    // Independent pupil/iris pivot that tracks the user's touch across the screen!
    const pupilPivot = new THREE.Group();
    pupilPivot.position.set(0, 0, 0.045 * s);
    pupilPivot.userData.baseZ = 0.045 * s;
    pupilPivot.userData.trackRange = 0.044 * s;

    // Colored iris disc
    addPart(pupilPivot, new THREE.SphereGeometry(0.078 * s, 14, 12), irisMat, [0, 0, 0], undefined, [1, 1.06, 0.65]);
    // Deep glossy pupil
    addPart(pupilPivot, new THREE.SphereGeometry(0.052 * s, 12, 10), pupilMat, [0, 0, 0.032 * s], undefined, [1, 1.04, 0.55]);
    // Dual Pixar specular catchlights
    addPart(pupilPivot, new THREE.SphereGeometry(0.025 * s, 8, 8), whiteMat, [0.022 * s, 0.028 * s, 0.058 * s]);
    addPart(pupilPivot, new THREE.SphereGeometry(0.013 * s, 8, 8), whiteMat, [-0.02 * s, -0.022 * s, 0.06 * s]);

    socket.add(pupilPivot);
    parent.add(socket);

    if (opts?.eyebrowHex) {
      const browMat = MaterialLibrary.toy(opts.eyebrowHex, { roughness: 0.45, bump: 'none' });
      addPart(
        parent,
        new THREE.CapsuleGeometry(0.022 * s, 0.1 * s, 4, 8),
        browMat,
        [side * spread, eyeY + 0.15 * s, eyeZ + 0.01],
        [0, 0, Math.PI / 2 - side * 0.15]
      );
    }

    return { socket, pupilPivot };
  };

  const left = buildEye(-1);
  const right = buildEye(1);
  parts.eyeL = left.socket;
  parts.eyeR = right.socket;
  parts.pupilL = left.pupilPivot;
  parts.pupilR = right.pupilPivot;

  if (opts?.blush !== false) {
    const blushMat = MaterialLibrary.blush();
    const blushGeo = new THREE.SphereGeometry(0.082 * s, 12, 10);
    addPart(parent, blushGeo, blushMat, [-spread * 1.38, eyeY - 0.13 * s, eyeZ - 0.05], undefined, [1.25, 0.72, 0.42]);
    addPart(parent, blushGeo, blushMat, [spread * 1.38, eyeY - 0.13 * s, eyeZ - 0.05], undefined, [1.25, 0.72, 0.42]);
  }

  if (opts?.smile !== false) {
    const smileY = opts?.smileY ?? eyeY - 0.17 * s;
    const smileZ = opts?.smileZ ?? eyeZ + 0.04;
    const smileMat = MaterialLibrary.toy('#5C2D14', { roughness: 0.32, clearcoat: 0.35, bump: 'none' });
    const smile = addPart(
      parent,
      new THREE.TorusGeometry(0.098 * s, 0.024 * s, 8, 16, Math.PI),
      smileMat,
      [0, smileY, smileZ],
      [0, 0, Math.PI]
    );
    parts.mouth = smile;
  }
}

/** Add delicate curved 3D whiskers to feline/lion/bunny snouts */
export function addWhiskers(parent: THREE.Object3D, y: number, z: number, spread = 0.24, color = '#7C2D12') {
  const mat = MaterialLibrary.toy(color, { roughness: 0.4, bump: 'none' });
  for (const side of [-1, 1] as const) {
    for (const dy of [-0.045, 0.025]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * spread * 0.7, y + dy, z),
        new THREE.Vector3(side * (spread + 0.14), y + dy - 0.015, z + 0.03),
        new THREE.Vector3(side * (spread + 0.28), y + dy - 0.05, z - 0.02),
      ]);
      addPart(parent, new THREE.TubeGeometry(curve, 8, 0.011, 6, false), mat);
    }
  }
}
