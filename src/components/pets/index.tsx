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
