import type { Position, UnitId } from './unit'

export type UnitMovedEvent = {
  type: 'unit-moved'
  unitId: UnitId
  from: Position
  to: Position
}

export type GameEvent = UnitMovedEvent
