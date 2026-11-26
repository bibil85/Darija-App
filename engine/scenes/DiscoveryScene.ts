import * as THREE from 'three';
import { Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { MaterialLibrary } from '../MaterialLibrary.ts';
import { PhysicsAnimator, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

interface DiscoveryChoice3D {
  word: Word;
  group: THREE.Group;
  rig: ToyRig;
  ringMesh: THREE.Mesh;
}

/**
 * 3D Listen & Find Scene:
 * Displays 2, 4, or 6 articulated 3D vocabulary toys on glowing Moroccan ceramic pedestals!
 * Tap the matching 3D toy -> anticipation squash, 360° celebratory spin, golden stars & confetti!
 */
export class DiscoveryScene implements BaseScene3D {
  readonly id = 'discovery';
  private onPick: (word: Word) => 'correct' | 'wrong' | 'ignore';
  private ctx: SceneContext | null = null;
  private choices: DiscoveryChoice3D[] = [];
  private initialChoices: Word[];
  private targetWordId: string | null = null;

  constructor(choices: Word[], onPick: (word: Word) => 'correct' | 'wrong' | 'ignore') {
    this.initialChoices = choices;
    this.onPick = onPick;
  }

  setTargetWordId(wordId: string | null) {
    this.targetWordId = wordId;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    this.setChoices(this.initialChoices);
  }

  setChoices(words: Word[]) {
    if (!this.ctx) return;
    disposeObjectGeometries(this.ctx.stageRoot);
    while (this.ctx.stageRoot.children.length > 0) {
      this.ctx.stageRoot.remove(this.ctx.stageRoot.children[0]);
    }
    this.choices = [];

    const count = words.length;
    const cols = count === 2 ? 2 : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);
    const spacingX = count === 2 ? 3.5 : cols === 2 ? 3.1 : 2.75;
    const spacingZ = rows === 1 ? 0 : 2.65;

    const camZ = count === 2 ? 7.6 : count <= 4 ? 9.0 : 10.2;
    const camY = rows === 1 ? 2.5 : 4.2;
    this.ctx.cameraRig.setPose([0, camY, camZ], [0, 0.85, 0]);

    words.forEach((word, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = (col - (cols - 1) / 2) * spacingX;
      const z = (row - (rows - 1) / 2) * spacingZ;

      const group = new THREE.Group();
      group.position.set(x, 0.2, z);

      const pedestal = AssetFactory.createPedestal(word.accentHex, 1.15);
      group.add(pedestal);

      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.26, 0.06, 10, 32),
        MaterialLibrary.glow('#34D399', 0.9)
      );
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.04;
      ringMesh.visible = false;
      group.add(ringMesh);

      const rig = AssetFactory.createWordToy(word.id, {
        scale: count === 2 ? 1.2 : 0.96,
        hitRadius: 1.45,
      });
      rig.root.position.set(0, 0.05, 0);
      rig.hitMesh.userData.choiceIndex = idx;
      group.add(rig.root);

      PhysicsAnimator.triggerTapBounce(rig, false);
      this.ctx!.stageRoot.add(group);
      this.choices.push({ word, group, rig, ringMesh });
    });
  }

  update(time: number, dt: number, ctx: SceneContext) {
    for (const c of this.choices) {
      PhysicsAnimator.updateRig(c.rig, time, dt, ctx.lookTarget);
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const hits = ctx.raycast(
      e.ndcX,
      e.ndcY,
      this.choices.map((c) => c.rig.hitMesh)
    );
    if (hits.length === 0) return;
    const idx = hits[0].object.userData.choiceIndex as number;
    if (!ToddlerUXGuard.canTriggerObject(`discovery:${idx}`)) return;
    const item = this.choices[idx];
    if (!item) return;

    const result = this.onPick(item.word);
    ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, result === 'correct' ? '#34D399' : '#FDA4AF');
    if (result === 'correct') {
      item.ringMesh.visible = true;
      PhysicsAnimator.triggerTapBounce(item.rig, true);
      SoundFXEngine.playSpringBoing(1.2, e.ndcX);
      const pos = item.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
      ctx.particles.burstStars(pos, 22);
      ctx.particles.burstConfetti(pos, 24);
      ctx.cameraRig.pulseZoom(0.45);
    } else if (result === 'wrong') {
      PhysicsAnimator.triggerGentleWiggle(item.rig);
    }
  }

  getHintTarget(): THREE.Vector3 | null {
    if (this.choices.length === 0) return null;
    const target =
      (this.targetWordId ? this.choices.find((c) => c.word.id === this.targetWordId) : undefined) ??
      this.choices[0];
    return target.group.position.clone().add(new THREE.Vector3(0, 1.15, 0.45));
  }

  dispose() {
    this.choices = [];
    this.ctx = null;
  }
}
