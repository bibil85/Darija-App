import * as THREE from 'three';
import { CameraRig } from '../PhysicsAnimator.ts';
import { ParticleSystem } from '../ParticleSystem.ts';
import { TouchFeedbackSystem } from '../TouchFeedback.ts';
import { LookTarget } from '../../src/3d/models/types.ts';

export interface PointerEvent3D {
  pointerId: number;
  ndcX: number;
  ndcY: number;
  clientX: number;
  clientY: number;
}

export interface SceneContext {
  stageRoot: THREE.Group;
  particles: ParticleSystem;
  touchFeedback: TouchFeedbackSystem;
  cameraRig: CameraRig;
  camera: THREE.PerspectiveCamera;
  /** Live smoothed touch/pointer target (-1..1) driving 3D animal/character pupil tracking! */
  lookTarget: LookTarget;
  raycast: (ndcX: number, ndcY: number, objects: THREE.Object3D[]) => THREE.Intersection[];
  screenToPlane: (ndcX: number, ndcY: number, plane: THREE.Plane) => THREE.Vector3 | null;
}

export interface BaseScene3D {
  readonly id: string;
  mount(ctx: SceneContext): void;
  update(time: number, dt: number, ctx: SceneContext): void;
  onPointerDown?(e: PointerEvent3D, ctx: SceneContext): void;
  onPointerMove?(e: PointerEvent3D, ctx: SceneContext): void;
  onPointerUp?(e: PointerEvent3D, ctx: SceneContext): void;
  /** Optional 3D world position for the diegetic glowing pointer hand after 5s of inactivity */
  getHintTarget?(time: number): THREE.Vector3 | null;
  dispose(ctx: SceneContext): void;
}
