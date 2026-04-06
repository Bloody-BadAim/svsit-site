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

// Pre-compute a lowercase lookup table for case-insensitive matching
const PET_MAP_LOWER: Record<string, (props: { size?: number }) => React.ReactElement> = {}
for (const [key, component] of Object.entries(PET_MAP)) {
  if (component) PET_MAP_LOWER[key.toLowerCase()] = component
}

/**
 * Robustly resolve a pet component from an id string.
 * Tries: exact match → lowercase match → camelCase→snake_case conversion
 *      → adding "pet_" prefix → name-based fuzzy match.
 * Returns undefined when nothing matches.
 */
export function resolvePetComponent(
  petId: string | undefined | null,
): ((props: { size?: number }) => React.ReactElement) | undefined {
  if (!petId) return undefined

  // 1. Exact match
  const exact = PET_MAP[petId]
  if (exact) return exact

  // 2. Case-insensitive match
  const lower = petId.toLowerCase()
  const ciMatch = PET_MAP_LOWER[lower]
  if (ciMatch) return ciMatch

  // 3. Convert camelCase to snake_case and retry (e.g. "petGhost" → "pet_ghost")
  const snaked = lower.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
  if (snaked !== lower) {
    const snakedMatch = PET_MAP_LOWER[snaked]
    if (snakedMatch) return snakedMatch
  }

  // 4. Try adding "pet_" prefix if missing
  if (!lower.startsWith('pet_')) {
    const prefixed = `pet_${lower}`
    const prefixedMatch = PET_MAP_LOWER[prefixed]
    if (prefixedMatch) return prefixedMatch

    // Also try with snake conversion after prefix
    const prefixedSnaked = `pet_${snaked.replace(/^pet_/, '')}`
    if (prefixedSnaked !== prefixed) {
      const psMatch = PET_MAP_LOWER[prefixedSnaked]
      if (psMatch) return psMatch
    }
  }

  // 5. Try removing "pet_" prefix and re-adding (handles double-prefix)
  if (lower.startsWith('pet_pet_')) {
    const trimmed = lower.replace(/^pet_/, '')
    const trimmedMatch = PET_MAP_LOWER[trimmed]
    if (trimmedMatch) return trimmedMatch
  }

  // 6. Partial substring match as last resort — check if any PET_MAP key ends
  //    with the given id or vice versa (handles e.g. "ghost" matching "pet_ghost")
  for (const [key, component] of Object.entries(PET_MAP_LOWER)) {
    const keyWithoutPrefix = key.replace(/^pet_/, '')
    const idWithoutPrefix = lower.replace(/^pet_/, '')
    if (keyWithoutPrefix === idWithoutPrefix) return component
  }

  return undefined
}
