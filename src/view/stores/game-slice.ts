import type { StateCreator } from 'zustand'
import type { GameState } from '../../domain/game-state'
import type { GameSlice, GameStore } from './types'
import { createInfantry, createSniper } from '../../data/units'
import { LABYRINTH_MAP } from '../../data/maps'

const INITIAL_UNITS = [
  createInfantry('p1-1', 1, 6, 3),
  createInfantry('p1-2', 1, 24, 3),
  createSniper('p1-3', 1, 42, 3),
  createInfantry('p2-1', 2, 6, 45),
  createInfantry('p2-2', 2, 24, 45),
  createSniper('p2-3', 2, 42, 45),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
  obstacles: LABYRINTH_MAP.obstacles,
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
}

export const createGameSlice: StateCreator<GameStore, [['zustand/immer', never]], [], GameSlice> = (set) => ({
  game: initialGameState,

  equipWeapon: (unitId, weapon) => {
    set((state) => {
      const unit = state.game.units[unitId]
      if (unit === undefined) return
      const match = unit.availableWeapons.find((w) => w.name === weapon.name)
      if (match === undefined) return
      unit.weapon = match
    })
  },
})
