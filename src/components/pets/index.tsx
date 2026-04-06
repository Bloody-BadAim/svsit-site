export { PetGhost } from './PetGhost'
export { PetPixelCat } from './PetPixelCat'
export { PetOctocat } from './PetOctocat'
export { PetClippy } from './PetClippy'
export { PetDebugBug } from './PetDebugBug'
export { PetBabyDragon } from './PetBabyDragon'
export { PetRobot } from './PetRobot'
export { PetRubberDuck } from './PetRubberDuck'
export { PetKonamiSnake } from './PetKonamiSnake'

import { PetGhost } from './PetGhost'
import { PetPixelCat } from './PetPixelCat'
import { PetOctocat } from './PetOctocat'
import { PetClippy } from './PetClippy'
import { PetDebugBug } from './PetDebugBug'
import { PetBabyDragon } from './PetBabyDragon'
import { PetRobot } from './PetRobot'
import { PetRubberDuck } from './PetRubberDuck'
import { PetKonamiSnake } from './PetKonamiSnake'
import type React from 'react'

export const PET_MAP: Partial<Record<string, (props: { size?: number }) => React.ReactElement>> = {
  pet_ghost: PetGhost,
  pet_pixel_cat: PetPixelCat,
  pet_octocat: PetOctocat,
  pet_clippy: PetClippy,
  pet_debug_bug: PetDebugBug,
  pet_baby_dragon: PetBabyDragon,
  pet_robot: PetRobot,
  pet_rubber_duck: PetRubberDuck,
  pet_konami_snake: PetKonamiSnake,
}

/**
 * Derive a stable pet ID from an accessory definition.
 * Prefers preview_data.petId, falls back to emoji, then derives from name.
 */
export function derivePetId(def: { name: string; preview_data?: Record<string, unknown> | null }): string {
  return (def.preview_data?.petId as string)
    ?? (def.preview_data?.emoji as string)
    ?? `pet_${def.name.toLowerCase().replace(/\s+/g, '_')}`
}

// Pre-compute a lowercase lookup table for case-insensitive matching
const PET_MAP_LOWER: Record<string, (props: { size?: number }) => React.ReactElement> = {}
for (const [key, component] of Object.entries(PET_MAP)) {
  if (component) PET_MAP_LOWER[key.toLowerCase()] = component
}

/**
 * Resolve a pet component from an id string.
 * Tries exact match, then case-insensitive lookup.
 * Callers should use derivePetId() to produce proper IDs.
 */
export function resolvePetComponent(
  petId: string | undefined | null,
): ((props: { size?: number }) => React.ReactElement) | undefined {
  if (!petId) return undefined

  // 1. Exact match
  const exact = PET_MAP[petId]
  if (exact) return exact

  // 2. Case-insensitive match
  const ciMatch = PET_MAP_LOWER[petId.toLowerCase()]
  if (ciMatch) return ciMatch

  return undefined
}
