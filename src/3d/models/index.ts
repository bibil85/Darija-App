import * as THREE from 'three';
import { MaterialLibrary } from '../../../engine/MaterialLibrary.ts';
import { ArticulatedParts } from './types.ts';
import { buildAnimalModel } from './animalsBuilder.ts';
import { buildFoodModel } from './foodBuilder.ts';
import { buildVehicleModel } from './vehiclesBuilder.ts';
import { buildNatureModel } from './natureBuilder.ts';
import { buildFamilyHomeExtrasModel } from './familyHomeExtrasBuilder.ts';
import { addPart, createBeveledStarGeometry } from './geometryHelpers.ts';

export type { ArticulatedParts, LookTarget } from './types.ts';

/**
 * Dedicated src/3d/models/ Category Model Factory.
 * Routes every Darija vocabulary word to its bespoke multi-part procedural 3D builder:
 * - Animals  (animalsBuilder.ts): lathed torsos, snouts, whiskers, ears, wagging tails, touch-tracking pupils
 * - Food     (foodBuilder.ts): lathed dimpled fruits, Moroccan khobz with steam, gable milk carton, egg cup
 * - Vehicles (vehiclesBuilder.ts): extruded beveled silhouettes, rotating wheels, spinning propeller, sailboat
 * - Nature   (natureBuilder.ts): wavy sun rays, beveled crescent moon, curved orange tree, 8-petal flower, rainbow cloud
 * - Family, Home, Colors, Body Parts & Numbers (familyHomeExtrasBuilder.ts)
 */
export function buildBespokeModel(
  wordId: string,
  container: THREE.Group,
  parts: ArticulatedParts
): void {
  const built =
    buildAnimalModel(wordId, container, parts) ||
    buildFoodModel(wordId, container, parts) ||
    buildVehicleModel(wordId, container, parts) ||
    buildNatureModel(wordId, container, parts) ||
    buildFamilyHomeExtrasModel(wordId, container, parts);

  if (!built) {
    addPart(container, createBeveledStarGeometry(0.55, 0.25, 0.22), MaterialLibrary.gold(), [0, 0.72, 0]);
  }
}
