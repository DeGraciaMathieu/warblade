import type { Unit } from '../domain/unit'

export const INFANTRY_MOVE_IN = 6

export const createInfantry = (id: string, x: number, y: number): Unit => ({
  id,
  position: { x, y },
  move: INFANTRY_MOVE_IN,
  remainingMove: INFANTRY_MOVE_IN,
})
