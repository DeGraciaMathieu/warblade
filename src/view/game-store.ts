import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import { applyMove } from '../engine/move'
import { capPosition } from '../domain/position'
import { createInfantry } from '../data/units'

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
  createInfantry('inf-1', 8, 8),
  createInfantry('inf-2', 20, 15),
  createInfantry('inf-3', 35, 30),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
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
          target: capPosition(unit.position, rawTarget, unit.move),
        }
      })
    },

    updateDrag: (rawTarget) => {
      set((store) => {
        if (store.dragState === null) return
        const unit = store.game.units[store.dragState.unitId]
        if (unit === undefined) return
        store.dragState.target = capPosition(unit.position, rawTarget, unit.move)
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
