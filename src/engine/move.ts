import type { GameState } from '../domain/game-state'
import type { GameEvent } from '../domain/game-event'
import type { Position, UnitId } from '../domain/unit'
import { BOARD_WIDTH_IN, BOARD_HEIGHT_IN } from '../domain/board'

type Resolution = {
  state: GameState
  events: GameEvent[]
}

const distance = (a: Position, b: Position): number =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

const isInsideBoard = (pos: Position): boolean =>
  pos.x >= 0 && pos.y >= 0 && pos.x <= BOARD_WIDTH_IN && pos.y <= BOARD_HEIGHT_IN

export const applyMove = (state: GameState, unitId: UnitId, target: Position): Resolution => {
  const unit = state.units[unitId]

  if (unit === undefined) return { state, events: [] }
  if (!isInsideBoard(target)) return { state, events: [] }
  const moved = distance(unit.position, target)
  if (moved > unit.remainingMove) return { state, events: [] }

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
