import type { Unit, UnitId } from './unit'
import type { Obstacle } from './obstacle'

export type GameState = {
  units: Record<UnitId, Unit>
  obstacles: Obstacle[]
}
