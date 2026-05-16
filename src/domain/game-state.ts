import type { Unit, UnitId, PlayerId } from './unit'
import type { Obstacle } from './obstacle'
import type { CaptureZone } from './capture-zone'

export type GameState = {
  units: Record<UnitId, Unit>
  walls: Obstacle[]
  obstacles: Obstacle[]
  captureZones: CaptureZone[]
  activePlayerId: PlayerId
  activatedUnitId: UnitId | null
  phase: number
  activatedUnitIds: UnitId[]
}

/** Éléments qui bloquent la ligne de vue : walls uniquement. */
export const losBlockers = (state: GameState): Obstacle[] => state.walls

/** Terrain solide qui bloque le mouvement et donne du couvert : walls + obstacles. */
export const solidTerrain = (state: GameState): Obstacle[] => [...state.walls, ...state.obstacles]
