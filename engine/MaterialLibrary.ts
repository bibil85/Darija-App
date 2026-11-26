import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.ts';

/**
 * Shared PBR Material Library ("Nintendo / Pixar Toy-Box" look).
 * Uses MeshStandardMaterial & MeshPhysicalMaterial with clearcoat, subtle procedural bump maps,
 * and shared caching to keep iPad Safari draw calls & GPU memory ultra-lean.
 */
export class MaterialLibrary {
  private static cache = new Map<string, THREE.Material>();

  /** Soft sculpted vinyl / clay toy material (animals, characters, clothes) */
  static toy(hex: string, opts?: { roughness?: number; metalness?: number; clearcoat?: number; bump?: 'clay' | 'wood' | 'woven' | 'none' }): THREE.MeshPhysicalMaterial {
    const roughness = opts?.roughness ?? 0.38;
    const metalness = opts?.metalness ?? 0.04;
    const clearcoat = opts?.clearcoat ?? 0.25;
    const bump = opts?.bump ?? 'clay';
    const key = `toy_${hex}_${roughness}_${metalness}_${clearcoat}_${bump}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshPhysicalMaterial;

    const bumpMap =
      bump === 'wood'
        ? TextureGenerator.getWoodBump()
        : bump === 'woven'
        ? TextureGenerator.getWovenBump()
        : bump === 'clay'
        ? TextureGenerator.getClayBump()
        : null;

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      roughness,
      metalness,
      clearcoat,
      clearcoatRoughness: 0.22,
      bumpMap,
      bumpScale: bump === 'woven' ? 0.035 : bump === 'wood' ? 0.018 : 0.008,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /** Glossy ceramic / juicy fruit / candy-coated toy plastic */
  static glossy(hex: string, clearcoat = 0.85): THREE.MeshPhysicalMaterial {
    return this.toy(hex, { roughness: 0.2, metalness: 0.05, clearcoat, bump: 'clay' });
  }

  /** Warm metallic gold / brass (crowns, keys, stars, door knockers) */
  static gold(hex = '#FBBF24'): THREE.MeshPhysicalMaterial {
    const key = `gold_${hex}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshPhysicalMaterial;
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      roughness: 0.22,
      metalness: 0.72,
      clearcoat: 0.6,
      emissive: new THREE.Color('#D97706'),
      emissiveIntensity: 0.12,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /** Glowing magical emissive material (stars, highlights, sun rays, blooms) */
  static glow(hex: string, intensity = 0.65): THREE.MeshStandardMaterial {
    const key = `glow_${hex}_${intensity}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      emissive: new THREE.Color(hex),
      emissiveIntensity: intensity,
      roughness: 0.25,
      metalness: 0.1,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /** Glossy dark Pixar eye pupil with crisp clearcoat reflection */
  static eyePupil(): THREE.MeshPhysicalMaterial {
    return this.toy('#1B120C', { roughness: 0.06, metalness: 0.05, clearcoat: 1.0, bump: 'none' });
  }

  /** Bright white sclera / catchlight */
  static eyeWhite(): THREE.MeshPhysicalMaterial {
    return this.toy('#FFFFFF', { roughness: 0.1, metalness: 0.0, clearcoat: 0.9, bump: 'none' });
  }

  /** Rosy soft cheek blush */
  static blush(): THREE.MeshStandardMaterial {
    const key = 'blush_mat';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FB7185'),
      roughness: 0.65,
      metalness: 0.0,
      transparent: true,
      opacity: 0.62,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /** Moroccan Zellige Ceramic Tile Material (rich saturation, balanced glaze) */
  static zelligeTile(): THREE.MeshPhysicalMaterial {
    const key = 'zellige_tile_mat';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshPhysicalMaterial;
    const mat = new THREE.MeshPhysicalMaterial({
      map: TextureGenerator.getZelligeTileTexture(),
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.3,
      clearcoatRoughness: 0.32,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /** Invisible generous raycast hitbox material */
  static invisibleHitbox(): THREE.MeshStandardMaterial {
    const key = 'invisible_hitbox';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;
    const mat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
    });
    this.cache.set(key, mat);
    return mat;
  }

  /**
   * Physically-based Translucent Iridescent Soap Bubble Material:
   * MeshPhysicalMaterial with transmission: 0.9, iridescence: 1.0, thickness: 0.5,
   * thin-film rainbow interference, and an onBeforeCompile GLSL vertex-shader sinusoidal wobble!
   */
  static createSoapBubbleMaterial(tintHex = '#E0F2FE'): {
    material: THREE.MeshPhysicalMaterial;
    uniforms: { uTime: { value: number }; uPhase: { value: number } };
  } {
    const uniforms = {
      uTime: { value: 0 },
      uPhase: { value: Math.random() * Math.PI * 2 },
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      transmission: 0.9,
      iridescence: 1.0,
      iridescenceIOR: 1.33,
      iridescenceThicknessRange: [140, 520],
      thickness: 0.5,
      ior: 1.33,
      roughness: 0.04,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      envMapIntensity: 1.65,
      attenuationColor: new THREE.Color(tintHex),
      attenuationDistance: 4.5,
      depthWrite: false,
    });

    material.userData.disposable = true;
    material.customProgramCacheKey = () => 'soap_bubble_physical_wobble_v1';

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uPhase = uniforms.uPhase;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        uniform float uTime;
        uniform float uPhase;

        float bubbleWobble(vec3 p, float t, float ph) {
          float w1 = sin(p.y * 3.1 + t * 2.8 + ph) * 0.042;
          float w2 = cos(p.x * 2.9 - t * 2.3 + ph * 1.3) * 0.036;
          float w3 = sin((p.z + p.x) * 2.4 + t * 3.4 - ph * 0.7) * 0.024;
          return w1 + w2 + w3;
        }
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
        #include <beginnormal_vertex>
        // Perturb surface normal smoothly so thin-film iridescence & catchlights ripple organically
        float eps = 0.05;
        float wCenter = bubbleWobble(position, uTime, uPhase);
        float dWx = (bubbleWobble(position + vec3(eps, 0.0, 0.0), uTime, uPhase) - wCenter) / eps;
        float dWy = (bubbleWobble(position + vec3(0.0, eps, 0.0), uTime, uPhase) - wCenter) / eps;
        float dWz = (bubbleWobble(position + vec3(0.0, 0.0, eps), uTime, uPhase) - wCenter) / eps;
        objectNormal = normalize(objectNormal - vec3(dWx, dWy, dWz) * 0.35);
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        float disp = bubbleWobble(position, uTime, uPhase);
        transformed += normal * disp;
        `
      );
    };

    return { material, uniforms };
  }

  static disposeAll() {
    this.cache.forEach((m) => m.dispose());
    this.cache.clear();
  }
}
