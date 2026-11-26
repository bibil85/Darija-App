import * as THREE from 'three';
import { Word } from '../../types.ts';
import { AssetFactory } from '../AssetFactory.ts';
import { MaterialLibrary } from '../MaterialLibrary.ts';
import { PhysicsAnimator, SpringScalar, ToyRig } from '../PhysicsAnimator.ts';
import { disposeObjectGeometries } from '../assets/helpers.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './types.ts';
import { SoundFXEngine } from '../../src/audio/SoundFXEngine.ts';
import { TODDLER_UX_CONFIG, ToddlerUXGuard } from '../../src/ux/ToddlerUXGuard.ts';

export interface MemoryTileData {
  uid: string;
  word: Word;
}

interface Tile3D {
  uid: string;
  word: Word;
  root: THREE.Group;
  flipGroup: THREE.Group;
  hitMesh: THREE.Mesh;
  toy: ToyRig;
  matchGlow: THREE.Mesh;
  flipSpring: SpringScalar;
  toyScaleSpring: SpringScalar;
  isFaceUp: boolean;
  isMatched: boolean;
}

/**
 * 3D Memory Flip Scene:
 * Beveled 3D Moroccan Zellige ceramic tiles physically flip 180° on spring physics,
 * popping an articulated 3D mini-toy straight up out of the tile face!
 */
export class MemoryFlipScene implements BaseScene3D {
  readonly id = 'memory';
  private onTileTap: (uid: string) => void;
  private ctx: SceneContext | null = null;
  private tiles: Tile3D[] = [];
  private initialDeck: MemoryTileData[];

  constructor(deck: MemoryTileData[], onTileTap: (uid: string) => void) {
    this.initialDeck = deck;
    this.onTileTap = onTileTap;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    this.setDeck(this.initialDeck);
  }

