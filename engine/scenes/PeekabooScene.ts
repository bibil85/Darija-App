import * as THREE from 'three';
import { Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { PhysicsAnimator, SpringScalar, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface DoorSlot {
  word: Word;
  root: THREE.Group;
  doorHinge: THREE.Group;
  hitMesh: THREE.Mesh;
  peekingEyes: THREE.Group;
  toy: ToyRig;
  hingeSpring: SpringScalar;
  toyForwardSpring: SpringScalar;
  isOpen: boolean;
  phase: number;
}

const DOOR_COLORS = ['#1D5FD1', '#E5633B', '#14A392', '#8B5CF6'];

/**
 * 3D Peek-a-Boo Moroccan Palace Doors!
 * 2 to 4 sculpted 3D arched palace doors wiggle on spring hinges with blinking 3D peeking eyes.
 * Tap or swipe a door to swing it wide open on real spring physics as the 3D toy leaps forward!
 */
export class PeekabooScene implements BaseScene3D {
  readonly id = 'peekaboo';
  private onDoorOpen: (word: Word) => 'win' | 'miss' | 'ignore';
  private ctx: SceneContext | null = null;
  private slots: DoorSlot[] = [];
  private initialWords: Word[];
  private targetWordId: string | null = null;

  constructor(words: Word[], onDoorOpen: (word: Word) => 'win' | 'miss' | 'ignore') {
    this.initialWords = words;
    this.onDoorOpen = onDoorOpen;
  }

  setTargetWordId(wordId: string | null) {
    this.targetWordId = wordId;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    this.setRound(this.initialWords);
  }

  setRound(words: Word[]) {
    if (!this.ctx) return;
    disposeObjectGeometries(this.ctx.stageRoot);
    while (this.ctx.stageRoot.children.length > 0) {
      this.ctx.stageRoot.remove(this.ctx.stageRoot.children[0]);
    }
    this.slots = [];

    const count = words.length;
    const spacing = count === 2 ? 3.2 : count === 3 ? 2.65 : 2.3;
    const camZ = count <= 2 ? 7.8 : count === 3 ? 9.2 : 10.6;
    this.ctx.cameraRig.setPose([0, 2.4, camZ], [0, 1.35, 0]);

    words.forEach((word, idx) => {
      const x = (idx - (count - 1) / 2) * spacing;
      const door = AssetFactory.createMoroccanDoor(DOOR_COLORS[idx % DOOR_COLORS.length]);
      door.root.position.set(x, 0, 0);
      door.hitMesh.userData.doorIndex = idx;

      // Hiding 3D toy tucked cleanly behind the closed palace door (zero front-face clipping!)
      const toy = AssetFactory.createWordToy(word.id, { scale: 0.92, hitRadius: 0.01 });
      toy.root.position.set(0, 0.25, -0.45);
      toy.root.visible = false;
      toy.hitMesh.visible = false;
      door.root.add(toy.root);

      this.ctx!.stageRoot.add(door.root);
      this.slots.push({
        word,
        root: door.root,
        doorHinge: door.doorHinge,
        hitMesh: door.hitMesh,
        peekingEyes: door.peekingEyes,
        toy,
        hingeSpring: new SpringScalar(0, 140, 13),
        toyForwardSpring: new SpringScalar(-0.45, 160, 14),
        isOpen: false,
        phase: idx * 1.4,
      });
    });
  }

  update(time: number, dt: number, ctx: SceneContext) {
    for (const s of this.slots) {
      const angle = s.hingeSpring.step(dt);
      const toyZ = s.toyForwardSpring.step(dt);
      s.doorHinge.rotation.y = angle;
      s.toy.root.position.z = toyZ;

      if (!s.isOpen) {
        // Playful anticipatory door wiggle & blinking peeking eyes!
        const burst = Math.pow(Math.max(0, Math.sin(time * 2.1 + s.phase)), 8);
        s.root.rotation.z = Math.sin(time * 18 + s.phase) * burst * 0.06;
        const blinkCycle = ((time + s.phase) * 0.8) % 3.0;
        s.peekingEyes.scale.y = blinkCycle > 2.86 ? 0.1 : 1;
      } else {
        s.root.rotation.z *= 0.85;
        PhysicsAnimator.updateRig(s.toy, time, dt, ctx.lookTarget);
      }
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const hits = ctx.raycast(
      e.ndcX,
      e.ndcY,
      this.slots.map((s) => s.hitMesh)
    );
    if (hits.length === 0) return;
    const idx = hits[0].object.userData.doorIndex as number;
    if (!ToddlerUXGuard.canTriggerObject(`door:${idx}`)) return;
    const slot = this.slots[idx];
    if (!slot || slot.isOpen) return;

    const result = this.onDoorOpen(slot.word);
    if (result === 'ignore') return;

    slot.isOpen = true;
    slot.toy.root.visible = true;
    slot.hingeSpring.target = -Math.PI * 0.72; // Swing wide open!
    slot.toyForwardSpring.target = 0.85; // Leap out of the doorway!
    SoundFXEngine.playWhoosh(1);
    ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#FDE047');

    if (result === 'win') {
      PhysicsAnimator.triggerTapBounce(slot.toy, true);
      SoundFXEngine.playSpringBoing(1.2, e.ndcX);
      const pos = slot.root.position.clone().add(new THREE.Vector3(0, 1.5, 0.8));
      ctx.particles.burstStars(pos, 22);
      ctx.particles.burstConfetti(pos, 26);
      ctx.cameraRig.pulseZoom(0.5);
    } else {
      PhysicsAnimator.triggerGentleWiggle(slot.toy);
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    const closed = this.slots.filter((s) => !s.isOpen);
    if (closed.length === 0) return null;
    const target =
      (this.targetWordId ? closed.find((s) => s.word.id === this.targetWordId) : undefined) ??
      closed[0];
    return target.root.position.clone().add(new THREE.Vector3(0, 1.45, 0.55));
  }

  dispose() {
    this.slots = [];
    this.ctx = null;
  }
}
