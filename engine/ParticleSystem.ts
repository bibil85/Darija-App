import * as THREE from 'three';

interface ParticleSlot {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  age: number;
  life: number;
  gravity: number;
}

/**
 * GPU-Instanced 3D Particle System (InstancedMesh pools for Stars + Confetti + Ambient Motes).
 * Zero per-burst allocations, ultra-fast 60fps on iPad Safari.
 */
export class ParticleSystem {
  readonly group = new THREE.Group();

  private starMesh: THREE.InstancedMesh;
  private confettiMesh: THREE.InstancedMesh;
  private moteMesh: THREE.InstancedMesh;

  private starSlots: ParticleSlot[] = [];
  private confettiSlots: ParticleSlot[] = [];
  private moteCount = 48;
  private moteSeeds: Array<{ x: number; y: number; z: number; speed: number; phase: number; scale: number }> = [];

  private dummy = new THREE.Object3D();
  private starCapacity = 96;
  private confettiCapacity = 140;

  constructor() {
    // 1. Extruded 3D Star Geometry
    const starShape = new THREE.Shape();
    const spikes = 5;
    const outerR = 0.22;
    const innerR = 0.1;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    starGeo.center();

    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.55,
    });

    this.starMesh = new THREE.InstancedMesh(starGeo, starMat, this.starCapacity);
    this.starMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.starMesh.frustumCulled = false;

    // 2. Colorful 3D Confetti Ribbons
    const confettiGeo = new THREE.BoxGeometry(0.18, 0.12, 0.025);
    const confettiMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    });

    this.confettiMesh = new THREE.InstancedMesh(confettiGeo, confettiMat, this.confettiCapacity);
    this.confettiMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.confettiMesh.frustumCulled = false;

    const palette = [
      new THREE.Color('#F59E0B'),
      new THREE.Color('#1D5FD1'),
      new THREE.Color('#14A392'),
      new THREE.Color('#E5633B'),
      new THREE.Color('#EC4899'),
      new THREE.Color('#A855F7'),
    ];
    for (let i = 0; i < this.confettiCapacity; i++) {
      this.confettiMesh.setColorAt(i, palette[i % palette.length]);
    }
    if (this.confettiMesh.instanceColor) {
      this.confettiMesh.instanceColor.needsUpdate = true;
    }

    // 3. Ambient Floating Golden Courtyard Dust / Sparkle Motes
    const moteGeo = new THREE.OctahedronGeometry(0.055, 0);
    const moteMat = new THREE.MeshStandardMaterial({
      color: 0xfff7e6,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    this.moteMesh = new THREE.InstancedMesh(moteGeo, moteMat, this.moteCount);
    this.moteMesh.frustumCulled = false;

    for (let i = 0; i < this.moteCount; i++) {
      this.moteSeeds.push({
        x: (Math.random() - 0.5) * 18,
        y: 0.6 + Math.random() * 6.5,
        z: -5 + Math.random() * 11,
        speed: 0.35 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.9,
      });
    }

    // Pre-allocate slots & park offscreen
    for (let i = 0; i < this.starCapacity; i++) {
      this.starSlots.push(this.emptySlot());
      this.hideInstance(this.starMesh, i);
    }
    for (let i = 0; i < this.confettiCapacity; i++) {
      this.confettiSlots.push(this.emptySlot());
      this.hideInstance(this.confettiMesh, i);
    }

    this.group.add(this.starMesh, this.confettiMesh, this.moteMesh);
  }

  private emptySlot(): ParticleSlot {
    return {
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      rot: new THREE.Euler(),
      rotVel: new THREE.Vector3(),
      scale: 0,
      age: 0,
      life: 1,
      gravity: 6,
    };
  }

  private hideInstance(mesh: THREE.InstancedMesh, index: number) {
    this.dummy.position.set(0, -100, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    mesh.setMatrixAt(index, this.dummy.matrix);
  }

  /** Emit a joyful 3D burst of golden stars at a world position */
  burstStars(origin: THREE.Vector3, count = 14) {
    let spawned = 0;
    for (let i = 0; i < this.starSlots.length && spawned < count; i++) {
      const slot = this.starSlots[i];
      if (!slot.active) {
        slot.active = true;
        slot.pos.copy(origin);
        const angle = (spawned / count) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 2.4 + Math.random() * 3.4;
        slot.vel.set(Math.cos(angle) * speed, 2.8 + Math.random() * 3.2, Math.sin(angle) * speed);
        slot.rot.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        slot.rotVel.set(4 + Math.random() * 4, 4 + Math.random() * 4, 4 + Math.random() * 4);
        slot.scale = 0.75 + Math.random() * 0.65;
        slot.age = 0;
        slot.life = 0.95 + Math.random() * 0.45;
        slot.gravity = 6.2;
        spawned++;
      }
    }
  }

  /** Emit colorful 3D confetti celebration fountain */
  burstConfetti(origin: THREE.Vector3, count = 36) {
    let spawned = 0;
    for (let i = 0; i < this.confettiSlots.length && spawned < count; i++) {
      const slot = this.confettiSlots[i];
      if (!slot.active) {
        slot.active = true;
        slot.pos.copy(origin);
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 4.2;
        slot.vel.set(Math.cos(angle) * speed, 3.8 + Math.random() * 4.2, Math.sin(angle) * speed);
        slot.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        slot.rotVel.set(5 + Math.random() * 6, 5 + Math.random() * 6, 5 + Math.random() * 6);
        slot.scale = 0.8 + Math.random() * 0.7;
        slot.age = 0;
        slot.life = 1.35 + Math.random() * 0.75;
        slot.gravity = 5.4;
        spawned++;
      }
    }
  }

  update(time: number, dt: number) {
    const stepPool = (slots: ParticleSlot[], mesh: THREE.InstancedMesh) => {
      let dirty = false;
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (!s.active) continue;
        dirty = true;
        s.age += dt;
        if (s.age >= s.life) {
          s.active = false;
          this.hideInstance(mesh, i);
          continue;
        }
        s.vel.y -= s.gravity * dt;
        s.pos.addScaledVector(s.vel, dt);
        s.rot.x += s.rotVel.x * dt;
        s.rot.y += s.rotVel.y * dt;
        s.rot.z += s.rotVel.z * dt;

        const lifeT = s.age / s.life;
        const shrink = lifeT < 0.15 ? lifeT / 0.15 : 1 - Math.pow((lifeT - 0.15) / 0.85, 2);
        const sc = Math.max(0.001, s.scale * shrink);

        this.dummy.position.copy(s.pos);
        this.dummy.rotation.copy(s.rot);
        this.dummy.scale.setScalar(sc);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      }
      if (dirty) mesh.instanceMatrix.needsUpdate = true;
    };

    stepPool(this.starSlots, this.starMesh);
    stepPool(this.confettiSlots, this.confettiMesh);

    // Update ambient floating sunlit dust motes
    for (let i = 0; i < this.moteCount; i++) {
      const m = this.moteSeeds[i];
      const y = m.y + Math.sin(time * m.speed + m.phase) * 0.45;
      const x = m.x + Math.cos(time * m.speed * 0.7 + m.phase) * 0.35;
      const pulse = m.scale * (0.65 + 0.35 * Math.sin(time * 2.2 + m.phase));
      this.dummy.position.set(x, y, m.z);
      this.dummy.rotation.set(time * 0.8 + m.phase, time * 0.6, 0);
      this.dummy.scale.setScalar(pulse);
      this.dummy.updateMatrix();
      this.moteMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.moteMesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.starMesh.geometry.dispose();
    (this.starMesh.material as THREE.Material).dispose();
    this.confettiMesh.geometry.dispose();
    (this.confettiMesh.material as THREE.Material).dispose();
    this.moteMesh.geometry.dispose();
    (this.moteMesh.material as THREE.Material).dispose();
  }
}
