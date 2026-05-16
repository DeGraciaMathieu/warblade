import type { StateCreator } from 'zustand'
import type { GameState } from '../../domain/game-state'
import type { GameSlice, GameStore } from './types'
import { createInfantry, createSniper } from '../../data/units'
import { LABYRINTH_MAP } from '../../data/maps'

const INITIAL_UNITS = [
  createInfantry('p1-1', 1, 8, 2),
  createInfantry('p1-2', 1, 20, 2),
  createSniper('p1-3', 1, 32, 2),
  createInfantry('p2-1', 2, 8, 33),
  createInfantry('p2-2', 2, 20, 33),
  createSniper('p2-3', 2, 32, 33),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
  obstacles: LABYRINTH_MAP.obstacles,
  captureZones: LABYRINTH_MAP.captureZones,
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
