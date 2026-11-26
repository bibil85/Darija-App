import * as THREE from 'three';
import { AssetFactory } from '../AssetFactory.ts';
import { PhysicsAnimator, SpringScalar, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface ExploreBookCallbacks {
  onTapToy: () => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}

/**
 * 3D Toy-Box Showcase for Picture Book:
 * Displays a giant articulated 3D toy on a sunlit ceramic turntable pedestal!
 * - Swipe left/right anywhere on the 3D stage to spin & swipe cleanly to the next/previous Darija word!
 * - Tap the 3D toy for immediate anticipation squash, 360° celebratory hop, star burst, and Darija audio!
 */
export class ExploreBookScene implements BaseScene3D {
  readonly id = 'explore';
  private wordId: string;
  private accentHex: string;
  private callbacks: ExploreBookCallbacks;

  private ctx: SceneContext | null = null;
  private toyGroup = new THREE.Group();
  private toyRig: ToyRig | null = null;
  private pedestal: THREE.Group | null = null;
  private slideSpring = new SpringScalar(0, 210, 18);
  private dragRotY = new SpringScalar(0, 180, 16);

  private activePointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private draggedDist = 0;

  constructor(wordId: string, accentHex: string, callbacks: ExploreBookCallbacks) {
    this.wordId = wordId;
    this.accentHex = accentHex;
    this.callbacks = callbacks;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    ctx.cameraRig.setPose([0, 2.75, 7.1], [0, 1.15, 0]);
    ctx.stageRoot.add(this.toyGroup);
    this.loadWord(this.wordId, this.accentHex, 0);
  }

  /** Swap the showcased 3D toy with a spring slide-in animation */
  loadWord(wordId: string, accentHex: string, slideFromDir: -1 | 0 | 1 = 1) {
    this.wordId = wordId;
    this.accentHex = accentHex;
    if (!this.ctx) return;

    disposeObjectGeometries(this.toyGroup);
    while (this.toyGroup.children.length > 0) {
      this.toyGroup.remove(this.toyGroup.children[0]);
    }

    this.pedestal = AssetFactory.createPedestal(accentHex, 1.55);
    this.pedestal.position.set(0, 0.22, 0);
    this.toyGroup.add(this.pedestal);

    this.toyRig = AssetFactory.createWordToy(wordId, { scale: 1.52, hitRadius: 1.85 });
    this.toyRig.root.position.set(0, 0.25, 0);
    this.toyGroup.add(this.toyRig.root);

    this.slideSpring.value = slideFromDir * 4.5;
    this.slideSpring.target = 0;
    this.dragRotY.value = 0;
    this.dragRotY.target = 0;
    PhysicsAnimator.triggerTapBounce(this.toyRig, false);
  }

  triggerCelebrate(panX = 0) {
    if (!this.toyRig || !this.ctx) return;
    PhysicsAnimator.triggerTapBounce(this.toyRig, true);
    SoundFXEngine.playSpringBoing(1.2, panX);
    SoundFXEngine.playSparkleCascade(0, panX);
    this.ctx.particles.burstStars(new THREE.Vector3(0, 1.8, 0.3), 18);
    this.ctx.cameraRig.pulseZoom(0.35);
  }

  update(time: number, dt: number, ctx: SceneContext) {
    const sx = this.slideSpring.step(dt);
    const ry = this.dragRotY.step(dt);
    this.toyGroup.position.x = sx;
    this.toyGroup.rotation.y = ry;
    if (this.toyRig) {
      PhysicsAnimator.updateRig(this.toyRig, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.clientX;
    this.draggedDist = 0;

    if (this.toyRig) {
      PhysicsAnimator.triggerPressSquash(this.toyRig);
      const hits = ctx.raycast(e.ndcX, e.ndcY, [this.toyRig.hitMesh]);
      if (hits.length > 0) {
        ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, this.accentHex);
      }
    }
  }

  onPointerMove(e: PointerEvent3D) {
    if (this.activePointerId !== e.pointerId) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.draggedDist += Math.abs(dx);
    if (this.draggedDist > TODDLER_UX_CONFIG.TAP_SLOP_PX && this.toyRig) {
      PhysicsAnimator.releasePressSquash(this.toyRig);
    }
    this.dragRotY.target += dx * 0.012;
    this.slideSpring.target = Math.max(-1.4, Math.min(1.4, (e.clientX - this.startX) * 0.008));
  }

  onPointerUp(e: PointerEvent3D) {
    if (this.activePointerId !== e.pointerId) return;
    const totalDx = e.clientX - this.startX;
    const isTap = ToddlerUXGuard.isTapGesture(this.startX, this.startY, e.clientX, e.clientY);
    this.activePointerId = null;
    this.slideSpring.target = 0;

    if (this.toyRig) {
      PhysicsAnimator.releasePressSquash(this.toyRig);
    }

    if (totalDx <= -68) {
      if (!ToddlerUXGuard.canTriggerObject('explore:swipe', 160)) return;
      SoundFXEngine.playWhoosh(1);
      this.callbacks.onSwipeNext();
    } else if (totalDx >= 68) {
      if (!ToddlerUXGuard.canTriggerObject('explore:swipe', 160)) return;
      SoundFXEngine.playWhoosh(-1);
      this.callbacks.onSwipePrev();
    } else if (isTap || this.draggedDist < TODDLER_UX_CONFIG.TAP_SLOP_PX) {
      if (!ToddlerUXGuard.canTriggerObject(`explore:${this.wordId}`)) return;
      this.triggerCelebrate(e.ndcX);
      this.callbacks.onTapToy();
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    return new THREE.Vector3(0, 1.55, 0.55);
  }

  dispose() {
    this.ctx = null;
    this.toyRig = null;
    this.pedestal = null;
  }
}
