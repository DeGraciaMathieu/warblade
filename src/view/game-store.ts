import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import { applyMove } from '../engine/move'
import { createInfantry } from '../data/units'

type GameStore = {
  game: GameState
  selectedUnitId: UnitId | null
  selectUnit: (id: UnitId) => void
  moveUnit: (id: UnitId, target: Position) => void
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
    selectedUnitId: null,

    selectUnit: (id) => {
      set((store) => {
        store.selectedUnitId = id
      })
    },

    moveUnit: (id, target) => {
      set((store) => {
        const { state } = applyMove(store.game, id, target)
        store.game = state
        store.selectedUnitId = null
      })
    },
  })),
)
