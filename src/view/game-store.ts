import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameStore } from './stores/types'
import { createGameSlice } from './stores/game-slice'
import { createUiSlice } from './stores/ui-slice'

export type { DragState, AttackDragState, DamageFlash, GameStore } from './stores/types'

export const useGameStore = create<GameStore>()(
  immer((...args) => ({
    ...createGameSlice(...args),
    ...createUiSlice(...args),
  })),
)
