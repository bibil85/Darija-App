import * as THREE from 'three';
import { ArticulatedParts, LookTarget } from '../src/3d/models/types.ts';

/**
 * Damped Hooke's-law spring for juicy Nintendo/Pixar squash-and-stretch,
 * hops, spins, door swings, and smooth elastic UI/toy feedback.
 */
export class SpringScalar {
  value: number;
  target: number;
  velocity = 0;
  stiffness: number;
  damping: number;

  constructor(initial = 0, stiffness = 240, damping = 16) {
    this.value = initial;
    this.target = initial;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  impulse(v: number) {
    this.velocity += v;
  }

  step(dt: number): number {
    const clampedDt = Math.min(dt, 0.04);
    const force = -this.stiffness * (this.value - this.target);
    const damper = -this.damping * this.velocity;
    this.velocity += (force + damper) * clampedDt;
    this.value += this.velocity * clampedDt;
    return this.value;
  }
}

export class SpringVec3 {
  x: SpringScalar;
  y: SpringScalar;
  z: SpringScalar;

  constructor(x = 0, y = 0, z = 0, stiffness = 220, damping = 16) {
    this.x = new SpringScalar(x, stiffness, damping);
    this.y = new SpringScalar(y, stiffness, damping);
    this.z = new SpringScalar(z, stiffness, damping);
  }

  setTarget(x: number, y: number, z: number) {
    this.x.target = x;
    this.y.target = y;
    this.z.target = z;
  }

  setImmediate(x: number, y: number, z: number) {
    this.x.value = this.x.target = x;
    this.y.value = this.y.target = y;
    this.z.value = this.z.target = z;
    this.x.velocity = this.y.velocity = this.z.velocity = 0;
  }

  step(dt: number, out: THREE.Vector3): THREE.Vector3 {
    out.set(this.x.step(dt), this.y.step(dt), this.z.step(dt));
    return out;
  }
}

/**
 * Articulated 3D Toy Rig — wraps any procedural toy mesh with independent animated pivots
 * plus damped spring channels for squash-and-stretch, hop, spin, and wiggle!
 */
export interface ToyRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  hitMesh: THREE.Mesh;
  parts: ArticulatedParts;
  /** Spring physics state */
  squashSpring: SpringScalar;
  hopSpring: SpringScalar;
  spinSpring: SpringScalar;
  wiggleSpring: SpringScalar;
  phase: number;
  baseScale: number;
}

export class PhysicsAnimator {
  /** Immediate tactile micro-squash on pointerdown (scale.y = 0.82) before spring release on pointerup */
  static triggerPressSquash(rig: ToyRig) {
    rig.squashSpring.target = -0.18;
    rig.squashSpring.velocity = -2.4;
  }

  /** Release press micro-squash cleanly back to elastic neutral */
  static releasePressSquash(rig: ToyRig) {
    rig.squashSpring.target = 0;
  }

  /** Trigger an immediate anticipation squash, elastic bounce, and joyful 360° celebratory spin or hop */
  static triggerTapBounce(rig: ToyRig, spin = true) {
    rig.squashSpring.target = 0;
    // Immediate anticipation squash (compresses Y, widens X/Z)
    rig.squashSpring.value = -0.34;
    rig.squashSpring.velocity = 4.2;
    // Elastic vertical hop
    rig.hopSpring.velocity = 5.4;
    if (spin) {
      rig.spinSpring.target += Math.PI * 2;
    }
  }

  /** Trigger a playful gentle wiggle (e.g., wrong guess) */
  static triggerGentleWiggle(rig: ToyRig) {
    rig.wiggleSpring.velocity = 14;
    rig.squashSpring.velocity = -2.2;
  }

