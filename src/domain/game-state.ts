import type { Unit, UnitId } from './unit'

export type GameState = {
  units: Record<UnitId, Unit>
}
