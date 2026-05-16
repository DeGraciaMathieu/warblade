import type { Unit, PlayerId } from '../domain/unit'
import { EPEE, FUSIL, SNIPER } from './weapons'

export const INFANTRY_MOVE_IN = 14
export const INFANTRY_WOUNDS = 5
export const INFANTRY_SAVE = 5

export const createInfantry = (id: string, playerId: PlayerId, x: number, y: number): Unit => ({
  id,
  name: 'Space Marine',
  playerId,
  position: { x, y },
  move: INFANTRY_MOVE_IN,
  remainingMove: INFANTRY_MOVE_IN,
  weapon: FUSIL,
  availableWeapons: [FUSIL, EPEE, SNIPER],
  wounds: INFANTRY_WOUNDS,
  remainingWounds: INFANTRY_WOUNDS,
  save: INFANTRY_SAVE,
})
