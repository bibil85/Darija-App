import * as THREE from 'three';
import { MaterialLibrary } from './MaterialLibrary.ts';
import { disposeObjectGeometries } from './assets/helpers.ts';

/**
 * Diegetic 3D Idle Guidance Cue (Zero-Text Visual Signposting for Ages 1–3):
 * After 5 seconds of toddler inactivity, smoothly fades in a friendly glowing 3D pointer hand
 * and gentle golden target pulse ring directly over the active 3D vocabulary target!
 */
export class IdleHint3D {
  readonly group = new THREE.Group();
  private handGroup = new THREE.Group();
  private pulseRing: THREE.Mesh;
  private pulseRingMat: THREE.MeshBasicMaterial;
  private glowOrb: THREE.Mesh;
  private glowOrbMat: THREE.MeshBasicMaterial;
  private fadeAlpha = 0;
  private smoothedPos = new THREE.Vector3(0, 1.5, 0);
  private hasTarget = false;

  constructor() {
    this.group.visible = false;

    // 1. Expanding golden target pulse ring underneath/around the target
    this.pulseRingMat = new THREE.MeshBasicMaterial({
      color: '#FDE047',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.pulseRingMat.userData.disposable = true;
    this.pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.78, 32), this.pulseRingMat);
    this.pulseRing.renderOrder = 18;
    this.group.add(this.pulseRing);

    // 2. Soft sunlit halo beacon orb at tap point
    this.glowOrbMat = new THREE.MeshBasicMaterial({
      color: '#FEF08A',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowOrbMat.userData.disposable = true;
    this.glowOrb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), this.glowOrbMat);
    this.glowOrb.renderOrder = 19;
    this.group.add(this.glowOrb);

    // 3. Cute sculpted Pixar-style 3D cartoon pointer hand (glossy warm ivory glove + golden cuff)
    const gloveMat = new THREE.MeshStandardMaterial({
      color: '#FFFBEB',
      emissive: '#FDE68A',
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.05,
    });
    gloveMat.userData.disposable = true;
    const cuffMat = MaterialLibrary.gold('#F59E0B');

    // Rounded cartoon palm
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), gloveMat);
    palm.scale.set(1.05, 0.95, 0.72);
    this.handGroup.add(palm);

    // Pointing index finger (pointing down-left toward the 3D target)
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.28, 8, 12), gloveMat);
    finger.position.set(-0.08, 0.28, 0.04);
    finger.rotation.z = 0.22;
    this.handGroup.add(finger);

    // Cute tucked thumb & curled fingers
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.14, 6, 10), gloveMat);
    thumb.position.set(-0.22, 0.02, 0.06);
    thumb.rotation.z = 0.85;
    this.handGroup.add(thumb);

    for (let i = 0; i < 3; i++) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), gloveMat);
      curl.position.set(0.07 + i * 0.085, 0.14 - i * 0.045, 0.06);
      this.handGroup.add(curl);
    }

    // Golden wrist cuff
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.14, 14), cuffMat);
    cuff.position.set(0.04, -0.25, 0);
    cuff.rotation.z = -0.15;
    this.handGroup.add(cuff);

    // Angle hand naturally like a playful floating glove pointing at the target
    this.handGroup.rotation.set(0.18, -0.18, 0.42);
    this.handGroup.scale.setScalar(1.05);
    this.group.add(this.handGroup);
  }

  update(
    time: number,
    dt: number,
    camera: THREE.Camera,
    active: boolean,
    targetWorldPos: THREE.Vector3 | null
  ) {
    const shouldShow = active && targetWorldPos !== null;

    if (shouldShow && targetWorldPos) {
      if (!this.hasTarget) {
        this.smoothedPos.copy(targetWorldPos);
        this.hasTarget = true;
      } else {
        this.smoothedPos.lerp(targetWorldPos, Math.min(1, dt * 8));
      }
    } else if (!active) {
      this.hasTarget = false;
    }

    const goalAlpha = shouldShow ? 1 : 0;
    this.fadeAlpha += (goalAlpha - this.fadeAlpha) * Math.min(1, dt * (shouldShow ? 5 : 10));

    if (this.fadeAlpha < 0.015) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    this.group.position.copy(this.smoothedPos);

    // Rhythmic gentle "tap-tap" bobbing cycle (1.4s loop)
    const tapCycle = (time * 1.15) % 1;
    const tapDip = Math.sin(tapCycle * Math.PI * 2);
    const tapPress = Math.max(0, -tapDip);

    // Hand floats slightly down-right and gently taps inward toward the target
    this.handGroup.position.set(
      0.56 - tapPress * 0.16,
      -0.48 + tapPress * 0.18,
      0.75 - tapPress * 0.18
    );
    const handScale = (0.95 + Math.sin(time * 3.2) * 0.06) * (0.65 + this.fadeAlpha * 0.35);
    this.handGroup.scale.setScalar(handScale);

    // Concentric pulsing ring billboards cleanly toward camera
    this.pulseRing.quaternion.copy(camera.quaternion);
    const ringPhase = (time * 0.95) % 1;
    const ringScale = 0.65 + ringPhase * 1.35;
    this.pulseRing.scale.setScalar(ringScale);
    this.pulseRingMat.opacity = Math.sin(ringPhase * Math.PI) * 0.68 * this.fadeAlpha;

    // Beacon glow pulses in sync with each tap
    const orbScale = 0.75 + tapPress * 0.55;
    this.glowOrb.scale.setScalar(orbScale);
    this.glowOrbMat.opacity = (0.22 + tapPress * 0.38) * this.fadeAlpha;
  }

  dispose() {
    disposeObjectGeometries(this.group);
    this.pulseRingMat.dispose();
    this.glowOrbMat.dispose();
  }
}
