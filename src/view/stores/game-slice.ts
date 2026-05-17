import type { StateCreator } from 'zustand'
import type { GameState } from '../../domain/game-state'
import type { GameSlice, GameStore } from './types'
import { createInfantry, createSniper } from '../../data/units'
import { ARENA_MAP } from '../../data/maps'

const INITIAL_UNITS = [
  // Player 1
  createInfantry('p1-1', 1, 2, 2),
  createSniper('p1-2', 1, 6, 2),
  createInfantry('p1-3', 1, 10, 2),
  createSniper('p1-4', 1, 2, 6),
  createInfantry('p1-5', 1, 2, 10),
  // Player 2
  createInfantry('p2-1', 2, 48, 29),
  createInfantry('p2-2', 2, 48, 33),
  createInfantry('p2-3', 2, 40, 37),
  createInfantry('p2-4', 2, 44, 37),
  createInfantry('p2-5', 2, 48, 37),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
  walls: ARENA_MAP.walls,
  obstacles: ARENA_MAP.obstacles,
  captureZones: ARENA_MAP.captureZones,
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
  gameOver: false,
  scores: { 1: 0, 2: 0 },
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
