import type { Unit } from '../domain/unit'
import { FUSIL } from './weapons'

export const INFANTRY_MOVE_IN = 14
export const INFANTRY_WOUNDS = 5
export const INFANTRY_SAVE = 5

export const createInfantry = (id: string, x: number, y: number): Unit => ({
  id,
  position: { x, y },
  move: INFANTRY_MOVE_IN,
  remainingMove: INFANTRY_MOVE_IN,
  weapon: FUSIL,
  wounds: INFANTRY_WOUNDS,
  remainingWounds: INFANTRY_WOUNDS,
  save: INFANTRY_SAVE,
})
