import * as THREE from 'three';
import { Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { MaterialLibrary } from '../MaterialLibrary.ts';
import { PhysicsAnimator, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface FloatingBubble3D {
  uid: number;
  word: Word;
  group: THREE.Group;
  shellMesh: THREE.Mesh;
  wobbleUniforms: { uTime: { value: number }; uPhase: { value: number } };
  toy: ToyRig;
  hitMesh: THREE.Mesh;
  bubbleScale: number;
  speed: number;
  swayPhase: number;
  baseX: number;
}

interface BubblePopSceneCallbacks {
  onBubblePopped: (word: Word) => boolean; // returns true if accepted (pop!), false if wrong target (bounce!)
}

const BUBBLE_TINTS = ['#BAE6FD', '#FEF08A', '#FBCFE8', '#A7F3D0', '#DDD6FE'];

/**
 * Real-Time 3D Pop Bubbles Scene!
 * - Iridescent Fresnel GLSL soap bubbles with live sinusoidal wobble deformation!
 * - Articulated 3D vocabulary toy floating inside every bubble!
 * - Multi-touch raycasting (pop multiple bubbles simultaneously with toddler fingers!)
 */
export class BubblePopScene implements BaseScene3D {
  readonly id = 'bubbles';
  private callbacks: BubblePopSceneCallbacks;
  private ctx: SceneContext | null = null;
  private bubbles: FloatingBubble3D[] = [];
  private nextUid = 1;
  private bubbleGeo = new THREE.SphereGeometry(1.18, 36, 28);
  // Generous +30% forgiveness collider beyond visual 1.18 soap bubble shell
  private hitGeo = new THREE.SphereGeometry(1.18 * TODDLER_UX_CONFIG.HITBOX_FORGIVENESS_SCALE, 10, 8);
  private wordPool: Word[];
  private count: number;
  private speedScale: number;
  private targetWordId: string | null = null;

  constructor(
    initialWords: Word[],
    wordPool: Word[],
    speedScale: number,
    callbacks: BubblePopSceneCallbacks
  ) {
    this.wordPool = wordPool;
    this.count = initialWords.length;
    this.speedScale = speedScale;
    this.callbacks = callbacks;
    this.initialWords = initialWords;
  }

  private initialWords: Word[];

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    ctx.cameraRig.setPose([0, 2.7, 9.5], [0, 2.4, 0]);
    this.spawnInitial(this.initialWords);
  }

  spawnInitial(words: Word[]) {
    if (!this.ctx) return;
    this.clearBubbles();
    words.forEach((w, idx) => {
      const col = (idx % 3) - 1;
      const x = col * 2.8 + (Math.random() - 0.5) * 0.9;
      const y = 0.8 + (idx / Math.max(1, words.length)) * 3.8;
      this.spawnBubble(w, x, y);
    });
  }

  private spawnBubble(word: Word, x?: number, y?: number) {
    if (!this.ctx) return;
    const uid = this.nextUid++;
    const group = new THREE.Group();
    const baseX = x ?? (Math.random() - 0.5) * 7.6;
    const startY = y ?? -0.4 - Math.random() * 1.4;
    const startZ = (Math.random() - 0.5) * 2.2;
    // Varied organic 3D bubble sizes (0.8..1.24) so bigger bubbles pop deeper & smaller bubbles pop higher!
    const bubbleScale = 0.8 + Math.random() * 0.44;
    group.position.set(baseX, startY, startZ);
    group.scale.setScalar(bubbleScale);

    // 3D Toy suspended inside the soap bubble
    const toy = AssetFactory.createWordToy(word.id, { scale: 0.72, hitRadius: 0.01 });
    toy.root.position.set(0, -0.52, 0);
    toy.hitMesh.visible = false;
    group.add(toy.root);

    // Physically-based Translucent Iridescent Soap Bubble Shell (transmission 0.9, iridescence 1.0, thickness 0.5 + GLSL wobble!)
    const { material: bubbleMat, uniforms: wobbleUniforms } = MaterialLibrary.createSoapBubbleMaterial(
      BUBBLE_TINTS[uid % BUBBLE_TINTS.length]
    );
    const shellMesh = new THREE.Mesh(this.bubbleGeo, bubbleMat);
    group.add(shellMesh);

    // Generous invisible multi-touch hitbox
    const hitMesh = new THREE.Mesh(this.hitGeo, MaterialLibrary.invisibleHitbox());
    hitMesh.userData.bubbleUid = uid;
    group.add(hitMesh);

    this.ctx.stageRoot.add(group);
    this.bubbles.push({
      uid,
      word,
      group,
      shellMesh,
      wobbleUniforms,
      toy,
      hitMesh,
      bubbleScale,
      speed: (0.72 + Math.random() * 0.42) * this.speedScale,
      swayPhase: Math.random() * Math.PI * 2,
      baseX,
    });
  }

  setTargetWordId(wordId: string | null) {
    this.targetWordId = wordId;
  }

  getActiveWords(): Word[] {
    return this.bubbles.map((b) => b.word);
  }

  getHintTarget(): THREE.Vector3 | null {
    if (this.bubbles.length === 0) return null;
    const match =
      (this.targetWordId
        ? this.bubbles.find((b) => b.word.id === this.targetWordId)
        : undefined) ??
      this.bubbles.find((b) => b.group.position.y > 0.8 && b.group.position.y < 4.5) ??
      this.bubbles[0];
    return match ? match.group.position.clone() : null;
  }

  update(time: number, dt: number, ctx: SceneContext) {
    for (const b of this.bubbles) {
      b.wobbleUniforms.uTime.value = time;
      b.group.position.y += b.speed * dt;
      b.group.position.x = b.baseX + Math.sin(time * 1.4 + b.swayPhase) * 0.55;
      if (b.group.position.y > 5.8) {
        b.group.position.y = -0.7;
        b.baseX = (Math.random() - 0.5) * 7.6;
      }
      PhysicsAnimator.updateRig(b.toy, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const hitTargets = this.bubbles.map((b) => b.hitMesh);
    const hits = ctx.raycast(e.ndcX, e.ndcY, hitTargets);
    if (hits.length === 0) return;

    const uid = hits[0].object.userData.bubbleUid as number;
    if (!ToddlerUXGuard.canTriggerObject(`bubble:${uid}`)) return;

    const idx = this.bubbles.findIndex((b) => b.uid === uid);
    if (idx === -1) return;
    const bubble = this.bubbles[idx];

    const accepted = this.callbacks.onBubblePopped(bubble.word);
    if (accepted) {
      // Exact-millisecond physics-scaled bubble pop (bigger bubble = deeper pop, panned to X!)
      SoundFXEngine.playBubblePop(bubble.bubbleScale, e.ndcX);
      const worldPos = bubble.group.position.clone();
      ctx.touchFeedback.spawnRipple(worldPos, ctx.camera, '#7DD3FC');
      ctx.particles.burstStars(worldPos, 16);
      ctx.particles.burstConfetti(worldPos, 14);
      ctx.cameraRig.pulseZoom(0.25);

      ctx.stageRoot.remove(bubble.group);
      disposeObjectGeometries(bubble.group);
      this.bubbles.splice(idx, 1);

      // Spawn a replacement bubble at bottom
      const activeIds = new Set(this.bubbles.map((b) => b.word.id));
      const candidates = this.wordPool.filter((w) => !activeIds.has(w.id));
      const nextWord = candidates[Math.floor(Math.random() * candidates.length)] || this.wordPool[0];
      if (this.bubbles.length < this.count && nextWord) {
        this.spawnBubble(nextWord);
      }
    } else {
      // Gentle warm woodblock double-tap + spring wiggle for wrong target
      SoundFXEngine.playSoftWoodblock(e.ndcX);
      PhysicsAnimator.triggerGentleWiggle(bubble.toy);
    }
  }

  private clearBubbles() {
    if (!this.ctx) return;
    for (const b of this.bubbles) {
      this.ctx.stageRoot.remove(b.group);
      disposeObjectGeometries(b.group);
    }
    this.bubbles = [];
  }

  dispose() {
    this.clearBubbles();
    this.bubbleGeo.dispose();
    this.hitGeo.dispose();
    this.ctx = null;
  }
}
