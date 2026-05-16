import type { GameState } from '../domain/game-state'
import type { GameEvent } from '../domain/game-event'
import type { Position, UnitId } from '../domain/unit'
import { BOARD_WIDTH_IN, BOARD_HEIGHT_IN } from '../domain/board'
import { distance } from '../domain/position'

type Resolution = {
  state: GameState
  events: GameEvent[]
}

const isInsideBoard = (pos: Position): boolean =>
  pos.x >= 0 && pos.y >= 0 && pos.x <= BOARD_WIDTH_IN && pos.y <= BOARD_HEIGHT_IN

const collidesWithOtherUnit = (target: Position, unitId: UnitId, units: Record<UnitId, { position: Position }>, unitRadius: number): boolean => {
  const minDist = unitRadius * 2
  for (const [id, other] of Object.entries(units)) {
    if (id === unitId) continue
    if (distance(target, other.position) < minDist) return true
  }
  return false
}

export const applyMove = (state: GameState, unitId: UnitId, target: Position, unitRadius: number): Resolution => {
  const unit = state.units[unitId]

  if (unit === undefined) return { state, events: [] }
  if (!isInsideBoard(target)) return { state, events: [] }
  const moved = distance(unit.position, target)
  if (moved > unit.remainingMove) return { state, events: [] }
  if (unitRadius > 0 && collidesWithOtherUnit(target, unitId, state.units, unitRadius)) return { state, events: [] }

  const newState: GameState = {
    ...state,
    units: {
      ...state.units,
      [unitId]: { ...unit, position: target, remainingMove: unit.remainingMove - moved },
    },
  }

  const event: GameEvent = {
    type: 'unit-moved',
    unitId,
    from: unit.position,
    to: target,
  }

  return { state: newState, events: [event] }
}
