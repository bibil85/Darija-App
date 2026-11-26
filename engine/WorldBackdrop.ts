import * as THREE from 'three';
import {
  DioramaInteractionResult,
  MoroccanDiorama,
} from '../src/3d/environment/MoroccanDiorama.ts';

/**
 * Living 3D Moroccan Kasbah & Riad Courtyard Environment Backdrop.
 * Delegates cleanly to the modular `MoroccanDiorama` builder in `src/3d/environment/`.
 */
export class WorldBackdrop {
  private diorama: MoroccanDiorama;

  constructor() {
    this.diorama = new MoroccanDiorama();
  }

  get group(): THREE.Group {
    return this.diorama.group;
  }

  /** Interactive background delight (tapping the Zellige fountain or articulated date palms!) */
  tryInteract(raycaster: THREE.Raycaster): DioramaInteractionResult {
    return this.diorama.tryInteract(raycaster);
  }

  update(time: number, dt = 0.016) {
    this.diorama.update(time, dt);
  }

  dispose() {
    this.diorama.dispose();
  }
}
