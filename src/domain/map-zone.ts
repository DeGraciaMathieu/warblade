export type MapZoneType = 'room' | 'corridor'

export type MapZone = {
  x: number
  y: number
  width: number
  height: number
  type: MapZoneType
}