  /** Step continuous sinusoidal idle motion, touch-tracking pupils, + spring physics on a rigged 3D toy */
  static updateRig(rig: ToyRig, time: number, dt: number, lookTarget?: LookTarget) {
    const t = time + rig.phase;

    // 1. Step springs
    const squash = rig.squashSpring.step(dt);
    const hop = Math.max(0, rig.hopSpring.step(dt));
    const spin = rig.spinSpring.step(dt);
    const wiggle = rig.wiggleSpring.step(dt);

    // 2. Layered sinusoidal breathing + spring squash-and-stretch
    const breathe = Math.sin(t * 2.4) * 0.028;
    const sy = Math.max(0.55, 1 + breathe + squash);
    const sxz = Math.max(0.65, 1 - (breathe + squash) * 0.55);

    rig.bodyGroup.scale.set(
      sxz * rig.baseScale,
      sy * rig.baseScale,
      sxz * rig.baseScale
    );
    rig.bodyGroup.position.y = hop + Math.sin(t * 1.9) * 0.045;
    rig.bodyGroup.rotation.y = spin + Math.sin(t * 1.1) * 0.06;
    rig.bodyGroup.rotation.z = wiggle * 0.08 + Math.sin(t * 1.6) * 0.025;

    // 3. Independent hierarchical limb/part animations + Touch-Tracking Pupils!
    const {
      head,
      earL,
      earR,
      eyeL,
      eyeR,
      pupilL,
      pupilR,
      snout,
      tail,
      mouth,
      wingL,
      wingR,
      foliage,
      wheels,
      propeller,
      orbiters,
    } = rig.parts;

    const lx = lookTarget?.x ?? 0;
    const ly = lookTarget?.y ?? 0;

    if (head) {
      head.rotation.z = Math.sin(t * 1.7) * 0.065;
      head.rotation.x = Math.sin(t * 1.3 + 0.5) * 0.035 - ly * 0.14;
      if (!head.userData.overrideYaw) {
        head.rotation.y += (lx * 0.24 - head.rotation.y) * Math.min(1, dt * 7);
      }
    }

    // Touch-tracking pupils inside each glossy eyeball socket!
    const updatePupil = (pupil?: THREE.Object3D) => {
      if (!pupil) return;
      const range = (pupil.userData.trackRange as number | undefined) ?? 0.042;
      const baseZ = (pupil.userData.baseZ as number | undefined) ?? 0.045;
      const targetX = THREE.MathUtils.clamp(lx, -1, 1) * range;
      const targetY = THREE.MathUtils.clamp(ly, -1, 1) * range * 0.82;
      pupil.position.x += (targetX - pupil.position.x) * Math.min(1, dt * 14);
      pupil.position.y += (targetY - pupil.position.y) * Math.min(1, dt * 14);
      // Slight curve pull so pupil stays flush against rounded sclera
      const distSq = pupil.position.x * pupil.position.x + pupil.position.y * pupil.position.y;
      pupil.position.z = baseZ - distSq * 1.8;
    };
    updatePupil(pupilL);
    updatePupil(pupilR);

    if (snout) {
      // Subtle expressive sniff/twitch on snouts & elephant trunk sway
      const sniff = Math.pow(Math.max(0, Math.sin(t * 1.9)), 12) * 0.06;
      snout.rotation.x = Math.sin(t * 2.1) * 0.045 + sniff;
      snout.rotation.z = Math.sin(t * 1.5) * 0.04;
    }

    if (earL) {
      const twitch = Math.pow(Math.max(0, Math.sin(t * 2.2)), 10) * 0.28;
      earL.rotation.z = 0.08 + Math.sin(t * 2.6) * 0.055 + twitch;
    }
    if (earR) {
      const twitch = Math.pow(Math.max(0, Math.sin(t * 2.2 + 1.4)), 10) * 0.28;
      earR.rotation.z = -0.08 - Math.sin(t * 2.6) * 0.055 - twitch;
    }

    // Periodic Pixar-style eye blink every ~4s
    const blinkCycle = (t * 0.72) % 3.2;
    const blinkScale = blinkCycle > 3.04 ? Math.max(0.08, Math.abs(Math.cos(((blinkCycle - 3.04) / 0.16) * Math.PI))) : 1;
    if (eyeL) eyeL.scale.y = blinkScale;
    if (eyeR) eyeR.scale.y = blinkScale;

    if (tail) {
      tail.rotation.y = Math.sin(t * 5.4) * 0.34;
      tail.rotation.z = Math.cos(t * 4.4) * 0.14;
    }

    if (wingL) wingL.rotation.z = Math.sin(t * 6.5) * 0.26;
    if (wingR) wingR.rotation.z = -Math.sin(t * 6.5) * 0.26;

    if (foliage) {
      foliage.rotation.z = Math.sin(t * 1.6) * 0.07;
      foliage.rotation.x = Math.cos(t * 1.3) * 0.04;
    }

    if (wheels) {
      for (const w of wheels) {
        w.rotation.z -= dt * 2.8;
      }
    }

    if (propeller) {
      propeller.rotation.x += dt * 15;
    }

    if (orbiters) {
      orbiters.rotation.z = t * 0.55;
      orbiters.rotation.y = t * 0.75;
    }

    if (mouth && !mouth.userData.overrideAnimation) {
      mouth.scale.y = 1 + Math.sin(t * 2.4) * 0.06;
    }
  }
}

