import type { Position, PlayerId, Unit } from './unit'

export type CaptureZone = {
  tiles: Position[]
}

const isOnTile = (position: Position, tile: Position): boolean =>
  Math.floor(position.x) === tile.x && Math.floor(position.y) === tile.y

const isOnZone = (position: Position, zone: CaptureZone): boolean =>
  zone.tiles.some((tile) => isOnTile(position, tile))

export const controlledBy = (zone: CaptureZone, units: Unit[]): PlayerId | null => {
  const unitsOnZone = units.filter((u) => isOnZone(u.position, zone))
  const count1 = unitsOnZone.filter((u) => u.playerId === 1).length
  const count2 = unitsOnZone.filter((u) => u.playerId === 2).length
  if (count1 > count2) return 1
  if (count2 > count1) return 2
  return null
}
