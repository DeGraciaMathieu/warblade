import type { Unit, UnitId, PlayerId } from './unit'
import type { Obstacle } from './obstacle'

export type GameState = {
  units: Record<UnitId, Unit>
  obstacles: Obstacle[]
  activePlayerId: PlayerId
  activatedUnitId: UnitId | null
  phase: number
  activatedUnitIds: UnitId[]
}
