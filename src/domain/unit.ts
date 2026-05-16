export type UnitId = string

export type Position = {
  x: number
  y: number
}

export type Unit = {
  id: UnitId
  position: Position
  move: number
  remainingMove: number
}
