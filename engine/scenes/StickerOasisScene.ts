import * as THREE from 'three';
import { PlacedSticker } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { PhysicsAnimator, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface PlacedFigurine3D {
  uid: string;
  wordId: string;
  rig: ToyRig;
}

interface OasisCallbacks {
  onTapFigurine: (wordId: string) => void;
  onMoveFigurine: (uid: string, xPct: number, yPct: number) => void;
}

/**
 * 3D Interactive Moroccan Sticker Oasis Diorama!
 * Every collected Darija sticker becomes a living 3D toy figurine placed right inside
 * the sunlit Moroccan courtyard! Drag figurines across the 3D ground or tap to make them dance & speak!
 */
export class StickerOasisScene implements BaseScene3D {
  readonly id = 'stickers';
  private callbacks: OasisCallbacks;
  private ctx: SceneContext | null = null;
  private figurines = new Map<string, PlacedFigurine3D>();
  private initialStickers: PlacedSticker[];

  private dragged: PlacedFigurine3D | null = null;
  private dragPointerId: number | null = null;
  private dragStartClient = { x: 0, y: 0 };
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1);

  constructor(stickers: PlacedSticker[], callbacks: OasisCallbacks) {
    this.initialStickers = stickers;
    this.callbacks = callbacks;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    ctx.cameraRig.setPose([0, 4.6, 8.8], [0, 0.8, -0.6]);
    this.syncStickers(this.initialStickers);
  }

  private pctToWorld(xPct: number, yPct: number): [number, number] {
    const wx = ((xPct - 50) / 42) * 4.5;
    const wz = ((yPct - 50) / 36) * 3.0;
    return [wx, wz];
  }

  private worldToPct(wx: number, wz: number): [number, number] {
    const xPct = THREE.MathUtils.clamp(50 + (wx / 4.5) * 42, 8, 92);
    const yPct = THREE.MathUtils.clamp(50 + (wz / 3.0) * 36, 14, 86);
    return [xPct, yPct];
  }

  syncStickers(stickers: PlacedSticker[]) {
    if (!this.ctx) return;
    const keep = new Set(stickers.map((s) => s.uid));

    // Remove deleted figurines
    for (const [uid, fig] of this.figurines.entries()) {
      if (!keep.has(uid)) {
        this.ctx.stageRoot.remove(fig.rig.root);
        disposeObjectGeometries(fig.rig.root);
        this.figurines.delete(uid);
      }
    }

    // Add newly placed 3D figurines
    for (const s of stickers) {
      if (!this.figurines.has(s.uid)) {
        const rig = AssetFactory.createWordToy(s.wordId, { scale: 0.9, hitRadius: 1.35 });
        const [wx, wz] = this.pctToWorld(s.x, s.y);
        rig.root.position.set(wx, 0.08, wz);
        rig.hitMesh.userData.stickerUid = s.uid;
        this.ctx.stageRoot.add(rig.root);
        PhysicsAnimator.triggerTapBounce(rig, true);
        this.ctx.particles.burstStars(new THREE.Vector3(wx, 1.1, wz), 12);
        this.figurines.set(s.uid, { uid: s.uid, wordId: s.wordId, rig });
      }
    }
  }

  update(time: number, dt: number, ctx: SceneContext) {
    for (const fig of this.figurines.values()) {
      PhysicsAnimator.updateRig(fig.rig, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const targets = Array.from(this.figurines.values()).map((f) => f.rig.hitMesh);
    const hits = ctx.raycast(e.ndcX, e.ndcY, targets);
    if (hits.length === 0) return;

    const uid = hits[0].object.userData.stickerUid as string;
    if (!ToddlerUXGuard.canTriggerObject(`oasis:${uid}`)) return;
    const fig = this.figurines.get(uid);
    if (!fig) return;

    this.dragged = fig;
    this.dragPointerId = e.pointerId;
    this.dragStartClient = { x: e.clientX, y: e.clientY };
    ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#F59E0B');
    PhysicsAnimator.triggerPressSquash(fig.rig);
  }

  onPointerMove(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.dragged || this.dragPointerId !== e.pointerId) return;
    if (
      Math.hypot(e.clientX - this.dragStartClient.x, e.clientY - this.dragStartClient.y) >
      TODDLER_UX_CONFIG.TAP_SLOP_PX
    ) {
      PhysicsAnimator.releasePressSquash(this.dragged.rig);
    }
    const hit = ctx.screenToPlane(e.ndcX, e.ndcY, this.groundPlane);
    if (hit) {
      const wx = THREE.MathUtils.clamp(hit.x, -4.6, 4.6);
      const wz = THREE.MathUtils.clamp(hit.z, -3.2, 3.0);
      this.dragged.rig.root.position.set(wx, 0.25, wz);
    }
  }

  onPointerUp(e: PointerEvent3D, ctx: SceneContext) {
    if (!this.dragged || this.dragPointerId !== e.pointerId) return;
    const fig = this.dragged;
    this.dragged = null;
    this.dragPointerId = null;
    PhysicsAnimator.releasePressSquash(fig.rig);

    fig.rig.root.position.y = 0.08;
    const isTap = ToddlerUXGuard.isTapGesture(
      this.dragStartClient.x,
      this.dragStartClient.y,
      e.clientX,
      e.clientY
    );
    if (isTap) {
      PhysicsAnimator.triggerTapBounce(fig.rig, true);
      SoundFXEngine.playSpringBoing(1.15, e.ndcX);
      SoundFXEngine.playSparkleCascade(0, e.ndcX);
      ctx.particles.burstStars(fig.rig.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 14);
      this.callbacks.onTapFigurine(fig.wordId);
    } else {
      SoundFXEngine.playSpringBoing(0.65, e.ndcX);
      const [xp, yp] = this.worldToPct(fig.rig.root.position.x, fig.rig.root.position.z);
      this.callbacks.onMoveFigurine(fig.uid, xp, yp);
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    const first = this.figurines.values().next().value as PlacedFigurine3D | undefined;
    if (!first) return null;
    return first.rig.root.position.clone().add(new THREE.Vector3(0, 1.0, 0.35));
  }

  dispose() {
    this.figurines.clear();
    this.dragged = null;
    this.ctx = null;
  }
}
