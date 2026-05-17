import type { GameState } from '../../domain/game-state'
import type { UnitId, Position } from '../../domain/unit'
import type { Weapon } from '../../domain/weapon'
import type { AttackResolvedEvent } from '../../domain/game-event'

export type DragState = {
  unitId: UnitId
  target: Position
  path: Position[]
  pathLength: number
}

export type AttackDragState = {
  attackerId: UnitId
  target: Position
}

export type DamageFlash = {
  id: string
  position: Position
  amount: number
}

export type GameSlice = {
  game: GameState
  equipWeapon: (unitId: UnitId, weapon: Weapon) => void
}

export type UiSlice = {
  dragState: DragState | null
  attackDragState: AttackDragState | null
  damageFlashes: DamageFlash[]
  pendingDamageFlash: { position: Position; amount: number } | null
  selectedUnitId: UnitId | null
  lastAttackResult: AttackResolvedEvent | null
  startDrag: (unitId: UnitId, rawTarget: Position) => void
  updateDrag: (rawTarget: Position) => void
  endDrag: () => void
  startAttackDrag: (attackerId: UnitId, position: Position) => void
  updateAttackDrag: (position: Position) => void
  endAttackDrag: () => void
  flushPendingDamage: () => void
  clearDamageFlash: (id: string) => void
  selectUnit: (unitId: UnitId) => void
  endTurn: () => void
}

export type GameStore = GameSlice & UiSlice
