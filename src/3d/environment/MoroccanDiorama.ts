import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { addMesh, disposeObjectGeometries } from '../../../engine/assets/helpers.ts';
import { ZelligeTextureGenerator } from './ZelligeTextureGenerator.ts';

export type DioramaInteractionResult =
  | { type: 'fountain'; worldPos: THREE.Vector3 }
  | { type: 'palm'; worldPos: THREE.Vector3 }
  | null;

interface DropletState {
  phase: number;
  angle: number;
  speed: number;
  radius: number;
  peakY: number;
  isBurst: boolean;
  age: number;
  maxAge: number;
}

interface FallingProp {
  mesh: THREE.Mesh;
  active: boolean;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  age: number;
  isLeaf: boolean;
}

interface PalmTreeEntry {
  root: THREE.Group;
  crown: THREE.Group;
  hitMesh: THREE.Mesh;
  basePos: THREE.Vector3;
  crownWorldOffset: THREE.Vector3;
  shakeTimer: number;
  phase: number;
}

/**
 * Richly Detailed Stylized 3D Moroccan Kasbah & Riad Courtyard Diorama!
 * Keeps the warm "Nintendo / Pixar Toy-Box" look at a locked 60fps on iPad Safari by using
 * GPU InstancedMesh for repetitive details (stepped merlons, pinnate palm leaflets,
 * arcing fountain water droplets, and bougainvillea blossom clusters).
 *
 * Includes toddler background delight:
 * - Tap the octagonal Zellige fountain -> taller splash geyser burst + water-chime!
 * - Tap any articulated date palm -> playful trunk/crown shake + fluttering leaves & coconuts!
 */
export class MoroccanDiorama {
  readonly group = new THREE.Group();

  // Interactive background colliders
  private interactiveHits: THREE.Object3D[] = [];
  private palms: PalmTreeEntry[] = [];
  private clouds: Array<{ group: THREE.Group; baseX: number; speed: number; phase: number }> = [];

  // Living Fountain state
  private fountainCenter = new THREE.Vector3(0, 0, -5.8);
  private waterMesh!: THREE.Mesh;
  private waterBasePositions!: Float32Array;
  private waterRippleRings: THREE.Mesh[] = [];
  private dropletInstanced!: THREE.InstancedMesh;
  private droplets: DropletState[] = [];
  private fountainBoostTimer = 0;

  // Lantern flicker state
  private lanternGlowMats: THREE.MeshStandardMaterial[] = [];
  private lanternLight: THREE.PointLight | null = null;

  // Falling palm leaves & coconuts pool (zero runtime allocation!)
  private fallingProps: FallingProp[] = [];
  private tempMatrix = new THREE.Matrix4();
  private tempPos = new THREE.Vector3();
  private tempQuat = new THREE.Quaternion();
  private tempScale = new THREE.Vector3();

  // Shared disposable materials created specifically for the diorama
  private ownMaterials: THREE.Material[] = [];

  constructor() {
    this.buildCourtyardAndDunes();
    this.buildMoroccanKasbah();
    this.buildZelligeFountain();
    this.buildArticulatedDatePalms();
    this.buildBougainvilleaPlanters();
    this.buildClouds();
    this.initFallingPropPool();
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.ownMaterials.push(mat);
    return mat;
  }

