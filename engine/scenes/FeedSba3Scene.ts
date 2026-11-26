import * as THREE from 'three';
import { Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { MaterialLibrary } from '../MaterialLibrary.ts';
import { PhysicsAnimator, SpringVec3, ToyRig } from '../PhysicsAnimator.ts';
import { addMesh, disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface FoodSlot {
  word: Word;
  rig: ToyRig;
  homePos: THREE.Vector3;
  posSpring: SpringVec3;
  consumed: boolean;
}

/**
 * 3D Feed Sba3! Scene:
 * Giant articulated 3D Sba3 sits eagerly behind the snack table.
 * Drag any 3D food toy toward Sba3 (his head tracks the food & mouth opens wider!) or tap it
 * to feed him — triggering an elastic chomp, star burst, and confetti!
 */
export class FeedSba3Scene implements BaseScene3D {
  readonly id = 'feed';
  private onAttemptFeed: (food: Word) => 'eat' | 'reject' | 'ignore';
  private ctx: SceneContext | null = null;
  private sba3!: ToyRig;
  private foodGroup = new THREE.Group();
  private foods: FoodSlot[] = [];
  private initialFoods: Word[];

  private dragged: FoodSlot | null = null;
  private dragPointerId: number | null = null;
  private dragStartClient = { x: 0, y: 0 };
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.4);
  private tempVec = new THREE.Vector3();
  private chompTimer = 0;
  private chompCombo = 0;
  private targetWordId: string | null = null;

  constructor(initialFoods: Word[], onAttemptFeed: (food: Word) => 'eat' | 'reject' | 'ignore') {
    this.initialFoods = initialFoods;
    this.onAttemptFeed = onAttemptFeed;
  }

  setTargetWordId(wordId: string | null) {
    this.targetWordId = wordId;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    ctx.cameraRig.setPose([0, 2.85, 8.2], [0, 1.35, 0]);

    // Giant Hungry 3D Sba3!
    const pedestal = AssetFactory.createPedestal('#E5633B', 1.6);
    pedestal.position.set(0, 0.2, -1.2);
    ctx.stageRoot.add(pedestal);

    this.sba3 = AssetFactory.createWordToy('lion', { scale: 1.65, hitRadius: 0.01 });
    this.sba3.root.position.set(0, 0.22, -1.2);
    this.sba3.hitMesh.visible = false;
    ctx.stageRoot.add(this.sba3.root);

    // Warm Wooden Snack Tray in front of Sba3
    const tableMat = MaterialLibrary.toy('#D97706', { bump: 'wood', clearcoat: 0.35 });
    addMesh(ctx.stageRoot, new THREE.BoxGeometry(6.8, 0.24, 2.2), tableMat, [0, 0.42, 1.4]);
    addMesh(ctx.stageRoot, new THREE.BoxGeometry(7.0, 0.08, 2.35), MaterialLibrary.toy('#FEF3C7'), [0, 0.55, 1.4]);

    ctx.stageRoot.add(this.foodGroup);
    this.setFoods(this.initialFoods);
  }

  setFoods(words: Word[]) {
    if (!this.ctx) return;
    disposeObjectGeometries(this.foodGroup);
    while (this.foodGroup.children.length > 0) {
      this.foodGroup.remove(this.foodGroup.children[0]);
    }
    this.foods = [];
    this.dragged = null;
    this.dragPointerId = null;

    const count = words.length;
    const spacing = count === 2 ? 2.6 : count === 3 ? 2.15 : 1.72;
    words.forEach((word, idx) => {
      const x = (idx - (count - 1) / 2) * spacing;
      const homePos = new THREE.Vector3(x, 0.62, 1.4);

      // Glossy Ceramic Plate under each food
      addMesh(
        this.foodGroup,
        new THREE.CylinderGeometry(0.76, 0.66, 0.08, 20),
        MaterialLibrary.glossy('#FFFFFF', 0.9),
        [x, 0.6, 1.4]
      );

      const rig = AssetFactory.createWordToy(word.id, { scale: 0.88, hitRadius: 1.35 });
      rig.root.position.copy(homePos);
      rig.hitMesh.userData.foodIndex = idx;
      this.foodGroup.add(rig.root);

      const posSpring = new SpringVec3(homePos.x, homePos.y + 1.6, homePos.z, 210, 17);
      posSpring.setTarget(homePos.x, homePos.y, homePos.z);

      this.foods.push({ word, rig, homePos, posSpring, consumed: false });
    });
  }

  update(time: number, dt: number, ctx: SceneContext) {
    // Sba3 tracks dragged food with both head and pupils!
    const sba3Look = this.dragged
      ? {
          x: THREE.MathUtils.clamp(this.dragged.rig.root.position.x / 3.0, -1, 1),
          y: THREE.MathUtils.clamp((this.dragged.rig.root.position.y - 1.6) / 2.2, -1, 1),
        }
      : ctx.lookTarget;
    PhysicsAnimator.updateRig(this.sba3, time, dt, sba3Look);

    if (this.sba3.parts.mouth) {
      this.sba3.parts.mouth.userData.overrideAnimation = true;
      if (this.chompTimer > 0) {
        this.chompTimer = Math.max(0, this.chompTimer - dt);
        this.sba3.parts.mouth.scale.set(1.3, 0.6 + Math.abs(Math.sin(time * 22)) * 1.4, 1);
      } else if (this.dragged && this.dragged.rig.root.position.y > 1.2) {
        this.sba3.parts.mouth.scale.set(1.35, 1.85, 1);
      } else {
        this.sba3.parts.mouth.scale.set(1, 1.15 + Math.sin(time * 3) * 0.15, 1);
      }
    }

    for (const f of this.foods) {
      if (f.consumed) continue;
      f.posSpring.step(dt, this.tempVec);
      f.rig.root.position.copy(this.tempVec);
      PhysicsAnimator.updateRig(f.rig, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    if (this.dragged) return;
    const targets = this.foods.filter((f) => !f.consumed).map((f) => f.rig.hitMesh);
    const hits = ctx.raycast(e.ndcX, e.ndcY, targets);
    if (hits.length === 0) return;

    const idx = hits[0].object.userData.foodIndex as number;
    if (!ToddlerUXGuard.canTriggerObject(`feed:${idx}`)) return;
    const slot = this.foods[idx];
    if (!slot || slot.consumed) return;

    this.dragged = slot;
    this.dragPointerId = e.pointerId;
    this.dragStartClient = { x: e.clientX, y: e.clientY };
    ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#F59E0B');
    PhysicsAnimator.triggerPressSquash(slot.rig);
    SoundFXEngine.playSpringBoing(0.65, e.ndcX);
  }

  onPointerMove(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.dragged || this.dragPointerId !== e.pointerId) return;
    if (
      Math.hypot(e.clientX - this.dragStartClient.x, e.clientY - this.dragStartClient.y) >
      TODDLER_UX_CONFIG.TAP_SLOP_PX
    ) {
      PhysicsAnimator.releasePressSquash(this.dragged.rig);
    }
    const hit = ctx.screenToPlane(e.ndcX, e.ndcY, this.dragPlane);
    if (hit) {
      this.dragged.posSpring.setTarget(
        THREE.MathUtils.clamp(hit.x, -4.0, 4.0),
        THREE.MathUtils.clamp(hit.y, 0.6, 3.8),
        1.4
      );
    }
  }

  onPointerUp(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.dragged || this.dragPointerId !== e.pointerId) return;
    const slot = this.dragged;
    this.dragged = null;
    this.dragPointerId = null;
    PhysicsAnimator.releasePressSquash(slot.rig);

    const isTap = ToddlerUXGuard.isTapGesture(
      this.dragStartClient.x,
      this.dragStartClient.y,
      e.clientX,
      e.clientY
    );
    const nearMouth =
      Math.abs(slot.rig.root.position.x) < 1.85 && slot.rig.root.position.y > 1.35;

    if (nearMouth || isTap) {
      const outcome = this.onAttemptFeed(slot.word);
      if (outcome === 'eat') {
        slot.consumed = true;
        slot.rig.root.visible = false;
        this.chompTimer = 1.05;
        PhysicsAnimator.triggerTapBounce(this.sba3, false);
        SoundFXEngine.playSpringBoing(1.25, 0);
        SoundFXEngine.playSparkleCascade(this.chompCombo++, 0);
        const mouthPos = new THREE.Vector3(0, 1.9, -0.3);
        ctx.particles.burstStars(mouthPos, 22);
        ctx.particles.burstConfetti(mouthPos, 24);
        ctx.cameraRig.pulseZoom(0.45);
        return;
      } else if (outcome === 'reject') {
        SoundFXEngine.playSoftWoodblock(e.ndcX);
        PhysicsAnimator.triggerGentleWiggle(slot.rig);
      }
    }

    slot.posSpring.setTarget(slot.homePos.x, slot.homePos.y, slot.homePos.z);
  }

  getHintTarget(): THREE.Vector3 | null {
    const active = this.foods.filter((f) => !f.consumed);
    if (active.length === 0) return null;
    const target =
      (this.targetWordId ? active.find((f) => f.word.id === this.targetWordId) : undefined) ??
      active[0];
    return target.rig.root.position.clone().add(new THREE.Vector3(0, 0.75, 0.4));
  }

  dispose() {
    this.foods = [];
    this.dragged = null;
    this.ctx = null;
  }
}
