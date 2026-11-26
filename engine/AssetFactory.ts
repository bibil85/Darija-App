import * as THREE from 'three';
import { MaterialLibrary } from './MaterialLibrary.ts';
import { SpringScalar, ToyRig } from './PhysicsAnimator.ts';
import { buildBespokeModel } from '../src/3d/models/index.ts';
import { TODDLER_UX_CONFIG } from '../src/ux/ToddlerUXGuard.ts';
import { addMesh } from './assets/helpers.ts';

/**
 * Procedural 3D Toy-Box AssetFactory.
 * Delegates all 68 Darija vocabulary toys to the bespoke multi-part category builders in
 * `src/3d/models/` (Animals, Food, Vehicles, Nature, Family/Home) and provides Moroccan game props.
 */
export class AssetFactory {
  private static sharedHitSphere = (() => {
    const g = new THREE.SphereGeometry(1.05, 10, 8);
    g.userData.shared = true;
    return g;
  })();

  /** Build a fully rigged, articulated 3D ToyObject with touch-tracking pupils & generous hitbox */
  static createWordToy(wordId: string, opts?: { scale?: number; hitRadius?: number }): ToyRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    const parts: ToyRig['parts'] = {};
    buildBespokeModel(wordId, bodyGroup, parts);

    // Generous +30% expanded invisible hitbox sphere for effortless toddler touch raycasting!
    const hitMesh = new THREE.Mesh(this.sharedHitSphere, MaterialLibrary.invisibleHitbox());
    hitMesh.position.set(0, 0.78, 0);
    const hr = (opts?.hitRadius ?? 1.15) * TODDLER_UX_CONFIG.HITBOX_FORGIVENESS_SCALE;
    hitMesh.scale.setScalar(hr);
    hitMesh.userData.isHitbox = true;
    hitMesh.userData.wordId = wordId;
    root.add(hitMesh);

    const baseScale = opts?.scale ?? 1;
    bodyGroup.scale.setScalar(baseScale);