  // =========================================================================
  // 1. COURTYARD PLAZA FLOOR & WIND-RIPPLED SCULPTED DESERT DUNES
  // =========================================================================
  private buildCourtyardAndDunes() {
    // Sunlit Moroccan Riad courtyard plaza floor (receives crisp soft shadows)
    const floorMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: ZelligeTextureGenerator.getRiadCourtyardFloor(),
        roughness: 0.78,
        metalness: 0.04,
      })
    );
    const floor = new THREE.Mesh(new THREE.CircleGeometry(15.5, 48), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Sculpted rolling desert dunes with smooth sinusoidal displacement & wind-ripple bump map
    const duneGeo = new THREE.PlaneGeometry(76, 52, 46, 32);
    duneGeo.rotateX(-Math.PI / 2);
    const pos = duneGeo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z + 3);

      // Keep the central courtyard completely flat beneath the plaza floor
      const courtyardMask = THREE.MathUtils.smoothstep(dist, 12.2, 20.5);
      // Rise gracefully behind the Kasbah and along the desert horizon flanks
      const rearBias = THREE.MathUtils.smoothstep(-z, 4, 24) * 1.45 + 0.55;
      const ridge1 = Math.sin(x * 0.14 + z * 0.09) * 1.65;
      const ridge2 = Math.cos(x * 0.24 - z * 0.16) * 0.85;
      const ridge3 = Math.sin((x + z) * 0.08) * 1.1;

      const h = Math.max(-0.08, (1.45 + ridge1 + ridge2 + ridge3) * courtyardMask * rearBias - 0.12);
      pos.setY(i, h);
    }
    duneGeo.computeVertexNormals();

    const duneMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F2C17A'),
        roughness: 0.88,
        metalness: 0.02,
        bumpMap: ZelligeTextureGenerator.getSandRippleBump(),
        bumpScale: 0.08,
      })
    );
    const dunes = new THREE.Mesh(duneGeo, duneMat);
    dunes.position.set(0, -0.04, -8);
    dunes.receiveShadow = true;
    this.group.add(dunes);
  }

  // =========================================================================
  // 2. MOROCCAN KASBAH CITADEL (Battered Towers, Stepped Merlons, Horseshoe Arches, Sebka, Fanous)
  // =========================================================================
  private buildMoroccanKasbah() {
    const kasbah = new THREE.Group();
    kasbah.position.set(0, 0, -11.4);
    this.group.add(kasbah);

    const piseWall = ZelligeTextureGenerator.getPisePlasterMaps('#E38E5F', 3, 2);
    const piseTower = ZelligeTextureGenerator.getPisePlasterMaps('#D87D4E', 2, 3);
    const sebka = ZelligeTextureGenerator.getSebkaReliefMaps();

    const wallMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: piseWall.map,
        bumpMap: piseWall.bumpMap,
        bumpScale: 0.045,
        roughnessMap: piseWall.roughnessMap,
        roughness: 0.88,
        metalness: 0.03,
      })
    );
    const towerMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: piseTower.map,
        bumpMap: piseTower.bumpMap,
        bumpScale: 0.055,
        roughnessMap: piseTower.roughnessMap,
        roughness: 0.86,
        metalness: 0.03,
      })
    );
    const trimIvoryMat = MaterialLibrary.toy('#FBF0D9', { roughness: 0.55, clearcoat: 0.12 });
    const emeraldGlazeMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0F8B72'),
        roughness: 0.18,
        metalness: 0.08,
        clearcoat: 0.92,
        clearcoatRoughness: 0.14,
      })
    );
    const majorelleMat = MaterialLibrary.glossy('#1D5FD1', 0.72);
    const cedarMat = MaterialLibrary.toy('#6B3418', { bump: 'wood', roughness: 0.62, clearcoat: 0.2 });
    const brassMat = MaterialLibrary.gold('#F59E0B');
    const alcoveDarkMat = MaterialLibrary.toy('#3B1D12', { roughness: 0.92, clearcoat: 0, bump: 'none' });
    const sebkaMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: sebka.map,
        bumpMap: sebka.bumpMap,
        bumpScale: 0.075,
        roughness: 0.78,
        metalness: 0.04,
      })
    );

    // Helper: Battered (tapered) square Moroccan tower using 4-sided tapered cylinder rotated 45°
    const createBatteredTower = (bottomW: number, topW: number, height: number): THREE.Mesh => {
      const rBot = bottomW / Math.SQRT2;
      const rTop = topW / Math.SQRT2;
      const geo = new THREE.CylinderGeometry(rTop, rBot, height, 4);
      geo.rotateY(Math.PI / 4);
      const mesh = new THREE.Mesh(geo, towerMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Extruded Horseshoe (Moorish) Arch Frame Wall Block
    const createHorseshoeArchFrame = (
      outerW: number,
      outerH: number,
      archR: number,
      springY: number,
      depth: number,
      scalloped = false
    ): THREE.ExtrudeGeometry => {
      const shape = new THREE.Shape();
      shape.moveTo(-outerW / 2, 0);
      shape.lineTo(outerW / 2, 0);
      shape.lineTo(outerW / 2, outerH);
      shape.lineTo(-outerW / 2, outerH);
      shape.closePath();

      // Carve authentic Moorish horseshoe cutout (kept 0.02 above y=0 for bulletproof Earcut triangulation!)
      const hole = new THREE.Path();
      const pinchAngle = 0.36; // ~20.6° inward pinch below center
      const halfSpan = Math.cos(pinchAngle) * archR;
      const pinchY = springY - Math.sin(pinchAngle) * archR;

      hole.moveTo(-halfSpan, 0.02);
      hole.lineTo(-halfSpan, pinchY);

      if (scalloped) {
        // Lambrequin / multifoil scalloped Moroccan arch cutout!
        const lobes = 7;
        const startA = Math.PI + pinchAngle;
        const endA = -pinchAngle;
        for (let i = 0; i < lobes; i++) {
          const a0 = THREE.MathUtils.lerp(startA, endA, i / lobes);
          const a1 = THREE.MathUtils.lerp(startA, endA, (i + 1) / lobes);
          const midA = (a0 + a1) * 0.5;
          const x1 = Math.cos(a1) * archR;
          const y1 = springY + Math.sin(a1) * archR;
          const ctrlX = Math.cos(midA) * (archR + 0.16);
          const ctrlY = springY + Math.sin(midA) * (archR + 0.16);
          hole.quadraticCurveTo(ctrlX, ctrlY, x1, y1);
        }
      } else {
        hole.absarc(0, springY, archR, Math.PI + pinchAngle, -pinchAngle, true);
      }

      hole.lineTo(halfSpan, 0.02);
      hole.closePath();
      shape.holes.push(hole);

      return new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.035,
        bevelSegments: 2,
      });
    };

    // Helper: Hanging pierced-brass Fanous Lantern with warm glowing core
    const addFanousLantern = (parent: THREE.Object3D, x: number, y: number, z: number, scale = 1) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.scale.setScalar(scale);

      const glowMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color('#FEF08A'),
          emissive: new THREE.Color('#F59E0B'),
          emissiveIntensity: 1.55,
          roughness: 0.2,
          metalness: 0.1,
        })
      );
      this.lanternGlowMats.push(glowMat);

      // Suspension chain
      addMesh(g, new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6), brassMat, [0, 0.36, 0]);
      // Pierced brass top dome & bottom finial
      addMesh(g, new THREE.ConeGeometry(0.18, 0.2, 6), brassMat, [0, 0.16, 0]);
      addMesh(g, new THREE.CylinderGeometry(0.15, 0.11, 0.28, 6), glowMat, [0, -0.05, 0]);
      // Delicate brass vertical ribs framing the glass
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        addMesh(g, new THREE.BoxGeometry(0.022, 0.3, 0.022), brassMat, [
          Math.cos(a) * 0.14,
          -0.05,
          Math.sin(a) * 0.14,
        ]);
      }
      addMesh(g, new THREE.ConeGeometry(0.11, 0.16, 6), brassMat, [0, -0.26, 0], [Math.PI, 0, 0]);
      parent.add(g);
    };

    // A. Main Central Kasbah Curtain Wall + Flanking Riad Loggia Wings
    const mainWall = new THREE.Mesh(new THREE.BoxGeometry(10.6, 3.65, 1.55), wallMat);
    mainWall.position.set(0, 1.825, -0.35);
    mainWall.castShadow = true;
    mainWall.receiveShadow = true;
    kasbah.add(mainWall);

    // Upper central keep / belvedere rising behind the grand entrance
    const centralKeep = createBatteredTower(4.0, 3.55, 5.25);
    centralKeep.position.set(0, 2.625, -1.25);
    kasbah.add(centralKeep);

    // Emerald-green glazed pyramid cupola + 3-sphere Moroccan brass jamur finial on Central Keep
    addMesh(kasbah, new THREE.ConeGeometry(1.55, 1.35, 4), emeraldGlazeMat, [0, 5.88, -1.25], [0, Math.PI / 4, 0]);
    addMesh(kasbah, new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), brassMat, [0, 6.72, -1.25]);
    addMesh(kasbah, new THREE.SphereGeometry(0.18, 12, 10), brassMat, [0, 6.55, -1.25]);
    addMesh(kasbah, new THREE.SphereGeometry(0.12, 10, 8), brassMat, [0, 6.82, -1.25]);
    addMesh(kasbah, new THREE.SphereGeometry(0.075, 10, 8), brassMat, [0, 7.0, -1.25]);

    // Decorative Ivory Cornice Band & Sebka Relief Panel on Central Keep
    addMesh(kasbah, new THREE.BoxGeometry(3.8, 0.16, 3.8), trimIvoryMat, [0, 5.18, -1.25]);
    addMesh(kasbah, new THREE.BoxGeometry(2.4, 1.15, 0.12), sebkaMat, [0, 4.35, 0.56]);

    // B. Grand Central Recessed Horseshoe + Scalloped Lambrequin Gateway (Tall & Proud above Courtyard!)
    const gateZellige = ZelligeTextureGenerator.getZelligeMosaicMaps(2, 1);
    const gateZelligeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: gateZellige.map,
        bumpMap: gateZellige.bumpMap,
        bumpScale: 0.025,
        roughnessMap: gateZellige.roughnessMap,
        roughness: 0.44,
        metalness: 0.05,
      })
    );

    const gateFrameGeo = createHorseshoeArchFrame(3.25, 3.85, 1.12, 2.22, 0.54, true);
    const gateFrame = new THREE.Mesh(gateFrameGeo, trimIvoryMat);
    gateFrame.position.set(0, 0, 0.34);
    gateFrame.castShadow = true;
    gateFrame.receiveShadow = true;
    kasbah.add(gateFrame);

    // Rich Zellige Mosaic Frieze crowning the grand palace gateway above the scalloped arch!
    addMesh(kasbah, new THREE.BoxGeometry(3.15, 0.42, 0.14), gateZelligeMat, [0, 3.62, 0.88]);

    // Majorelle blue recessed inner spandrel frame + carved cedar double palace doors
    const innerArchGeo = createHorseshoeArchFrame(2.68, 3.45, 0.96, 2.16, 0.24, false);
    const innerArch = new THREE.Mesh(innerArchGeo, majorelleMat);
    innerArch.position.set(0, 0, 0.36);
    kasbah.add(innerArch);

    addMesh(kasbah, new THREE.BoxGeometry(2.25, 3.35, 0.12), alcoveDarkMat, [0, 1.68, 0.24]);
    // Recessed carved cedarwood double gate doors with brass rings
    addMesh(kasbah, new THREE.BoxGeometry(0.86, 2.65, 0.12), cedarMat, [-0.45, 1.32, 0.32]);
    addMesh(kasbah, new THREE.BoxGeometry(0.86, 2.65, 0.12), cedarMat, [0.45, 1.32, 0.32]);
    addMesh(kasbah, new THREE.TorusGeometry(0.11, 0.025, 8, 16), brassMat, [-0.18, 1.35, 0.42]);
    addMesh(kasbah, new THREE.TorusGeometry(0.11, 0.025, 8, 16), brassMat, [0.18, 1.35, 0.42]);

    // Glowing Fanous lantern hanging prominently inside the grand gateway arch + warm subtle glow light
    addFanousLantern(kasbah, 0, 2.86, 0.68, 1.12);
    this.lanternLight = new THREE.PointLight('#FFB347', 1.35, 6.5, 1.8);
    this.lanternLight.position.set(0, 2.65, 1.05);
    kasbah.add(this.lanternLight);

    // C. Flanking Recessed Riad Loggia Colonnade Horseshoe Arches (Left & Right of Gateway)
    const loggiaXs = [-3.15, 3.15];
    for (const lx of loggiaXs) {
      const loggiaGeo = createHorseshoeArchFrame(2.2, 2.75, 0.66, 1.45, 0.42, false);
      const loggiaMesh = new THREE.Mesh(loggiaGeo, wallMat);
      loggiaMesh.position.set(lx, 0, 0.32);
      loggiaMesh.castShadow = true;
      loggiaMesh.receiveShadow = true;
      kasbah.add(loggiaMesh);

      // Deep shaded alcove backing + hanging golden fanous lantern inside each loggia arch!
      addMesh(kasbah, new THREE.BoxGeometry(1.5, 2.25, 0.12), alcoveDarkMat, [lx, 1.12, 0.25]);
      // Zellige dado wainscoting trim inside the loggia
      addMesh(kasbah, new THREE.BoxGeometry(1.48, 0.72, 0.14), majorelleMat, [lx, 0.36, 0.28]);
      addFanousLantern(kasbah, lx, 1.86, 0.56, 0.78);
    }

    // D. Battered Adobe Corner Towers (Inner Main Towers + Outer Flanking Bastion Towers)
    const towerSpecs: Array<{ x: number; z: number; botW: number; topW: number; h: number; cupola: 'dome' | 'pyramid' }> = [
      { x: -5.45, z: 0.15, botW: 2.55, topW: 2.15, h: 5.15, cupola: 'dome' },
      { x: 5.45, z: 0.15, botW: 2.55, topW: 2.15, h: 5.15, cupola: 'dome' },
      { x: -8.6, z: 1.55, botW: 2.1, topW: 1.78, h: 4.15, cupola: 'pyramid' },
      { x: 8.6, z: 1.55, botW: 2.1, topW: 1.78, h: 4.15, cupola: 'pyramid' },
    ];

    // Low outer curtain walls connecting main towers to outer flanking bastions
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.85, 1.15), wallMat);
      wing.position.set(side * 7.0, 1.425, 0.75);
      wing.rotation.y = side * -0.35;
      wing.castShadow = true;
      wing.receiveShadow = true;
      kasbah.add(wing);
    }

    for (const t of towerSpecs) {
      const mesh = createBatteredTower(t.botW, t.topW, t.h);
      mesh.position.set(t.x, t.h / 2, t.z);
      kasbah.add(mesh);

      // Decorative Sebka blind-arcade lattice relief panel on upper tower facade
      addMesh(kasbah, new THREE.BoxGeometry(t.topW * 0.74, 1.12, 0.12), sebkaMat, [
        t.x,
        t.h - 1.05,
        t.z + t.topW * 0.51,
      ]);

      // Small arched tower window with warm glowing brass grille
      const winArchGeo = createHorseshoeArchFrame(0.76, 1.0, 0.22, 0.56, 0.14, false);
      const winArch = new THREE.Mesh(winArchGeo, trimIvoryMat);
      winArch.position.set(t.x, t.h * 0.44, t.z + t.topW * 0.5);
      kasbah.add(winArch);
      addMesh(kasbah, new THREE.BoxGeometry(0.46, 0.72, 0.08), MaterialLibrary.glow('#FDE68A', 0.9), [
        t.x,
        t.h * 0.44 + 0.38,
        t.z + t.topW * 0.48,
      ]);

      // Ivory cornice collar below merlons
      addMesh(kasbah, new THREE.BoxGeometry(t.topW + 0.16, 0.14, t.topW + 0.16), trimIvoryMat, [
        t.x,
        t.h - 0.06,
        t.z,
      ]);

      // Glazed emerald-green cupola dome or tiled pyramid + brass finial
      if (t.cupola === 'dome') {
        addMesh(
          kasbah,
          new THREE.SphereGeometry(t.topW * 0.39, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
          emeraldGlazeMat,
          [t.x, t.h + 0.04, t.z]
        );
        addMesh(kasbah, new THREE.SphereGeometry(0.14, 10, 8), brassMat, [
          t.x,
          t.h + t.topW * 0.45,
          t.z,
        ]);
        addMesh(kasbah, new THREE.SphereGeometry(0.085, 8, 8), brassMat, [
          t.x,
          t.h + t.topW * 0.55,
          t.z,
        ]);
      } else {
        addMesh(
          kasbah,
          new THREE.ConeGeometry(t.topW * 0.54, 0.95, 4),
          emeraldGlazeMat,
          [t.x, t.h + 0.48, t.z],
          [0, Math.PI / 4, 0]
        );
        addMesh(kasbah, new THREE.SphereGeometry(0.12, 10, 8), brassMat, [t.x, t.h + 1.02, t.z]);
      }
    }

    // E. INSTANCED Stepped Saw-Tooth Moroccan Merlons (Crenellations) along ALL Parapets & Towers!
    const merlonShape = new THREE.Shape();
    merlonShape.moveTo(-0.22, 0);
    merlonShape.lineTo(0.22, 0);
    merlonShape.lineTo(0.22, 0.16);
    merlonShape.lineTo(0.14, 0.16);
    merlonShape.lineTo(0.14, 0.30);
    merlonShape.lineTo(0.06, 0.30);
    merlonShape.lineTo(0.0, 0.44);
    merlonShape.lineTo(-0.06, 0.30);
    merlonShape.lineTo(-0.14, 0.30);
    merlonShape.lineTo(-0.14, 0.16);
    merlonShape.lineTo(-0.22, 0.16);
    merlonShape.closePath();

    const merlonGeo = new THREE.ExtrudeGeometry(merlonShape, {
      depth: 0.16,
      bevelEnabled: false,
    });
    merlonGeo.translate(0, 0, -0.08);

    const merlonTransforms: Array<{ pos: [number, number, number]; rotY: number; scale: number }> = [];

    // Merlons along main curtain wall parapet
    for (let x = -4.2; x <= 4.21; x += 0.56) {
      merlonTransforms.push({ pos: [x, 3.65, 0.36], rotY: 0, scale: 1.0 });
    }
    // Merlons around Central Keep crown
    for (let i = -3; i <= 3; i++) {
      merlonTransforms.push({ pos: [i * 0.52, 5.25, -1.25 + 1.72], rotY: 0, scale: 0.92 });
      merlonTransforms.push({ pos: [-1.72, 5.25, -1.25 + i * 0.52], rotY: Math.PI / 2, scale: 0.92 });
      merlonTransforms.push({ pos: [1.72, 5.25, -1.25 + i * 0.52], rotY: Math.PI / 2, scale: 0.92 });
    }
    // Merlons crowning all 4 corner towers
    for (const t of towerSpecs) {
      const half = t.topW * 0.46;
      const steps = 4;
      for (let i = 0; i < steps; i++) {
        const offset = THREE.MathUtils.lerp(-half, half, i / (steps - 1));
        merlonTransforms.push({ pos: [t.x + offset, t.h, t.z + half], rotY: 0, scale: 0.85 });
        merlonTransforms.push({ pos: [t.x - half, t.h, t.z + offset], rotY: Math.PI / 2, scale: 0.85 });
        merlonTransforms.push({ pos: [t.x + half, t.h, t.z + offset], rotY: Math.PI / 2, scale: 0.85 });
      }
    }

    const merlonInstanced = new THREE.InstancedMesh(merlonGeo, trimIvoryMat, merlonTransforms.length);
    merlonInstanced.castShadow = true;
    merlonInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();
    merlonTransforms.forEach((m, i) => {
      dummy.position.set(m.pos[0], m.pos[1], m.pos[2]);
      dummy.rotation.set(0, m.rotY, 0);
      dummy.scale.setScalar(m.scale);
      dummy.updateMatrix();
      merlonInstanced.setMatrixAt(i, dummy.matrix);
    });
    merlonInstanced.instanceMatrix.needsUpdate = true;
    kasbah.add(merlonInstanced);
  }

  // =========================================================================
  // 3. OCTAGONAL ZELLIGE COURTYARD FOUNTAIN (8-Point Star Basin + Living Water + Instanced Droplets)
  // =========================================================================
  private buildZelligeFountain() {
    const fountain = new THREE.Group();
    fountain.position.copy(this.fountainCenter);
    this.group.add(fountain);

    const zellige = ZelligeTextureGenerator.getZelligeMosaicMaps(2, 1);
    const zelligeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: zellige.map,
        bumpMap: zellige.bumpMap,
        bumpScale: 0.028,
        roughnessMap: zellige.roughnessMap,
        roughness: 0.42,
        metalness: 0.06,
      })
    );
    const marbleMat = MaterialLibrary.toy('#FFF9EE', { roughness: 0.24, clearcoat: 0.55, bump: 'none' });
    const brassMat = MaterialLibrary.gold('#F59E0B');

    // Helper: 8-pointed Moroccan star / scalloped octagonal basin contour
    const createStarOctagonShape = (outerR: number, innerR: number): THREE.Shape => {
      const shape = new THREE.Shape();
      const pts = 16;
      for (let i = 0; i < pts; i++) {
        const a = (i / pts) * Math.PI * 2 + Math.PI / 16;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return shape;
    };

    // Stepped outer marble plinth
    const plinthShape = createStarOctagonShape(2.45, 2.22);
    const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    plinthGeo.rotateX(-Math.PI / 2);
    const plinth = new THREE.Mesh(plinthGeo, marbleMat);
    plinth.position.y = 0.01;
    plinth.receiveShadow = true;
    fountain.add(plinth);

    // Raised Zellige-Tiled Octagonal Basin Wall with hollowed interior pool
    const basinWallShape = createStarOctagonShape(2.18, 1.98);
    const poolHole = new THREE.Path();
    poolHole.absarc(0, 0, 1.66, 0, Math.PI * 2, true);
    basinWallShape.holes.push(poolHole);

    const basinWallGeo = new THREE.ExtrudeGeometry(basinWallShape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    basinWallGeo.rotateX(-Math.PI / 2);
    const basinWall = new THREE.Mesh(basinWallGeo, zelligeMat);
    basinWall.position.y = 0.14;
    basinWall.castShadow = true;
    basinWall.receiveShadow = true;
    fountain.add(basinWall);

    // Crisp white marble coping lip around the top of the zellige basin
    const copingShape = createStarOctagonShape(2.24, 2.04);
    const copingHole = new THREE.Path();
    copingHole.absarc(0, 0, 1.62, 0, Math.PI * 2, true);
    copingShape.holes.push(copingHole);
    const copingGeo = new THREE.ExtrudeGeometry(copingShape, { depth: 0.07, bevelEnabled: false });
    copingGeo.rotateX(-Math.PI / 2);
    addMesh(fountain, copingGeo, marbleMat, [0, 0.58, 0]);

    // Deep turquoise tiled basin floor beneath the translucent shimmering water
    addMesh(
      fountain,
      new THREE.CylinderGeometry(1.68, 1.68, 0.1, 24),
      MaterialLibrary.glossy('#0E7490', 0.4),
      [0, 0.18, 0]
    );

    // Shimmering Vertex-Animated Translucent Water Disc (MeshPhysicalMaterial clearcoat/refraction)
    const waterGeo = new THREE.CircleGeometry(1.66, 36);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterBasePositions = new Float32Array((waterGeo.attributes.position as THREE.BufferAttribute).array);

    const waterMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#38BDF8'),
        emissive: new THREE.Color('#0284C7'),
        emissiveIntensity: 0.14,
        roughness: 0.06,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.84,
      })
    );
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = 0.52;
    this.waterMesh.receiveShadow = true;
    fountain.add(this.waterMesh);

    // 2 Concentric Expanding Water Ripple Rings
    for (let r = 0; r < 2; r++) {
      const rMat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color: '#E0F2FE',
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.54, 28), rMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.54;
      fountain.add(ring);
      this.waterRippleRings.push(ring);
    }

    // Sculpted Central Pedestal & Tiered Scalloped Marble Bowl (LatheGeometry)
    const lathePts = [
      new THREE.Vector2(0.01, 0.0),
      new THREE.Vector2(0.55, 0.0),
      new THREE.Vector2(0.46, 0.18),
      new THREE.Vector2(0.28, 0.42),
      new THREE.Vector2(0.24, 0.82),
      new THREE.Vector2(0.76, 0.96), // scalloped wide upper bowl
      new THREE.Vector2(0.82, 1.08),
      new THREE.Vector2(0.72, 1.08),
      new THREE.Vector2(0.60, 0.96),
      new THREE.Vector2(0.18, 0.92),
      new THREE.Vector2(0.14, 1.24),
      new THREE.Vector2(0.01, 1.32),
    ];
    addMesh(fountain, new THREE.LatheGeometry(lathePts, 24), marbleMat, [0, 0.22, 0]);

    // Upper bowl gleaming turquoise water pool + golden brass finial spout
    addMesh(
      fountain,
      new THREE.CircleGeometry(0.68, 24),
      waterMat,
      [0, 1.24, 0],
      [-Math.PI / 2, 0, 0]
    );
    addMesh(fountain, new THREE.SphereGeometry(0.15, 14, 12), brassMat, [0, 1.54, 0]);
    addMesh(fountain, new THREE.ConeGeometry(0.09, 0.24, 10), brassMat, [0, 1.72, 0]);

    // Arcing 3D Water Droplets (InstancedMesh: 32 continuous fountain arcs + 24 splash burst slots!)
    const totalDroplets = 56;
    const dropGeo = new THREE.SphereGeometry(0.065, 8, 6);
    const dropMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#E0F2FE'),
        emissive: new THREE.Color('#7DD3FC'),
        emissiveIntensity: 0.35,
        roughness: 0.05,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.88,
      })
    );
    this.dropletInstanced = new THREE.InstancedMesh(dropGeo, dropMat, totalDroplets);
    this.dropletInstanced.frustumCulled = false;
    fountain.add(this.dropletInstanced);

    for (let i = 0; i < totalDroplets; i++) {
      const isBurst = i >= 32;
      this.droplets.push({
        phase: (i / 32) % 1,
        angle: ((i % 8) / 8) * Math.PI * 2 + (isBurst ? Math.random() * 0.6 : 0),
        speed: isBurst ? 0.9 + Math.random() * 0.6 : 0.72 + (i % 4) * 0.07,
        radius: isBurst ? 0.8 + Math.random() * 0.75 : 0.95 + (i % 3) * 0.14,
        peakY: isBurst ? 2.8 + Math.random() * 0.9 : 2.15 + (i % 3) * 0.14,
        isBurst,
        age: 99,
        maxAge: 1.15,
      });
    }

    // Generous interactive raycast collider for toddler fountain taps
    const hitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.35, 2.45, 1.9, 14),
      MaterialLibrary.invisibleHitbox()
    );
    hitMesh.position.set(0, 0.95, 0);
    hitMesh.userData.dioramaAction = 'fountain';
    fountain.add(hitMesh);
    this.interactiveHits.push(hitMesh);
  }

  // =========================================================================
  // 4. LUSH ARTICULATED DATE PALMS (Ringed Trunks + 14 Pinnate Fronds w/ Instanced Leaflets + Dates)
  // =========================================================================
  private buildArticulatedDatePalms() {
    const bark = ZelligeTextureGenerator.getPalmBarkMaps();
    const trunkMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: bark.map,
        bumpMap: bark.bumpMap,
        bumpScale: 0.06,
        roughness: 0.84,
        metalness: 0.02,
      })
    );
    const ribMat = MaterialLibrary.toy('#3F8C35', { roughness: 0.55, clearcoat: 0.18 });
    const leafletMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2E9E47'),
        roughness: 0.44,
        metalness: 0.03,
        side: THREE.DoubleSide,
      })
    );
    const dateMat = MaterialLibrary.glossy('#D97706', 0.85);
    const coconutMat = MaterialLibrary.toy('#713F12', { bump: 'wood', roughness: 0.65 });

    // Shared leaflet blade geometry (curved diamond blade, instanced across every frond!)
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.quadraticCurveTo(0.08, 0.24, 0.02, 0.56);
    bladeShape.quadraticCurveTo(-0.07, 0.26, 0, 0);
    const leafletGeo = new THREE.ShapeGeometry(bladeShape, 4);

    // 5 varied-height Moroccan Date Palms framing the Riad & Kasbah wings
    const palmConfigs: Array<{ x: number; z: number; scale: number; leanX: number; leanZ: number }> = [
      { x: -7.1, z: -6.9, scale: 1.08, leanX: 0.65, leanZ: 0.18 },
      { x: 7.1, z: -6.9, scale: 1.12, leanX: -0.68, leanZ: 0.16 },
      { x: -9.5, z: -3.2, scale: 0.92, leanX: 0.82, leanZ: 0.25 },
      { x: 9.5, z: -3.2, scale: 0.95, leanX: -0.82, leanZ: 0.22 },
      { x: 5.5, z: -9.4, scale: 0.84, leanX: -0.38, leanZ: 0.2 },
    ];

    palmConfigs.forEach((cfg, idx) => {
      const root = new THREE.Group();
      root.position.set(cfg.x, 0, cfg.z);
      root.scale.setScalar(cfg.scale);

      // Segmented ringed curved trunk (LatheGeometry profile bent naturally along a curve!)
      const trunkHeight = 4.25;
      const latheProfile: THREE.Vector2[] = [];
      const segs = 18;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const baseR = THREE.MathUtils.lerp(0.34, 0.17, t);
        // Subtle periodic ring bulge for authentic date palm segments
        const ringBulge = Math.sin(t * Math.PI * 14) * 0.022;
        latheProfile.push(new THREE.Vector2(baseR + ringBulge, t * trunkHeight));
      }
      const trunkGeo = new THREE.LatheGeometry(latheProfile, 12);
      const tPos = trunkGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < tPos.count; i++) {
        const y = tPos.getY(i);
        const f = y / trunkHeight;
        const bend = f * f;
        tPos.setX(i, tPos.getX(i) + cfg.leanX * bend);
        tPos.setZ(i, tPos.getZ(i) + cfg.leanZ * bend);
      }
      trunkGeo.computeVertexNormals();
      const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
      trunkMesh.castShadow = true;
      trunkMesh.receiveShadow = true;
      root.add(trunkMesh);

      // Crown Pivot at top of trunk (sways gently in desert breeze & shakes on tap!)
      const crown = new THREE.Group();
      crown.position.set(cfg.leanX, trunkHeight, cfg.leanZ);
      root.add(crown);

      // Hanging amber date clusters & coconuts tucked beneath the crown
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2 + 0.4;
        const stalk = new THREE.Group();
        stalk.position.set(Math.cos(ca) * 0.22, -0.18, Math.sin(ca) * 0.22);
        for (let d = 0; d < 5; d++) {
          addMesh(
            stalk,
            new THREE.SphereGeometry(0.065, 8, 6),
            dateMat,
            [(Math.random() - 0.5) * 0.14, -0.08 - d * 0.06, (Math.random() - 0.5) * 0.14],
            undefined,
            [0.85, 1.25, 0.85]
          );
        }
        crown.add(stalk);
      }
      addMesh(crown, new THREE.SphereGeometry(0.14, 10, 8), coconutMat, [0.16, -0.16, 0.14]);
      addMesh(crown, new THREE.SphereGeometry(0.13, 10, 8), coconutMat, [-0.15, -0.18, 0.12]);

      // 14 Arched Pinnate Palm Fronds (2 tiers: 8 outer arching fronds + 6 upper sunlit fronds)
      const frondCount = 14;
      const leafletsPerSide = 8; // 16 leaflets per frond => 224 instanced leaflets in ONE draw call!
      const totalLeaflets = frondCount * leafletsPerSide * 2;
      const leafletInstanced = new THREE.InstancedMesh(leafletGeo, leafletMat, totalLeaflets);
      leafletInstanced.castShadow = true;
      const colorTmp = new THREE.Color();
      const dummy = new THREE.Object3D();
      let leafIdx = 0;

      for (let f = 0; f < frondCount; f++) {
        const isUpper = f >= 8;
        const tierIndex = isUpper ? f - 8 : f;
        const tierTotal = isUpper ? 6 : 8;
        const yaw = (tierIndex / tierTotal) * Math.PI * 2 + (isUpper ? 0.35 : 0);
        const frondLen = isUpper ? 1.85 : 2.35;
        const archPeak = isUpper ? 0.85 : 0.42;
        const tipDrop = isUpper ? -0.18 : -0.82;

        // Curved central frond rib
        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(frondLen * 0.42, archPeak, 0),
          new THREE.Vector3(frondLen * 0.82, archPeak * 0.35 + tipDrop * 0.45, 0),
          new THREE.Vector3(frondLen, tipDrop, 0),
        ]);
        const ribGeo = new THREE.TubeGeometry(ribCurve, 7, 0.032, 5, false);
        ribGeo.rotateY(yaw);
        const ribMesh = new THREE.Mesh(ribGeo, ribMat);
        crown.add(ribMesh);

        // Populate angled pinnate leaflets along both sides of this frond's spline!
        for (let s = 1; s <= leafletsPerSide; s++) {
          const u = s / (leafletsPerSide + 0.5);
          const pt = ribCurve.getPoint(u);
          const tan = ribCurve.getTangent(u);
          // Rotate local point by frond yaw
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          const wx = pt.x * cosY + pt.z * sinY;
          const wz = -pt.x * sinY + pt.z * cosY;

          const sizeFactor = Math.sin(u * Math.PI) * 0.85 + 0.45;
          const pitchDown = Math.atan2(-tan.y, Math.hypot(tan.x, tan.z));

          for (const side of [-1, 1]) {
            dummy.position.set(wx, pt.y, wz);
            dummy.rotation.set(
              side * (0.68 + u * 0.25),
              yaw + side * 0.38,
              -0.35 - pitchDown * 0.5
            );
            dummy.scale.set(
              sizeFactor * (isUpper ? 0.95 : 1.15),
              sizeFactor * (isUpper ? 1.1 : 1.38),
              1
            );
            dummy.updateMatrix();
            leafletInstanced.setMatrixAt(leafIdx, dummy.matrix);

            // Subtle warm sunlit green tint variation across leaflets
            colorTmp.setHSL(0.31 + (isUpper ? 0.02 : -0.015), 0.62, isUpper ? 0.44 : 0.36);
            leafletInstanced.setColorAt(leafIdx, colorTmp);
            leafIdx++;
          }
        }
      }

      leafletInstanced.instanceMatrix.needsUpdate = true;
      if (leafletInstanced.instanceColor) leafletInstanced.instanceColor.needsUpdate = true;
      crown.add(leafletInstanced);

      // Generous interactive collider on each palm tree for toddler taps!
      const hitMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 0.75, 5.2, 10),
        MaterialLibrary.invisibleHitbox()
      );
      hitMesh.position.set(cfg.leanX * 0.65, 2.7, cfg.leanZ * 0.65);
      hitMesh.userData.dioramaAction = 'palm';
      hitMesh.userData.palmIndex = idx;
      root.add(hitMesh);
      this.interactiveHits.push(hitMesh);

      this.group.add(root);
      this.palms.push({
        root,
        crown,
        hitMesh,
        basePos: new THREE.Vector3(cfg.x, 0, cfg.z),
        crownWorldOffset: new THREE.Vector3(
          cfg.x + cfg.leanX * cfg.scale,
          trunkHeight * cfg.scale,
          cfg.z + cfg.leanZ * cfg.scale
        ),
        shakeTimer: 0,
        phase: idx * 1.37,
      });
    });
  }

  // =========================================================================
  // 5. GLAZED TERRACOTTA PLANTER POTS & BOUGAINVILLEA BLOSSOM CLUSTERS (InstancedMesh)
  // =========================================================================
  private buildBougainvilleaPlanters() {
    const potMat = MaterialLibrary.glossy('#C85A32', 0.65);
    const bushMat = MaterialLibrary.toy('#15803D', { roughness: 0.52, clearcoat: 0.15 });
    const petalMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#EC4899'),
        emissive: new THREE.Color('#BE185D'),
        emissiveIntensity: 0.14,
        roughness: 0.35,
      })
    );

    const potProfile = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.36, 0),
      new THREE.Vector2(0.48, 0.42),
      new THREE.Vector2(0.40, 0.72),
      new THREE.Vector2(0.50, 0.84),
      new THREE.Vector2(0.44, 0.88),
      new THREE.Vector2(0.34, 0.78),
    ];
    const potGeo = new THREE.LatheGeometry(potProfile, 16);

    const planterPositions: Array<[number, number]> = [
      [-2.15, -9.8],
      [2.15, -9.8],
      [-5.1, -8.8],
      [5.1, -8.8],
    ];

    const petalPositions: Array<{ pos: THREE.Vector3; scale: number; rot: THREE.Euler }> = [];

    for (const [px, pz] of planterPositions) {
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(px, 0, pz);
      pot.castShadow = true;
      pot.receiveShadow = true;
      this.group.add(pot);

      // Lush rounded greenery mound spilling over the pot
      addMesh(this.group, new THREE.DodecahedronGeometry(0.56, 1), bushMat, [px, 1.12, pz], undefined, [1.15, 0.95, 1.15]);
      addMesh(this.group, new THREE.DodecahedronGeometry(0.4, 1), bushMat, [px + 0.25, 1.42, pz - 0.1]);

      // Scatter 22 vibrant magenta bougainvillea petal clusters around each shrub
      for (let i = 0; i < 22; i++) {
        const theta = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
        const phi = 0.25 + Math.random() * 1.1;
        const r = 0.48 + Math.random() * 0.24;
        petalPositions.push({
          pos: new THREE.Vector3(
            px + Math.sin(phi) * Math.cos(theta) * r,
            1.15 + Math.cos(phi) * r * 0.85,
            pz + Math.sin(phi) * Math.sin(theta) * r
          ),
          scale: 0.75 + Math.random() * 0.65,
          rot: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3),
        });
      }
    }

    const petalGeo = new THREE.DodecahedronGeometry(0.11, 0);
    const petalInstanced = new THREE.InstancedMesh(petalGeo, petalMat, petalPositions.length);
    const dummy = new THREE.Object3D();
    const cTmp = new THREE.Color();
    petalPositions.forEach((p, idx) => {
      dummy.position.copy(p.pos);
      dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      petalInstanced.setMatrixAt(idx, dummy.matrix);
      cTmp.setHex(idx % 3 === 0 ? 0xf43f5e : idx % 3 === 1 ? 0xec4899 : 0xd946ef);
      petalInstanced.setColorAt(idx, cTmp);
    });
    petalInstanced.instanceMatrix.needsUpdate = true;
    if (petalInstanced.instanceColor) petalInstanced.instanceColor.needsUpdate = true;
    this.group.add(petalInstanced);
  }

  // =========================================================================
  // 6. GOLDEN-HOUR PUFFY CLOUDS & FALLING PALM LEAVES / COCONUTS POOL
  // =========================================================================
  private buildClouds() {
    const cloudMat = MaterialLibrary.toy('#FFF8EE', { roughness: 0.55, clearcoat: 0.08, bump: 'none' });
    const configs: Array<[number, number, number, number]> = [
      [-7.8, 7.2, -14, 0.28],
      [1.4, 8.1, -16, 0.22],
      [8.2, 6.9, -13.5, 0.34],
    ];
    for (const [cx, cy, cz, speed] of configs) {
      const g = new THREE.Group();
      addMesh(g, new THREE.SphereGeometry(0.95, 14, 12), cloudMat, [0, 0, 0], undefined, [1.25, 0.8, 0.85]);
      addMesh(g, new THREE.SphereGeometry(0.7, 12, 10), cloudMat, [-0.9, -0.1, 0]);
      addMesh(g, new THREE.SphereGeometry(0.75, 12, 10), cloudMat, [0.92, -0.08, 0]);
      addMesh(g, new THREE.SphereGeometry(0.58, 12, 10), cloudMat, [0.28, 0.36, -0.1]);
      g.position.set(cx, cy, cz);
      this.group.add(g);
      this.clouds.push({ group: g, baseX: cx, speed, phase: Math.random() * Math.PI * 2 });
    }
  }

  private initFallingPropPool() {
    const leafGeo = new THREE.SphereGeometry(0.18, 8, 6);
    leafGeo.scale(2.1, 0.22, 0.72);
    const leafMat = MaterialLibrary.toy('#22C55E', { roughness: 0.42, clearcoat: 0.2 });

    const cocoGeo = new THREE.SphereGeometry(0.15, 10, 8);
    const cocoMat = MaterialLibrary.toy('#78350F', { bump: 'wood', roughness: 0.65 });

    for (let i = 0; i < 12; i++) {
      const isLeaf = i % 3 !== 0;
      const mesh = new THREE.Mesh(isLeaf ? leafGeo : cocoGeo, isLeaf ? leafMat : cocoMat);
      mesh.visible = false;
      mesh.castShadow = true;
      this.group.add(mesh);
      this.fallingProps.push({
        mesh,
        active: false,
        vel: new THREE.Vector3(),
        spin: new THREE.Vector3(),
        age: 0,
        isLeaf,
      });
    }
  }

  // =========================================================================
  // 7. INTERACTIVE TODDLER BACKGROUND DELIGHT (Fountain Splash & Palm Shake!)
  // =========================================================================
  tryInteract(raycaster: THREE.Raycaster): DioramaInteractionResult {
    const hits = raycaster.intersectObjects(this.interactiveHits, false);
    if (hits.length === 0) return null;

    const hitObj = hits[0].object;
    const action = hitObj.userData.dioramaAction as string | undefined;

    if (action === 'fountain') {
      this.triggerFountainSplash();
      return {
        type: 'fountain',
        worldPos: this.fountainCenter.clone().add(new THREE.Vector3(0, 1.55, 0)),
      };
    }

    if (action === 'palm') {
      const idx = hitObj.userData.palmIndex as number;
      const palm = this.palms[idx];
      if (palm) {
        this.triggerPalmShake(palm);
        return {
          type: 'palm',
          worldPos: palm.crownWorldOffset.clone(),
        };
      }
    }

    return null;
  }

  private triggerFountainSplash() {
    this.fountainBoostTimer = 1.25;
    // Launch all 24 burst water droplets in an ecstatic celebratory fountain geyser!
    for (let i = 32; i < this.droplets.length; i++) {
      const d = this.droplets[i];
      d.age = 0;
      d.maxAge = 0.85 + Math.random() * 0.45;
      d.angle = Math.random() * Math.PI * 2;
      d.radius = 0.55 + Math.random() * 1.05;
      d.peakY = 2.65 + Math.random() * 1.15;
    }
  }

  private triggerPalmShake(palm: PalmTreeEntry) {
    palm.shakeTimer = 1.0;

    // Release 3 fluttering palm leaves + 1 playful bouncing coconut from the crown!
    let spawned = 0;
    for (const prop of this.fallingProps) {
      if (prop.active) continue;
      prop.active = true;
      prop.age = 0;
      prop.mesh.visible = true;
      prop.mesh.position.copy(palm.crownWorldOffset).add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 1.2,
          -0.25 + (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 1.2
        )
      );
      prop.vel.set(
        (Math.random() - 0.5) * 1.6,
        prop.isLeaf ? 0.5 + Math.random() * 0.6 : 0.2,
        0.5 + Math.random() * 1.1
      );
      prop.spin.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
      spawned++;
      if (spawned >= 4) break;
    }
  }

  // =========================================================================
  // 8. PER-FRAME ANIMATION LOOP (Water Waves, Droplets, Breeze, Lantern Flicker)
  // =========================================================================
  update(time: number, dt = 0.016) {
    // 1. Living Fountain Water Ripples & Concentric Rings
    if (this.fountainBoostTimer > 0) {
      this.fountainBoostTimer = Math.max(0, this.fountainBoostTimer - dt);
    }
    const waveBoost = 1 + this.fountainBoostTimer * 1.4;
    const wPos = this.waterMesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < wPos.count; i++) {
      const bx = this.waterBasePositions[i * 3];
      const bz = this.waterBasePositions[i * 3 + 2];
      const r = Math.hypot(bx, bz);
      const yOff = Math.sin(r * 6.5 - time * 5.2) * 0.018 * waveBoost;
      wPos.setY(i, yOff);
    }
    wPos.needsUpdate = true;

    this.waterRippleRings.forEach((ring, i) => {
      const p = (time * 0.55 + i * 0.5) % 1;
      ring.scale.setScalar(0.55 + p * 2.15);
      (ring.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.52;
    });

    // 2. Instanced Arcing 3D Water Droplets
    const spoutY = 1.72;
    const basinY = 0.52;
    const boostHeight = this.fountainBoostTimer * 0.72;
    for (let i = 0; i < this.droplets.length; i++) {
      const d = this.droplets[i];
      let tNorm = 0;
      let visible = true;

      if (!d.isBurst) {
        tNorm = (time * d.speed + d.phase) % 1;
      } else {
        d.age += dt;
        if (d.age >= d.maxAge) {
          visible = false;
        } else {
          tNorm = d.age / d.maxAge;
        }
      }

      if (!visible) {
        this.tempScale.setScalar(0);
      } else {
        const r = tNorm * d.radius;
        const peak = d.peakY + (!d.isBurst ? boostHeight : 0);
        // Smooth parabolic arc from brass finial spout down into the zellige water basin
        const y = THREE.MathUtils.lerp(spoutY, basinY, tNorm) + 4 * tNorm * (1 - tNorm) * (peak - spoutY);
        this.tempPos.set(Math.cos(d.angle) * r, y, Math.sin(d.angle) * r);
        const s = (0.7 + Math.sin(tNorm * Math.PI) * 0.55) * (d.isBurst ? 1.25 : 0.95);
        this.tempScale.set(s * 0.85, s * 1.25, s * 0.85);
      }

      this.tempMatrix.compose(this.tempPos, this.tempQuat, this.tempScale);
      this.dropletInstanced.setMatrixAt(i, this.tempMatrix);
    }
    this.dropletInstanced.instanceMatrix.needsUpdate = true;

    // 3. Articulated Date Palm Breeze Sway + Interactive Shake
    for (const p of this.palms) {
      let shakeZ = 0;
      let shakeX = 0;
      if (p.shakeTimer > 0) {
        p.shakeTimer = Math.max(0, p.shakeTimer - dt);
        const env = p.shakeTimer * p.shakeTimer;
        shakeZ = Math.sin(time * 28 + p.phase) * 0.22 * env;
        shakeX = Math.cos(time * 22 + p.phase) * 0.14 * env;
      }
      p.crown.rotation.z = Math.sin(time * 1.25 + p.phase) * 0.065 + shakeZ;
      p.crown.rotation.x = Math.cos(time * 1.05 + p.phase) * 0.045 + shakeX;
    }

    // 4. Fluttering Falling Leaves & Bouncing Coconuts
    for (const prop of this.fallingProps) {
      if (!prop.active) continue;
      prop.age += dt;
      if (prop.isLeaf) {
        // Gentle leaf flutter drift
        prop.vel.y = Math.max(-1.15, prop.vel.y - 1.9 * dt);
        prop.mesh.position.x += (prop.vel.x + Math.sin(time * 7 + prop.age * 5) * 0.75) * dt;
        prop.mesh.position.y += prop.vel.y * dt;
        prop.mesh.position.z += prop.vel.z * dt;
      } else {
        // Bouncy coconut gravity!
        prop.vel.y -= 9.5 * dt;
        prop.mesh.position.addScaledVector(prop.vel, dt);
        if (prop.mesh.position.y < 0.15) {
          prop.mesh.position.y = 0.15;
          prop.vel.y = Math.abs(prop.vel.y) * 0.45;
          prop.vel.x *= 0.7;
          prop.vel.z *= 0.7;
        }
      }
      prop.mesh.rotation.x += prop.spin.x * dt;
      prop.mesh.rotation.y += prop.spin.y * dt;
      prop.mesh.rotation.z += prop.spin.z * dt;

      if (prop.age > 2.8 || (prop.isLeaf && prop.mesh.position.y <= 0.08)) {
        prop.active = false;
        prop.mesh.visible = false;
      }
    }

    // 5. Warm Pierced-Brass Fanous Lantern Flicker
    const flicker = 1.45 + Math.sin(time * 5.2) * 0.18 + Math.sin(time * 11.7) * 0.08;
    for (const m of this.lanternGlowMats) {
      m.emissiveIntensity = flicker;
    }
    if (this.lanternLight) {
      this.lanternLight.intensity = 1.15 + Math.sin(time * 5.2) * 0.22;
    }

    // 6. Drifting Golden-Hour Clouds
    for (const c of this.clouds) {
      c.group.position.x = c.baseX + Math.sin(time * c.speed + c.phase) * 2.1;
      c.group.position.y += Math.sin(time * 0.8 + c.phase) * 0.0012;
    }
  }

  dispose() {
    disposeObjectGeometries(this.group);
    for (const mat of this.ownMaterials) {
      mat.dispose();
    }
    this.ownMaterials = [];
  }
}
