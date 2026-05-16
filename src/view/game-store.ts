import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import { applyMove } from '../engine/move'
import { resolveTarget } from '../domain/position'
import { createInfantry } from '../data/units'
import { LABYRINTH_MAP } from '../data/maps'

export type DragState = {
  unitId: UnitId
  target: Position
}

type GameStore = {
  game: GameState
  dragState: DragState | null
  startDrag: (unitId: UnitId, rawTarget: Position) => void
  updateDrag: (rawTarget: Position) => void
  endDrag: () => void
}

const INITIAL_UNITS = [
  createInfantry('inf-1', 6,  3),  // bord nord gauche
  createInfantry('inf-2', 42, 3),  // bord nord droit
  createInfantry('inf-3', 24, 45), // bord sud centre
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
  obstacles: LABYRINTH_MAP.obstacles,
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    game: initialGameState,
    dragState: null,

    startDrag: (unitId, rawTarget) => {
      set((store) => {
        const unit = store.game.units[unitId]
        if (unit === undefined) return
        store.dragState = {
          unitId,
          target: resolveTarget(unit.position, rawTarget, unit.move, store.game.obstacles),
        }
      })
    },

    updateDrag: (rawTarget) => {
      set((store) => {
        if (store.dragState === null) return
        const unit = store.game.units[store.dragState.unitId]
        if (unit === undefined) return
        store.dragState.target = resolveTarget(unit.position, rawTarget, unit.move, store.game.obstacles)
      })
    },

    endDrag: () => {
      set((store) => {
        if (store.dragState === null) return
        const { unitId, target } = store.dragState
        const { state } = applyMove(store.game, unitId, target)
        store.game = state
        store.dragState = null
      })
    },
  })),
)