/** Smooth spline/damped miniature-diorama camera rig with touch/gyro parallax, zoom & shake */
export class CameraRig {
  private posSpring = new SpringVec3(0, 3.2, 8.6, 52, 13);
  private lookSpring = new SpringVec3(0, 1.2, 0, 56, 13);
  private parallaxX = new SpringScalar(0, 46, 12);
  private parallaxY = new SpringScalar(0, 46, 12);
  private shakeIntensity = 0;
  private tempPos = new THREE.Vector3();
  private tempLook = new THREE.Vector3();

  setPose(pos: [number, number, number], lookAt: [number, number, number], immediate = false) {
    if (immediate) {
      this.posSpring.setImmediate(pos[0], pos[1], pos[2]);
      this.lookSpring.setImmediate(lookAt[0], lookAt[1], lookAt[2]);
    } else {
      this.posSpring.setTarget(pos[0], pos[1], pos[2]);
      this.lookSpring.setTarget(lookAt[0], lookAt[1], lookAt[2]);
    }
  }

  /** Set normalized diorama tilt/pan target (-1..1 on X & Y) from iPad gyro or touch drag */
  setParallax(nx: number, ny: number) {
    this.parallaxX.target = THREE.MathUtils.clamp(nx, -1, 1);
    this.parallaxY.target = THREE.MathUtils.clamp(ny, -1, 1);
  }

  pulseZoom(amount = 0.55) {
    this.posSpring.z.impulse(-amount * 6);
  }

  shake(amount = 0.18) {
    this.shakeIntensity = Math.min(0.4, this.shakeIntensity + amount);
  }

  update(camera: THREE.PerspectiveCamera, time: number, dt: number) {
    this.posSpring.step(dt, this.tempPos);
    this.lookSpring.step(dt, this.tempLook);

    const px = this.parallaxX.step(dt);
    const py = this.parallaxY.step(dt);

    // Subtle miniature diorama box parallax arc (orbiting around focal center)
    this.tempPos.x += px * 1.15 + Math.sin(time * 0.55) * 0.06;
    this.tempPos.y += py * 0.56 + Math.cos(time * 0.7) * 0.04;
    this.tempPos.z -= Math.abs(px) * 0.16;

    // Tiny counter-shift on lookAt creates convincing window-box depth without losing center framing
    this.tempLook.x += px * 0.14;
    this.tempLook.y += py * 0.08;

    if (this.shakeIntensity > 0.002) {
      this.tempPos.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.tempPos.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 1.4);
    }

    camera.position.copy(this.tempPos);
    camera.lookAt(this.tempLook);
  }
}
