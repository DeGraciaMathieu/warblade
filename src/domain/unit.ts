import type { Weapon } from './weapon'

export type UnitId = string

export type Position = {
  x: number
  y: number
}

export type PlayerId = 1 | 2

export type Unit = {
  id: UnitId
  playerId: PlayerId
  position: Position
  move: number
  remainingMove: number
  weapon: Weapon
  availableWeapons: Weapon[]
  wounds: number
  remainingWounds: number
  save: number
}
