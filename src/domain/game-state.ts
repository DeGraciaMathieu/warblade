import type { Unit, UnitId, PlayerId } from './unit'
import type { Obstacle } from './obstacle'
import type { CaptureZone } from './capture-zone'

export type GameState = {
  units: Record<UnitId, Unit>
  obstacles: Obstacle[]
  captureZones: CaptureZone[]
  activePlayerId: PlayerId
  activatedUnitId: UnitId | null
  phase: number
  activatedUnitIds: UnitId[]
}
