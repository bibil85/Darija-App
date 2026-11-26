import * as THREE from 'three';

/**
 * Hierarchical animated sub-part pivots exposed by every bespoke 3D model builder.
 * Supports independent idle animations AND live touch-tracking pupils!
 */
export interface ArticulatedParts {
  head?: THREE.Object3D;
  earL?: THREE.Object3D;
  earR?: THREE.Object3D;
  eyeL?: THREE.Object3D;
  eyeR?: THREE.Object3D;
  /** Independent pupil groups inside each eye socket that smoothly track user touch! */
  pupilL?: THREE.Object3D;
  pupilR?: THREE.Object3D;
  snout?: THREE.Object3D;
  tail?: THREE.Object3D;
  mouth?: THREE.Object3D;
  wingL?: THREE.Object3D;
  wingR?: THREE.Object3D;
  foliage?: THREE.Object3D;
  wheels?: THREE.Object3D[];
  propeller?: THREE.Object3D;
  orbiters?: THREE.Object3D;
}

export interface LookTarget {
  /** Smoothed normalized screen X (-1..1) from latest touch/pointer */
  x: number;
  /** Smoothed normalized screen Y (-1..1) from latest touch/pointer */
  y: number;
}
