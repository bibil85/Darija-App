import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CameraRig } from './PhysicsAnimator.ts';
import { ParticleSystem } from './ParticleSystem.ts';
import { TouchFeedbackSystem } from './TouchFeedback.ts';
import { IdleHint3D } from './IdleHint3D.ts';
import { WorldBackdrop } from './WorldBackdrop.ts';
import { BaseScene3D, PointerEvent3D, SceneContext } from './scenes/types.ts';
import { disposeObjectGeometries } from './assets/helpers.ts';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';
import { ToddlerUXGuard } from '../src/ux/ToddlerUXGuard.ts';

/**
 * Single persistent 60fps Three.js WebGL SceneManager optimized for iPad Safari.
 * - Caps DPR at 2 to maintain smooth 60fps on iPad Retina displays.
 * - 3-point studio lighting + PCFSoftShadowMap + PMREM RoomEnvironment IBL.
 * - Subtle UnrealBloomPass + atmospheric warm fog + GPU-instanced particles.
 * - Multi-touch pointer raycasting and clean per-scene WebGL disposal.
 */
export class SceneManager {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraRig: CameraRig;
  private envRenderTarget: THREE.WebGLRenderTarget;

  private worldBackdrop: WorldBackdrop;
  private particles: ParticleSystem;
  private touchFeedback: TouchFeedbackSystem;
  private idleHint: IdleHint3D;
  private stageRoot = new THREE.Group();
  private activeScene: BaseScene3D | null = null;

  private raycaster = new THREE.Raycaster();
  private ndcVec = new THREE.Vector2();
  private activePointers = new Map<number, { x: number; y: number }>();
  private trailDir = new THREE.Vector3();
  private trailPos = new THREE.Vector3();
  private rawLookTarget = { x: 0, y: 0 };
  private lookTarget = { x: 0, y: 0 };
  private pointerIdleTime = 99;

  // Miniature diorama parallax state (touch drag + iPad DeviceOrientationEvent gyroscope)
  private touchParallax = { x: 0, y: 0 };
  private gyroParallax = { x: 0, y: 0 };
  private gyroActive = false;
  private gyroBaseline: { pitch: number; roll: number } | null = null;
  private gyroAttached = false;

  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private disposed = false;

  private ctx: SceneContext;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // 1. High-performance WebGLRenderer (DPR capped at 2 for iPad Safari!)
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Scene, golden-hour Moroccan sky & warm atmospheric horizon haze (keeps foreground toys crisp!)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#92D6FB');
    this.scene.fog = new THREE.Fog('#F5DBC0', 17.5, 48);

    // 3. Procedural HDRI Environment Map (PMREMGenerator + RoomEnvironment, tuned for crisp speculars)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRenderTarget = pmrem.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRenderTarget.texture;
    this.scene.environmentIntensity = 0.45;
    roomEnv.dispose();
    pmrem.dispose();

    // 4. Camera + Spring CameraRig
    const width = Math.max(1, canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, canvas.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 80);
    this.cameraRig = new CameraRig();
    this.cameraRig.setPose([0, 3.0, 9.0], [0, 1.2, 0], true);

    // 5. Golden-Hour 3-Point Nintendo / Pixar Studio Lighting Rig (warm sunlit courtyard + crisp foreground pop!)
    const hemiLight = new THREE.HemisphereLight('#FFF8E7', '#C97E42', 0.58);
    this.scene.add(hemiLight);

