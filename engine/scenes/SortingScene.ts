import * as THREE from 'three';
import { CategoryMeta, CategoryType, Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { PhysicsAnimator, SpringVec3, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface BasketSlot3D {
  meta: CategoryMeta;
  root: THREE.Group;
  glowRing: THREE.Mesh;
  hitMesh: THREE.Mesh;
  badgeToy: ToyRig;
}

/**
 * 3D Sort Baskets Scene:
 * A large living 3D word toy hovers above 2–3 woven 3D Moroccan baskets.
 * Kids drag the 3D toy straight over a glowing basket (or tap the basket!) to sort it!
 */
export class SortingScene implements BaseScene3D {
  readonly id = 'sorting';
  private onSort: (catId: CategoryType) => 'match' | 'wrong' | 'ignore';
  private onTapItem: () => void;
  private ctx: SceneContext | null = null;
  private baskets: BasketSlot3D[] = [];
  private activeToyGroup = new THREE.Group();
  private activeToy: ToyRig | null = null;
  private itemHome = new THREE.Vector3(0, 2.05, 0.9);
  private itemPosSpring = new SpringVec3(0, 2.05, 0.9, 220, 17);

  private isDraggingItem = false;
  private dragPointerId: number | null = null;
  private dragStartClient = { x: 0, y: 0 };
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.9);
  private hoveredBasket: CategoryType | null = null;
  private tempVec = new THREE.Vector3();
  private sortCombo = 0;
  private activeCategory: CategoryType | null = null;

  private initialBaskets: CategoryMeta[];
  private initialWord: Word;

  constructor(
    baskets: CategoryMeta[],
    word: Word,
    onSort: (catId: CategoryType) => 'match' | 'wrong' | 'ignore',
    onTapItem: () => void
  ) {
    this.initialBaskets = baskets;
    this.initialWord = word;
    this.onSort = onSort;
    this.onTapItem = onTapItem;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    this.buildBaskets(this.initialBaskets);
    ctx.stageRoot.add(this.activeToyGroup);
    this.setActiveWord(this.initialWord);
  }

  buildBaskets(metas: CategoryMeta[]) {
    if (!this.ctx) return;
    for (const b of this.baskets) {
      this.ctx.stageRoot.remove(b.root);
      disposeObjectGeometries(b.root);
    }
    this.baskets = [];

    const count = metas.length;
    const spacing = count === 2 ? 3.5 : 2.85;
    this.ctx.cameraRig.setPose([0, 3.1, count === 2 ? 9.0 : 10.0], [0, 1.35, 0]);

    metas.forEach((meta, idx) => {
      const x = (idx - (count - 1) / 2) * spacing;
      const b = AssetFactory.createMoroccanBasket(meta.hex);
      b.root.position.set(x, 0, 0.5);
      b.hitMesh.userData.basketCat = meta.id;

      // Iconic 3D category badge hovering softly behind the basket!
      const badgeToy = AssetFactory.createWordToy(meta.icon, { scale: 0.58, hitRadius: 0.01 });
      badgeToy.root.position.set(0, 1.05, -0.5);
      badgeToy.hitMesh.visible = false;
      b.root.add(badgeToy.root);

      this.ctx!.stageRoot.add(b.root);
      this.baskets.push({ meta, root: b.root, glowRing: b.glowRing, hitMesh: b.hitMesh, badgeToy });
    });
  }

  setActiveWord(word: Word) {
    if (!this.ctx) return;
    this.activeCategory = word.category;
    disposeObjectGeometries(this.activeToyGroup);
    while (this.activeToyGroup.children.length > 0) {
      this.activeToyGroup.remove(this.activeToyGroup.children[0]);
    }
    this.activeToy = AssetFactory.createWordToy(word.id, { scale: 1.12, hitRadius: 1.55 });
    this.activeToy.hitMesh.userData.isSortItem = true;
    this.activeToyGroup.add(this.activeToy.root);

    this.itemPosSpring.setImmediate(0, 4.4, 0.9);
    this.itemPosSpring.setTarget(this.itemHome.x, this.itemHome.y, this.itemHome.z);
    PhysicsAnimator.triggerTapBounce(this.activeToy, false);
  }

  update(time: number, dt: number, ctx: SceneContext) {
    if (this.activeToy) {
      this.itemPosSpring.step(dt, this.tempVec);
      this.activeToy.root.position.copy(this.tempVec);
      PhysicsAnimator.updateRig(this.activeToy, time, dt, ctx.lookTarget);
    }
    for (const b of this.baskets) {
      PhysicsAnimator.updateRig(b.badgeToy, time, dt, ctx.lookTarget);
      b.glowRing.visible = this.hoveredBasket === b.meta.id;
      const targetScale = this.hoveredBasket === b.meta.id ? 1.08 : 1.0;
      b.root.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), Math.min(1, dt * 12));
    }
  }

  private findClosestBasket(worldPos: THREE.Vector3): CategoryType | null {
    if (worldPos.y > 2.0) return null;
    let best: BasketSlot3D | null = null;
    let bestDist = 1.65;
    for (const b of this.baskets) {
      const dist = Math.abs(worldPos.x - b.root.position.x);
      if (dist < bestDist) {
        bestDist = dist;
        best = b;
      }
    }
    return best ? best.meta.id : null;
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    // 1. Check if grabbing the center floating 3D toy
    if (this.activeToy) {
      const itemHits = ctx.raycast(e.ndcX, e.ndcY, [this.activeToy.hitMesh]);
      if (itemHits.length > 0) {
        this.isDraggingItem = true;
        this.dragPointerId = e.pointerId;
        this.dragStartClient = { x: e.clientX, y: e.clientY };
        ctx.touchFeedback.spawnRipple(itemHits[0].point, ctx.camera, '#F59E0B');
        PhysicsAnimator.triggerPressSquash(this.activeToy);
        SoundFXEngine.playSpringBoing(0.7, e.ndcX);
        return;
      }
    }

    // 2. Or direct tap on a basket (super easy for 2-year-old Nora!)
    const basketHits = ctx.raycast(
      e.ndcX,
      e.ndcY,
      this.baskets.map((b) => b.hitMesh)
    );
    if (basketHits.length > 0) {
      const catId = basketHits[0].object.userData.basketCat as CategoryType;
      if (!ToddlerUXGuard.canTriggerObject(`basket:${catId}`)) return;
      ctx.touchFeedback.spawnRipple(basketHits[0].point, ctx.camera, '#38BDF8');
      this.submitSort(catId, ctx);
    }
  }

  onPointerMove(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.isDraggingItem || this.dragPointerId !== e.pointerId) return;
    if (
      this.activeToy &&
      Math.hypot(e.clientX - this.dragStartClient.x, e.clientY - this.dragStartClient.y) >
        TODDLER_UX_CONFIG.TAP_SLOP_PX
    ) {
      PhysicsAnimator.releasePressSquash(this.activeToy);
    }
    const hit = ctx.screenToPlane(e.ndcX, e.ndcY, this.dragPlane);
    if (hit) {
      const clampedX = THREE.MathUtils.clamp(hit.x, -4.4, 4.4);
      const clampedY = THREE.MathUtils.clamp(hit.y, 0.55, 4.1);
      this.itemPosSpring.setTarget(clampedX, clampedY, 0.9);
      this.hoveredBasket = this.findClosestBasket(new THREE.Vector3(clampedX, clampedY, 0.9));
    }
  }

  onPointerUp(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.isDraggingItem || this.dragPointerId !== e.pointerId) return;
    this.isDraggingItem = false;
    this.dragPointerId = null;
    if (this.activeToy) {
      PhysicsAnimator.releasePressSquash(this.activeToy);
    }

    const isTap = ToddlerUXGuard.isTapGesture(
      this.dragStartClient.x,
      this.dragStartClient.y,
      e.clientX,
      e.clientY
    );
    const droppedCat = this.hoveredBasket;
    this.hoveredBasket = null;

    if (droppedCat) {
      this.submitSort(droppedCat, ctx);
    } else {
      this.itemPosSpring.setTarget(this.itemHome.x, this.itemHome.y, this.itemHome.z);
      if (isTap && ToddlerUXGuard.canTriggerObject('sort:item')) {
        if (this.activeToy) PhysicsAnimator.triggerTapBounce(this.activeToy, true);
        SoundFXEngine.playSpringBoing(1.1, e.ndcX);
        this.onTapItem();
      }
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    const targetBasket = this.baskets.find((b) => b.meta.id === this.activeCategory) ?? this.baskets[0];
    if (!targetBasket) return null;
    return targetBasket.root.position.clone().add(new THREE.Vector3(0, 1.15, 0.55));
  }

  private submitSort(catId: CategoryType, ctx: SceneContext) {
    const basket = this.baskets.find((b) => b.meta.id === catId);
    const panX = basket ? THREE.MathUtils.clamp(basket.root.position.x / 3.5, -1, 1) : 0;
    const res = this.onSort(catId);
    if (res === 'match' && basket) {
      this.itemPosSpring.setTarget(basket.root.position.x, 0.75, 0.5);
      SoundFXEngine.playSparkleCascade(this.sortCombo++, panX);
      const burstPos = basket.root.position.clone().add(new THREE.Vector3(0, 1.2, 0.2));
      ctx.particles.burstStars(burstPos, 20);
      ctx.particles.burstConfetti(burstPos, 24);
      ctx.cameraRig.pulseZoom(0.4);
    } else if (res === 'wrong') {
      SoundFXEngine.playSoftWoodblock(panX);
      this.itemPosSpring.setTarget(this.itemHome.x, this.itemHome.y, this.itemHome.z);
      if (this.activeToy) PhysicsAnimator.triggerGentleWiggle(this.activeToy);
    }
  }

  dispose() {
    this.baskets = [];
    this.activeToy = null;
    this.ctx = null;
  }
}