  setDeck(deck: MemoryTileData[]) {
    if (!this.ctx) return;
    disposeObjectGeometries(this.ctx.stageRoot);
    while (this.ctx.stageRoot.children.length > 0) {
      this.ctx.stageRoot.remove(this.ctx.stageRoot.children[0]);
    }
    this.tiles = [];

    const count = deck.length;
    const cols = count <= 6 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const spacingX = cols === 3 ? 2.1 : 1.72;
    const spacingY = rows <= 2 ? 2.0 : rows === 3 ? 1.56 : 1.38;
    const tileScale = cols === 3 ? 0.96 : rows === 4 ? 0.72 : 0.8;

    const camZ = count <= 6 ? 8.2 : count <= 12 ? 10.8 : 12.6;
    const centerY = rows <= 2 ? 2.15 : rows === 3 ? 2.55 : 2.85;
    this.ctx.cameraRig.setPose([0, centerY + 0.25, camZ], [0, centerY, 0]);

    const zelligeMat = MaterialLibrary.zelligeTile();
    const edgeMat = MaterialLibrary.gold('#F59E0B');

    deck.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = (col - (cols - 1) / 2) * spacingX;
      const y = centerY + ((rows - 1) / 2 - row) * spacingY;

      const root = new THREE.Group();
      root.position.set(x, y, 0);
      root.scale.setScalar(tileScale);

      const flipGroup = new THREE.Group();
      root.add(flipGroup);

      // Chunky 3D Ceramic Tile Block (Zellige back on +Z, pastel front on -Z)
      const faceMat = MaterialLibrary.toy(item.word.bgHex, { clearcoat: 0.55 });
      const tileGeo = new THREE.BoxGeometry(1.56, 1.56, 0.22);
      const tileMesh = new THREE.Mesh(tileGeo, [
        edgeMat, edgeMat, edgeMat, edgeMat,
        zelligeMat, // +Z back (visible initially!)
        faceMat,    // -Z front (visible after 180° flip!)
      ]);
      tileMesh.castShadow = true;
      tileMesh.receiveShadow = true;
      flipGroup.add(tileMesh);

      // 3D Toy mounted on the front (-Z) face so it pops out when flipped 180°!
      const toy = AssetFactory.createWordToy(item.word.id, { scale: 0.62, hitRadius: 0.01 });
      toy.root.position.set(0, -0.36, -0.18);
      toy.root.rotation.y = Math.PI;
      toy.root.scale.setScalar(0.001);
      toy.hitMesh.visible = false;
      flipGroup.add(toy.root);

      // Glowing emerald match border
      const matchGlow = new THREE.Mesh(
        new THREE.BoxGeometry(1.72, 1.72, 0.14),
        MaterialLibrary.glow('#34D399', 0.75)
      );
      matchGlow.visible = false;
      flipGroup.add(matchGlow);

      // Generous +30% expanded invisible hitbox beyond 1.56 tile visual bounds
      const hs = TODDLER_UX_CONFIG.HITBOX_FORGIVENESS_SCALE;
      const hitMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.56 * hs, 1.56 * hs, 0.78),
        MaterialLibrary.invisibleHitbox()
      );
      hitMesh.userData.tileUid = item.uid;
      root.add(hitMesh);

      this.ctx!.stageRoot.add(root);
      this.tiles.push({
        uid: item.uid,
        word: item.word,
        root,
        flipGroup,
        hitMesh,
        toy,
        matchGlow,
        flipSpring: new SpringScalar(0, 175, 16),
        toyScaleSpring: new SpringScalar(0.001, 210, 15),
        isFaceUp: false,
        isMatched: false,
      });
    });
  }

  syncState(flippedUids: string[], matchedWordIds: string[]) {
    let newlyMatched = false;
    let matchPanX = 0;
    let matchTileCount = 0;

    for (const t of this.tiles) {
      const wasMatched = t.isMatched;
      t.isMatched = matchedWordIds.includes(t.word.id);
      t.isFaceUp = t.isMatched || flippedUids.includes(t.uid);

      t.flipSpring.target = t.isFaceUp ? Math.PI : 0;
      t.toyScaleSpring.target = t.isFaceUp ? 1 : 0.001;
      t.matchGlow.visible = t.isMatched;

      if (t.isMatched && !wasMatched && this.ctx) {
        newlyMatched = true;
        matchPanX += THREE.MathUtils.clamp(t.root.position.x / 3.5, -1, 1);
        matchTileCount += 1;
        PhysicsAnimator.triggerTapBounce(t.toy, true);
        this.ctx.particles.burstStars(t.root.position.clone().add(new THREE.Vector3(0, 0, 0.5)), 14);
      }
    }

    if (newlyMatched) {
      const avgPan = matchTileCount > 0 ? matchPanX / matchTileCount : 0;
      SoundFXEngine.playSparkleCascade(Math.max(0, matchedWordIds.length - 1), avgPan);
    }
  }

  update(time: number, dt: number, ctx: SceneContext) {
    for (const t of this.tiles) {
      t.flipGroup.rotation.y = t.flipSpring.step(dt);
      const ts = Math.max(0.001, t.toyScaleSpring.step(dt));
      t.toy.root.scale.setScalar(ts);
      if (t.isFaceUp) {
        PhysicsAnimator.updateRig(t.toy, time, dt, ctx.lookTarget);
      }
    }
  }

  onPointerDown(e: PointerEvent3D, ctx: SceneContext) {
    const hits = ctx.raycast(
      e.ndcX,
      e.ndcY,
      this.tiles.map((t) => t.hitMesh)
    );
    if (hits.length === 0) return;
    const uid = hits[0].object.userData.tileUid as string;
    if (!ToddlerUXGuard.canTriggerObject(`tile:${uid}`)) return;
    ctx.touchFeedback.spawnRipple(hits[0].point, ctx.camera, '#60A5FA');
    this.onTileTap(uid);
  }

  getHintTarget(): THREE.Vector3 | null {
    const faceDown = this.tiles.find((t) => !t.isFaceUp && !t.isMatched);
    if (!faceDown) return null;
    return faceDown.root.position.clone().add(new THREE.Vector3(0, 0, 0.45));
  }

  dispose() {
    this.tiles = [];
    this.ctx = null;
  }
}