    return {
      root,
      bodyGroup,
      hitMesh,
      parts,
      squashSpring: new SpringScalar(0, 260, 14),
      hopSpring: new SpringScalar(0, 200, 13),
      spinSpring: new SpringScalar(0, 150, 15),
      wiggleSpring: new SpringScalar(0, 320, 11),
      phase: Math.random() * Math.PI * 2,
      baseScale,
    };
  }

  /** Build a circular Moroccan ceramic showcase pedestal */
  static createPedestal(accentHex = '#F59E0B', radius = 1.15): THREE.Group {
    const group = new THREE.Group();
    addMesh(
      group,
      new THREE.CylinderGeometry(radius, radius * 1.08, 0.24, 28),
      MaterialLibrary.toy('#FFF7E6', { clearcoat: 0.45 }),
      [0, -0.12, 0]
    );
    addMesh(
      group,
      new THREE.TorusGeometry(radius * 0.98, 0.065, 10, 32),
      MaterialLibrary.glossy(accentHex, 0.85),
      [0, -0.01, 0],
      [Math.PI / 2, 0, 0]
    );
    return group;
  }

  /** Build a 3D Moroccan Arched Palace Door on a swinging hinge pivot with peeking glowing eyes */
  static createMoroccanDoor(doorHex: string, trimHex = '#FBBF24'): {
    root: THREE.Group;
    doorHinge: THREE.Group;
    hitMesh: THREE.Mesh;
    peekingEyes: THREE.Group;
  } {
    const root = new THREE.Group();
    const frameMat = MaterialLibrary.toy('#FFF7E6', { roughness: 0.42 });
    const doorMat = MaterialLibrary.toy(doorHex, { bump: 'wood', clearcoat: 0.35 });
    const trimMat = MaterialLibrary.gold(trimHex);
    const darkMat = MaterialLibrary.toy('#0F172A', { roughness: 0.8, bump: 'none' });

    // Outer Palace Arch Frame
    addMesh(root, new THREE.BoxGeometry(0.2, 2.2, 0.32), frameMat, [-0.95, 1.1, 0]);
    addMesh(root, new THREE.BoxGeometry(0.2, 2.2, 0.32), frameMat, [0.95, 1.1, 0]);
    addMesh(root, new THREE.TorusGeometry(0.95, 0.14, 12, 24, Math.PI), frameMat, [0, 2.15, 0]);
    // Dark interior alcove behind door
    addMesh(root, new THREE.BoxGeometry(1.72, 2.15, 0.08), darkMat, [0, 1.1, -0.35]);

    // Swinging Beveled Moroccan Arched Door Leaf attached to left hinge!
    const doorHinge = new THREE.Group();
    doorHinge.position.set(-0.84, 0, 0.12);
    root.add(doorHinge);

    // Single seamless extruded arch shape (flush in XY plane, zero rotated cylinder seam!)
    const archShape = new THREE.Shape();
    archShape.moveTo(0, 0);
    archShape.lineTo(1.68, 0);
    archShape.lineTo(1.68, 2.08);
    archShape.absarc(0.84, 2.08, 0.84, 0, Math.PI, false);
    archShape.lineTo(0, 0);

    const archGeo = new THREE.ExtrudeGeometry(archShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    addMesh(doorHinge, archGeo, doorMat, [0, 0, -0.06]);

    // Golden Knocker Ring
    addMesh(doorHinge, new THREE.TorusGeometry(0.14, 0.035, 10, 18), trimMat, [1.34, 1.12, 0.12]);
    addMesh(doorHinge, new THREE.SphereGeometry(0.06, 10, 8), trimMat, [1.34, 1.24, 0.11]);

    // Peeking window cutout + blinking 3D eyes!
    addMesh(doorHinge, new THREE.BoxGeometry(0.92, 0.34, 0.06), darkMat, [0.84, 1.72, 0.09]);
    const peekingEyes = new THREE.Group();
    peekingEyes.position.set(0.84, 1.72, 0.13);
    const whiteMat = MaterialLibrary.eyeWhite();
    const pupilMat = MaterialLibrary.eyePupil();
    addMesh(peekingEyes, new THREE.SphereGeometry(0.11, 12, 10), whiteMat, [-0.18, 0, 0]);
    addMesh(peekingEyes, new THREE.SphereGeometry(0.06, 10, 8), pupilMat, [-0.17, 0, 0.08]);
    addMesh(peekingEyes, new THREE.SphereGeometry(0.11, 12, 10), whiteMat, [0.18, 0, 0]);
    addMesh(peekingEyes, new THREE.SphereGeometry(0.06, 10, 8), pupilMat, [0.17, 0, 0.08]);
    doorHinge.add(peekingEyes);

    // Generous +30% expanded invisible hitbox
    const s = TODDLER_UX_CONFIG.HITBOX_FORGIVENESS_SCALE;
    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.1 * s, 3.0 * s, 0.9 * s),
      MaterialLibrary.invisibleHitbox()
    );
    hitMesh.position.set(0, 1.4, 0.2);
    hitMesh.userData.isHitbox = true;
    root.add(hitMesh);

    return { root, doorHinge, hitMesh, peekingEyes };
  }

  /** Build a 3D Woven Moroccan Basket with glowing rim ring for Sort Baskets */
  static createMoroccanBasket(accentHex: string): {
    root: THREE.Group;
    glowRing: THREE.Mesh;
    hitMesh: THREE.Mesh;
  } {
    const root = new THREE.Group();
    const basketMat = MaterialLibrary.toy(accentHex, { bump: 'woven', roughness: 0.52, clearcoat: 0.18 });
    const rimMat = MaterialLibrary.toy('#FFF7E6', { clearcoat: 0.35 });

    addMesh(root, new THREE.CylinderGeometry(1.12, 0.82, 0.96, 24), basketMat, [0, 0.48, 0]);
    addMesh(root, new THREE.TorusGeometry(1.12, 0.11, 10, 28), rimMat, [0, 0.98, 0], [Math.PI / 2, 0, 0]);
    // Clean inset inner hollow (positioned above outer top face so zero z-fighting!)
    const innerHollow = addMesh(
      root,
      new THREE.CylinderGeometry(0.98, 0.98, 0.04, 22),
      MaterialLibrary.toy('#451A03', { roughness: 0.92, clearcoat: 0, bump: 'none' }),
      [0, 0.97, 0]
    );
    innerHollow.receiveShadow = false;

    const glowRing = addMesh(
      root,
      new THREE.TorusGeometry(1.32, 0.06, 10, 32),
      MaterialLibrary.glow('#FDE047', 0.85),
      [0, 0.08, 0],
      [Math.PI / 2, 0, 0]
    );
    glowRing.visible = false;

    const bs = TODDLER_UX_CONFIG.HITBOX_FORGIVENESS_SCALE;
    const hitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45 * bs, 1.25 * bs, 1.8 * bs, 12),
      MaterialLibrary.invisibleHitbox()
    );
    hitMesh.position.set(0, 0.8, 0);
    hitMesh.userData.isHitbox = true;
    root.add(hitMesh);

    return { root, glowRing, hitMesh };
  }
}