    // Warm Golden-Hour Sun Key Light casting long sculpted soft shadows across the Riad courtyard
    const keyLight = new THREE.DirectionalLight('#FFE7B8', 1.56);
    keyLight.position.set(7.5, 8.2, 6.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 32;
    const d = 13.0;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.normalBias = 0.035;
    keyLight.shadow.radius = 3.2;
    this.scene.add(keyLight);

    // Cool Majorelle Rim Light for crisp Pixar foreground toy separation against warm Kasbah backdrop
    const rimLight = new THREE.DirectionalLight('#60A5FA', 0.62);
    rimLight.position.set(-6.5, 4.8, -5.0);
    this.scene.add(rimLight);

    // 6. Living World Backdrop + GPU-Instanced Particles + Touch Feedback + Diegetic 3D Idle Hint + Active Stage
    this.worldBackdrop = new WorldBackdrop();
    this.particles = new ParticleSystem();
    this.touchFeedback = new TouchFeedbackSystem();
    this.idleHint = new IdleHint3D();
    this.scene.add(this.worldBackdrop.group);
    this.scene.add(this.particles.group);
    this.scene.add(this.touchFeedback.group);
    this.scene.add(this.idleHint.group);
    this.scene.add(this.stageRoot);

    // 7. Gentle Bloom Post-Processing Pipeline (high threshold so ONLY magical stars/sparkles bloom!)
    this.renderer.setSize(width, height, false);
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.16,
      0.35,
      1.15
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    // 8. Shared Scene Context
    this.ctx = {
      stageRoot: this.stageRoot,
      particles: this.particles,
      touchFeedback: this.touchFeedback,
      cameraRig: this.cameraRig,
      camera: this.camera,
      lookTarget: this.lookTarget,
      raycast: (ndcX, ndcY, objects) => {
        this.ndcVec.set(ndcX, ndcY);
        this.raycaster.setFromCamera(this.ndcVec, this.camera);
        return this.raycaster.intersectObjects(objects, false);
      },
      screenToPlane: (ndcX, ndcY, plane) => {
        this.ndcVec.set(ndcX, ndcY);
        this.raycaster.setFromCamera(this.ndcVec, this.camera);
        const out = new THREE.Vector3();
        return this.raycaster.ray.intersectPlane(plane, out) ? out : null;
      },
    };

    // Bind resize, global touch-tracking for 3D pupils & diorama parallax, & multi-touch canvas raycasting
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handleGlobalPointerTrack);
    window.addEventListener('pointerdown', this.handleGlobalPointerTrack);
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointercancel', this.handlePointerUp);

    // Automatically attach gyroscope on browsers that don't require iOS explicit permission
    if (
      typeof window !== 'undefined' &&
      'DeviceOrientationEvent' in window &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission !== 'function'
    ) {
      this.attachGyroListener();
    }

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /** Smoothly switch active 3D scene while cleanly disposing old stage geometries */
  setScene(next: BaseScene3D | null) {
    const hadPrevious = this.activeScene !== null;
    if (this.activeScene) {
      this.activeScene.dispose(this.ctx);
      disposeObjectGeometries(this.stageRoot);
      while (this.stageRoot.children.length > 0) {
        this.stageRoot.remove(this.stageRoot.children[0]);
      }
    }
    this.activeScene = next;
    ToddlerUXGuard.resetObjectCooldowns();
    ToddlerUXGuard.recordActivity();
    if (next) {
      if (hadPrevious) {
        SoundFXEngine.playWhoosh(1);
      }
      next.mount(this.ctx);
    }
  }

  /** Trigger a joyous global 3D reward celebration burst + camera pulse */
  triggerCelebration(origin?: THREE.Vector3) {
    const pos = origin ?? new THREE.Vector3(0, 1.8, 0.5);
    this.particles.burstStars(pos, 24);
    this.particles.burstConfetti(pos, 48);
    this.cameraRig.pulseZoom(0.65);
    this.cameraRig.shake(0.14);
  }

