import * as THREE from 'three';
import { MaterialLibrary } from '../MaterialLibrary.ts';
import { ToyRig } from '../PhysicsAnimator.ts';

export function addMesh(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  pos?: [number, number, number],
  rot?: [number, number, number],
  scale?: [number, number, number]
): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  if (pos) m.position.set(pos[0], pos[1], pos[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) m.scale.set(scale[0], scale[1], scale[2]);
  parent.add(m);
  return m;
}

/** Add expressive Pixar-style glossy blinking 3D eyes with bright catchlights + cheeks */
export function addPixarFace(
  parent: THREE.Object3D,
  parts: ToyRig['parts'],
  opts?: {
    eyeY?: number;
    eyeZ?: number;
    eyeSpread?: number;
    eyeScale?: number;
    blush?: boolean;
    smileY?: number;
    smileZ?: number;
  }
) {
  const eyeY = opts?.eyeY ?? 0.08;
  const eyeZ = opts?.eyeZ ?? 0.48;
  const spread = opts?.eyeSpread ?? 0.2;
  const s = opts?.eyeScale ?? 1;

  const whiteMat = MaterialLibrary.eyeWhite();
  const pupilMat = MaterialLibrary.eyePupil();

  const makeEye = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * spread, eyeY, eyeZ);

    // Sclera
    addMesh(pivot, new THREE.SphereGeometry(0.11 * s, 14, 12), whiteMat, [0, 0, 0], undefined, [1, 1.12, 0.7]);
    // Glossy pupil
    addMesh(pivot, new THREE.SphereGeometry(0.072 * s, 12, 10), pupilMat, [side * -0.01, 0, 0.055 * s]);
    // Dual specular catchlights
    addMesh(pivot, new THREE.SphereGeometry(0.028 * s, 8, 8), whiteMat, [0.025 * s, 0.035 * s, 0.105 * s]);
    addMesh(pivot, new THREE.SphereGeometry(0.014 * s, 8, 8), whiteMat, [-0.022 * s, -0.025 * s, 0.108 * s]);

    parent.add(pivot);
    return pivot;
  };

  parts.eyeL = makeEye(-1);
  parts.eyeR = makeEye(1);

  if (opts?.blush !== false) {
    const blushMat = MaterialLibrary.blush();
    const blushGeo = new THREE.SphereGeometry(0.085 * s, 10, 8);
    addMesh(parent, blushGeo, blushMat, [-spread * 1.35, eyeY - 0.13 * s, eyeZ - 0.05], undefined, [1.2, 0.7, 0.45]);
    addMesh(parent, blushGeo, blushMat, [spread * 1.35, eyeY - 0.13 * s, eyeZ - 0.05], undefined, [1.2, 0.7, 0.45]);
  }

  // Cute curved smile torus arc
  const smileY = opts?.smileY ?? eyeY - 0.16 * s;
  const smileZ = opts?.smileZ ?? eyeZ + 0.02;
  const smileGeo = new THREE.TorusGeometry(0.1 * s, 0.024 * s, 8, 16, Math.PI);
  const smileMat = MaterialLibrary.toy('#5C2D14', { roughness: 0.35, clearcoat: 0.3, bump: 'none' });
  const smile = addMesh(parent, smileGeo, smileMat, [0, smileY, smileZ], [0, 0, Math.PI]);
  parts.mouth = smile;
}

/** Create an extruded plump 3D golden star geometry */
export function create3DStarGeometry(outerR = 0.55, innerR = 0.25, depth = 0.2): THREE.ExtrudeGeometry {
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
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

/** Dispose all unique geometries inside a temporary object tree without disposing shared MaterialLibrary materials */
export function disposeObjectGeometries(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry && !mesh.geometry.userData.shared) {
        mesh.geometry.dispose();
      }
      const mat = mesh.material;
      if (mat instanceof THREE.ShaderMaterial || (mat instanceof THREE.Material && mat.userData.disposable)) {
        mat.dispose();
      }
    }
  });
}
