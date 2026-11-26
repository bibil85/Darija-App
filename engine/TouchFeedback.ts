import * as THREE from 'three';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

interface RippleSlot {
  active: boolean;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  age: number;
  life: number;
}

interface TrailSlot {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  life: number;
  baseScale: number;
}

/**
 * Multi-Sensory 3D Touch Feedback System for iPad Safari:
 * - Spawns expanding translucent 3D shockwave ripple rings at exact raycast touch points
 * - Renders a GPU-instanced glowing finger-drag sparkle trail + speed-proportional wind-chime grains
 */
export class TouchFeedbackSystem {
  readonly group = new THREE.Group();

  private ripples: RippleSlot[] = [];
  private rippleGeo = new THREE.RingGeometry(0.42, 0.56, 32);

  private trailMesh: THREE.InstancedMesh;
  private trailSlots: TrailSlot[] = [];
  private trailCapacity = 72;
  private trailCursor = 0;
  private dummy = new THREE.Object3D();

  constructor() {
    // 1. Pool of 12 reusable 3D shockwave rings (zero per-tap allocation)
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#FEF08A'),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(this.rippleGeo, mat);
      mesh.visible = false;
      this.group.add(mesh);
      this.ripples.push({ active: false, mesh, mat, age: 0, life: 0.38 });
    }

    // 2. GPU-Instanced Glowing Finger-Drag Sparkle Trail
    const trailGeo = new THREE.OctahedronGeometry(0.11, 1);
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfde047,
      emissiveIntensity: 1.15,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.trailMesh = new THREE.InstancedMesh(trailGeo, trailMat, this.trailCapacity);
    this.trailMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trailMesh.frustumCulled = false;

    const trailColors = [
      new THREE.Color('#FDE047'),
      new THREE.Color('#38BDF8'),
      new THREE.Color('#F472B6'),
      new THREE.Color('#34D399'),
      new THREE.Color('#FFFFFF'),
    ];
    for (let i = 0; i < this.trailCapacity; i++) {
      this.trailMesh.setColorAt(i, trailColors[i % trailColors.length]);
      this.trailSlots.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        age: 0,
        life: 0.45,
        baseScale: 1,
      });
      this.hideTrailSlot(i);
    }
    if (this.trailMesh.instanceColor) {
      this.trailMesh.instanceColor.needsUpdate = true;
    }
    this.group.add(this.trailMesh);
  }

  private hideTrailSlot(index: number) {
    this.dummy.position.set(0, -100, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    this.trailMesh.setMatrixAt(index, this.dummy.matrix);
  }

  /** Spawn an expanding 3D shockwave ring at the exact raycast touch point */
  spawnRipple(worldPos: THREE.Vector3, camera: THREE.Camera, colorHex = '#FEF08A') {
    const slot = this.ripples.find((r) => !r.active) || this.ripples[0];
    slot.active = true;
    slot.age = 0;
    slot.life = 0.36;
    slot.mat.color.set(colorHex);
    slot.mat.opacity = 0.85;
    slot.mesh.position.copy(worldPos);
    slot.mesh.lookAt(camera.position);
    slot.mesh.scale.setScalar(0.28);
    slot.mesh.visible = true;
  }

  /** Emit a glowing trail sparkle following toddler finger drag + soft wind-chime grain */
  emitTrail(worldPos: THREE.Vector3, speed: number, ndcX: number) {
    const slot = this.trailSlots[this.trailCursor];
    this.trailCursor = (this.trailCursor + 1) % this.trailCapacity;

    slot.active = true;
    slot.age = 0;
    slot.life = 0.42 + Math.random() * 0.2;
    slot.pos.copy(worldPos);
    slot.vel.set(
      (Math.random() - 0.5) * 0.5,
      0.45 + Math.random() * 0.55,
      (Math.random() - 0.5) * 0.4
    );
    slot.baseScale = Math.min(1.35, 0.65 + speed * 0.35);

    if (speed > 0.15) {
      SoundFXEngine.playWindChimeGrain(speed, ndcX);
    }
  }

  update(dt: number, camera: THREE.Camera) {
    // Update shockwave ripples
    for (const r of this.ripples) {
      if (!r.active) continue;
      r.age += dt;
      if (r.age >= r.life) {
        r.active = false;
        r.mesh.visible = false;
        continue;
      }
      const t = r.age / r.life;
      const easeOut = 1 - Math.pow(1 - t, 3);
      r.mesh.scale.setScalar(0.28 + easeOut * 1.9);
      r.mat.opacity = (1 - t) * 0.82;
      r.mesh.lookAt(camera.position);
    }

    // Update glowing finger-drag trail particles
    let dirty = false;
    for (let i = 0; i < this.trailSlots.length; i++) {
      const s = this.trailSlots[i];
      if (!s.active) continue;
      dirty = true;
      s.age += dt;
      if (s.age >= s.life) {
        s.active = false;
        this.hideTrailSlot(i);
        continue;
      }
      s.pos.addScaledVector(s.vel, dt);
      const t = s.age / s.life;
      const sc = Math.max(0.001, s.baseScale * (1 - t * t));
      this.dummy.position.copy(s.pos);
      this.dummy.rotation.set(s.age * 5, s.age * 4, 0);
      this.dummy.scale.setScalar(sc);
      this.dummy.updateMatrix();
      this.trailMesh.setMatrixAt(i, this.dummy.matrix);
    }
    if (dirty) {
      this.trailMesh.instanceMatrix.needsUpdate = true;
    }
  }

  dispose() {
    this.rippleGeo.dispose();
    for (const r of this.ripples) r.mat.dispose();
    this.trailMesh.geometry.dispose();
    (this.trailMesh.material as THREE.Material).dispose();
  }
}