  private toPointerEvent3D(e: PointerEvent): PointerEvent3D {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
    return {
      pointerId: e.pointerId,
      ndcX,
      ndcY,
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }

  /** Returns true on iPadOS/iOS Safari where DeviceOrientationEvent requires a user gesture */
  static needsGyroPermission(): boolean {
    return (
      typeof window !== 'undefined' &&
      'DeviceOrientationEvent' in window &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    );
  }

  /** Request iPad Safari gyroscope permission inside a user tap handler */
  async enableGyroscope(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return 'unsupported';
    }
    const devOri = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof devOri.requestPermission === 'function') {
      try {
        const res = await devOri.requestPermission();
        if (res === 'granted') {
          this.attachGyroListener();
          return 'granted';
        }
        return 'denied';
      } catch {
        return 'denied';
      }
    }
    this.attachGyroListener();
    return 'granted';
  }

  private attachGyroListener() {
    if (this.gyroAttached) return;
    this.gyroAttached = true;
    this.gyroBaseline = null;
    window.addEventListener('deviceorientation', this.handleDeviceOrientation);
  }

  private handleDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;

    // Remap beta/gamma cleanly for iPad landscape (90 / -90 / 270) vs portrait (0)
    const angle =
      (window.screen?.orientation?.angle ??
        (window as unknown as { orientation?: number }).orientation ??
        0);

    let roll = e.gamma;
    let pitch = e.beta;
    if (angle === 90) {
      roll = e.beta;
      pitch = -e.gamma;
    } else if (angle === -90 || angle === 270) {
      roll = -e.beta;
      pitch = e.gamma;
    } else if (angle === 180) {
      roll = -e.gamma;
      pitch = -e.beta;
    }

    // Calibrate around the child's comfortable lap holding angle & slowly adapt
    if (!this.gyroBaseline) {
      this.gyroBaseline = { pitch, roll };
    } else {
      this.gyroBaseline.pitch += (pitch - this.gyroBaseline.pitch) * 0.008;
      this.gyroBaseline.roll += (roll - this.gyroBaseline.roll) * 0.008;
    }

    const dRoll = roll - this.gyroBaseline.roll;
    const dPitch = pitch - this.gyroBaseline.pitch;
    this.gyroParallax.x = THREE.MathUtils.clamp(dRoll / 24, -1, 1);
    this.gyroParallax.y = THREE.MathUtils.clamp(-dPitch / 22, -1, 1);
    this.gyroActive = true;
  };

  private handleGlobalPointerTrack = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const nx = THREE.MathUtils.clamp(((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1);
    const ny = THREE.MathUtils.clamp(-((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1, -1, 1);
    this.rawLookTarget.x = nx;
    this.rawLookTarget.y = ny;
    // Touch drag / pointer subtly pans & tilts the miniature diorama camera!
    this.touchParallax.x = nx * 0.85;
    this.touchParallax.y = ny * 0.75;
    this.pointerIdleTime = 0;
  };

  /** Project screen NDC to a world point at a fixed depth in front of the camera for ripples/trails */
  private ndcToWorldAtDepth(ndcX: number, ndcY: number, depth = 5.4): THREE.Vector3 {
    this.ndcVec.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.ndcVec, this.camera);
    this.trailDir.copy(this.raycaster.ray.direction);
    this.trailPos.copy(this.raycaster.ray.origin).addScaledVector(this.trailDir, depth);
    return this.trailPos.clone();
  }

  private handlePointerDown = (e: PointerEvent) => {
    SoundFXEngine.unlock();
    const width = window.innerWidth || this.canvas.clientWidth || 1024;
    const height = window.innerHeight || this.canvas.clientHeight || 768;

    // Palm & 24px bezel edge-rest rejection: deferred per pointerId so other active fingers still work!
    if (!ToddlerUXGuard.evaluatePointerDown(e, width, height)) {
      return;
    }

    const pe = this.toPointerEvent3D(e);
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Spawn tactile 3D shockwave ripple at touch point
    const ripplePos = this.ndcToWorldAtDepth(pe.ndcX, pe.ndcY, 5.2);
    this.touchFeedback.spawnRipple(ripplePos, this.camera, '#FEF08A');

    // Interactive Background Delight (Fountain splash & Palm shake) ONLY when tap misses foreground game objects!
    this.ndcVec.set(pe.ndcX, pe.ndcY);
    this.raycaster.setFromCamera(this.ndcVec, this.camera);
    const foregroundHits = this.raycaster.intersectObjects(this.stageRoot.children, true);
    if (foregroundHits.length === 0) {
      const bgHit = this.worldBackdrop.tryInteract(this.raycaster);
      if (bgHit && ToddlerUXGuard.canTriggerObject(`bg:${bgHit.type}`, 240)) {
        if (bgHit.type === 'fountain') {
          SoundFXEngine.playWaterSplash(pe.ndcX);
          this.touchFeedback.spawnRipple(bgHit.worldPos, this.camera, '#7DD3FC');
          this.particles.burstStars(bgHit.worldPos, 10);
        } else if (bgHit.type === 'palm') {
          SoundFXEngine.playPalmRustle(pe.ndcX);
          this.touchFeedback.spawnRipple(bgHit.worldPos, this.camera, '#86EFAC');
        }
      }
    }

    if (!this.activeScene?.onPointerDown) return;
    this.activeScene.onPointerDown(pe, this.ctx);
  };

  private handlePointerMove = (e: PointerEvent) => {
    const width = window.innerWidth || this.canvas.clientWidth || 1024;
    const height = window.innerHeight || this.canvas.clientHeight || 768;
    const verdict = ToddlerUXGuard.evaluatePointerMove(e, width, height);
    if (verdict === 'ignore') return;

    const pe = this.toPointerEvent3D(e);

    // If an edge-started finger deliberately dragged inward past the bezel, promote it cleanly
    if (verdict === 'promote') {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const ripplePos = this.ndcToWorldAtDepth(pe.ndcX, pe.ndcY, 5.2);
      this.touchFeedback.spawnRipple(ripplePos, this.camera, '#FEF08A');
      this.activeScene?.onPointerDown?.(pe, this.ctx);
      return;
    }

    const prev = this.activePointers.get(e.pointerId);
    if (prev) {
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      if (dist > 4) {
        prev.x = e.clientX;
        prev.y = e.clientY;
        const speed = Math.min(2.0, dist / 18);
        const trailPoint = this.ndcToWorldAtDepth(pe.ndcX, pe.ndcY, 5.0);
        this.touchFeedback.emitTrail(trailPoint, speed, pe.ndcX);
      }
    }
    if (!this.activeScene?.onPointerMove) return;
    this.activeScene.onPointerMove(pe, this.ctx);
  };

  private handlePointerUp = (e: PointerEvent) => {
    const wasActive = ToddlerUXGuard.evaluatePointerUp(e);
    this.activePointers.delete(e.pointerId);
    if (!wasActive) return;
    if (!this.activeScene?.onPointerUp) return;
    this.activeScene.onPointerUp(this.toPointerEvent3D(e), this.ctx);
  };

  handleResize = () => {
    if (this.disposed) return;
    const parent = this.canvas.parentElement;
    const width = Math.max(1, parent?.clientWidth || window.innerWidth);
    const height = Math.max(1, parent?.clientHeight || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  };

  private loop = (now: number) => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.loop);

    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.elapsed += dt;

    // Smoothly track user touch/pointer for 3D character pupils; gently relax to curious idle glance
    this.pointerIdleTime += dt;
    const goalX = this.pointerIdleTime < 3.5 ? this.rawLookTarget.x : Math.sin(this.elapsed * 0.7) * 0.25;
    const goalY = this.pointerIdleTime < 3.5 ? this.rawLookTarget.y : Math.cos(this.elapsed * 0.55) * 0.12;
    this.lookTarget.x += (goalX - this.lookTarget.x) * Math.min(1, dt * 10);
    this.lookTarget.y += (goalY - this.lookTarget.y) * Math.min(1, dt * 10);

    // Blend iPad gyroscope & touch-drag parallax into the miniature diorama CameraRig
    const touchWeight = this.pointerIdleTime < 2.2 ? 1.0 : Math.max(0, 1 - (this.pointerIdleTime - 2.2) * 0.6);
    const combinedX = THREE.MathUtils.clamp(
      (this.gyroActive ? this.gyroParallax.x : 0) + this.touchParallax.x * touchWeight,
      -1,
      1
    );
    const combinedY = THREE.MathUtils.clamp(
      (this.gyroActive ? this.gyroParallax.y : 0) + this.touchParallax.y * touchWeight,
      -1,
      1
    );
    this.cameraRig.setParallax(combinedX, combinedY);

    this.worldBackdrop.update(this.elapsed, dt);
    this.particles.update(this.elapsed, dt);
    this.touchFeedback.update(dt, this.camera);
    if (this.activeScene) {
      this.activeScene.update(this.elapsed, dt, this.ctx);
    }

    // Diegetic 3D Idle Guidance: show glowing 3D pointer hand & pulse ring after 5s inactivity
    const hintActive = ToddlerUXGuard.isIdleHintActive();
    const hintPos =
      hintActive && this.activeScene?.getHintTarget
        ? this.activeScene.getHintTarget(this.elapsed)
        : null;
    this.idleHint.update(this.elapsed, dt, this.camera, hintActive, hintPos);

    this.cameraRig.update(this.camera, this.elapsed, dt);

    this.composer.render();
  };

  dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handleGlobalPointerTrack);
    window.removeEventListener('pointerdown', this.handleGlobalPointerTrack);
    if (this.gyroAttached) {
      window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
    }
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp);

    this.setScene(null);
    this.worldBackdrop.dispose();
    this.particles.dispose();
    this.touchFeedback.dispose();
    this.idleHint.dispose();
    this.envRenderTarget.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
