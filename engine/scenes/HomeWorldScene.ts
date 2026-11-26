import * as THREE from 'three';
import { AssetFactory } from '../AssetFactory.ts';
import { PhysicsAnimator, ToyRig } from '../PhysicsAnimator.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface HomeWorldCallbacks {
  onSba3Tap: () => void;
  onPropTap: (wordId: string) => void;
}

/**
 * Living 3D Home Courtyard Stage:
 * Sba3 the 3D Moroccan Atlas Lion cub sits proudly on a ceramic pedestal in the sunlit courtyard,
 * surrounded by playful orbiting 3D toys with micro-squash press feel & elastic spring boings!
 */
export class HomeWorldScene implements BaseScene3D {
  readonly id = 'home';
  private callbacks: HomeWorldCallbacks;
  private sba3!: ToyRig;
  private toys: Array<{ rig: ToyRig; wordId: string; orbitAngle: number; orbitRadius: number; baseY: number }> = [];
  private hitTargets: THREE.Object3D[] = [];
  private pressedRigs = new Map<number, { rig: ToyRig; isSba3: boolean; wordId?: string; objectKey: string }>();
  private comboCount = 0;

  constructor(callbacks: HomeWorldCallbacks) {
    this.callbacks = callbacks;
  }

  mount(ctx: SceneContext) {
    ctx.cameraRig.setPose([0, 3.0, 9.2], [0, 1.25, 0]);

    // Central Moroccan Pedestal + Sba3 the Lion!
    const pedestal = AssetFactory.createPedestal('#F59E0B', 1.45);
    pedestal.position.set(0, 0.2, 0.2);
    ctx.stageRoot.add(pedestal);

    this.sba3 = AssetFactory.createWordToy('lion', { scale: 1.45, hitRadius: 1.55 });
    this.sba3.root.position.set(0, 0.2, 0.2);
    this.sba3.hitMesh.userData.isSba3 = true;
    ctx.stageRoot.add(this.sba3.root);
    this.hitTargets = [this.sba3.hitMesh];

    // Playful 3D Toy Friends floating around the courtyard (including bespoke Vehicles, Animals, Food, Nature!)
    const showcaseIds = ['cat', 'apple', 'plane', 'sun', 'car', 'rabbit'];
    this.toys = showcaseIds.map((wordId, idx) => {
      const rig = AssetFactory.createWordToy(wordId, { scale: 0.78, hitRadius: 1.2 });
      const orbitAngle = (idx / showcaseIds.length) * Math.PI * 2;
      const orbitRadius = 3.55;
      const baseY = 0.55 + (idx % 2) * 0.48;
      rig.root.position.set(Math.cos(orbitAngle) * orbitRadius, baseY, Math.sin(orbitAngle) * orbitRadius - 0.5);
      ctx.stageRoot.add(rig.root);
      this.hitTargets.push(rig.hitMesh);
      return { rig, wordId, orbitAngle, orbitRadius, baseY };
    });
  }

  update(time: number, dt: number, ctx: SceneContext) {
    PhysicsAnimator.updateRig(this.sba3, time, dt, ctx.lookTarget);
    for (const item of this.toys) {
      const angle = item.orbitAngle + time * 0.16;
      item.rig.root.position.x = Math.cos(angle) * item.orbitRadius;
      item.rig.root.position.z = Math.sin(angle) * (item.orbitRadius * 0.62) - 0.8;
      item.rig.root.position.y = item.baseY + Math.sin(time * 1.8 + item.orbitAngle) * 0.2;
      PhysicsAnimator.updateRig(item.rig, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const hits = ctx.raycast(e.ndcX, e.ndcY, this.hitTargets);
    if (hits.length === 0) return;

    const hitObj = hits[0].object;

    if (hitObj.userData.isSba3) {
      if (!ToddlerUXGuard.canTriggerObject('home:sba3')) return;
      ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#FBBF24');
      PhysicsAnimator.triggerPressSquash(this.sba3);
      this.pressedRigs.set(e.pointerId, { rig: this.sba3, isSba3: true, objectKey: 'home:sba3' });
      return;
    }

    const found = this.toys.find((t) => t.rig.hitMesh === hitObj);
    if (found) {
      const key = `home:${found.wordId}`;
      if (!ToddlerUXGuard.canTriggerObject(key)) return;
      ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#FBBF24');
      PhysicsAnimator.triggerPressSquash(found.rig);
      this.pressedRigs.set(e.pointerId, { rig: found.rig, isSba3: false, wordId: found.wordId, objectKey: key });
    }
  }

  onPointerUp(e: PointerEvent3D, ctx: SceneContext) {
    const pressed = this.pressedRigs.get(e.pointerId);
    if (!pressed) return;
    this.pressedRigs.delete(e.pointerId);
    const { rig, isSba3, wordId } = pressed;

    PhysicsAnimator.releasePressSquash(rig);
    PhysicsAnimator.triggerTapBounce(rig, true);
    SoundFXEngine.playSpringBoing(isSba3 ? 1.25 : 1.0, e.ndcX);
    SoundFXEngine.playSparkleCascade(this.comboCount++, e.ndcX);

    const burstPos = isSba3
      ? new THREE.Vector3(0, 2.0, 0.4)
      : rig.root.position.clone().add(new THREE.Vector3(0, 0.8, 0));
    ctx.particles.burstStars(burstPos, isSba3 ? 18 : 14);

    if (isSba3) {
      ctx.cameraRig.pulseZoom(0.4);
      this.callbacks.onSba3Tap();
    } else if (wordId) {
      this.callbacks.onPropTap(wordId);
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    return new THREE.Vector3(0, 1.85, 0.65);
  }

  dispose() {
    this.toys = [];
    this.hitTargets = [];
    this.pressedRigs.clear();
  }
}
