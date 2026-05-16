import type { Position, UnitId } from './unit'

export type UnitMovedEvent = {
  type: 'unit-moved'
  unitId: UnitId
  from: Position
  to: Position
}

export type AttackResolvedEvent = {
  type: 'attack-resolved'
  attackerId: UnitId
  targetId: UnitId
  hits: number
  damageDealt: number
}

export type GameEvent = UnitMovedEvent | AttackResolvedEvent
