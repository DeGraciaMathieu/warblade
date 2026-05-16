import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import type { Weapon } from '../domain/weapon'
import { applyMove } from '../engine/move'
import { resolveAttack } from '../engine/combat'
import { resolveTarget, distance } from '../domain/position'
import { createInfantry } from '../data/units'
import { LABYRINTH_MAP } from '../data/maps'
import { UNIT_RADIUS_IN } from './constants'

export type DragState = {
  unitId: UnitId
  target: Position
}

export type AttackDragState = {
  attackerId: UnitId
  target: Position
}

export type DamageFlash = {
  id: string
  position: Position
  amount: number
}

type GameStore = {
  game: GameState
  dragState: DragState | null
  attackDragState: AttackDragState | null
  damageFlashes: DamageFlash[]
  selectedUnitId: UnitId | null
  startDrag: (unitId: UnitId, rawTarget: Position) => void
  updateDrag: (rawTarget: Position) => void
  endDrag: () => void
  startAttackDrag: (attackerId: UnitId, position: Position) => void
  updateAttackDrag: (position: Position) => void
  endAttackDrag: () => void
  clearDamageFlash: (id: string) => void
  selectUnit: (unitId: UnitId) => void
  equipWeapon: (unitId: UnitId, weapon: Weapon) => void
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

let flashCounter = 0

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    game: initialGameState,
    dragState: null,
    attackDragState: null,
    damageFlashes: [],
    selectedUnitId: null,

    startDrag: (unitId, rawTarget) => {
      set((store) => {
        const unit = store.game.units[unitId]
        if (unit === undefined) return
        store.dragState = {
          unitId,
          target: resolveTarget(unit.position, rawTarget, unit.remainingMove, store.game.obstacles, UNIT_RADIUS_IN),
        }
      })
    },

    updateDrag: (rawTarget) => {
      set((store) => {
        if (store.dragState === null) return
        const unit = store.game.units[store.dragState.unitId]
        if (unit === undefined) return
        store.dragState.target = resolveTarget(unit.position, rawTarget, unit.remainingMove, store.game.obstacles, UNIT_RADIUS_IN)
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

    startAttackDrag: (attackerId, position) => {
      set((store) => {
        if (store.game.units[attackerId] === undefined) return
        store.attackDragState = { attackerId, target: position }
      })
    },

    updateAttackDrag: (position) => {
      set((store) => {
        if (store.attackDragState === null) return
        store.attackDragState.target = position
      })
    },

    endAttackDrag: () => {
      set((store) => {
        if (store.attackDragState === null) return
        const { attackerId, target } = store.attackDragState
        store.attackDragState = null

        const targetUnit = Object.values(store.game.units).find(
          (u) => u.id !== attackerId && distance(u.position, target) <= UNIT_RADIUS_IN,
        )
        if (targetUnit === undefined) return

        const { state, events } = resolveAttack(store.game, attackerId, targetUnit.id, Math.random)
        store.game = state

        for (const event of events) {
          if (event.type === 'attack-resolved' && event.damageDealt > 0) {
            const hit = state.units[event.targetId]
            if (hit === undefined) continue
            store.damageFlashes.push({
              id: `flash-${flashCounter++}`,
              position: hit.position,
              amount: event.damageDealt,
            })
          }
        }
      })
    },

    clearDamageFlash: (id) => {
      set((store) => {
        store.damageFlashes = store.damageFlashes.filter((f) => f.id !== id)
      })
    },

    selectUnit: (unitId) => {
      set((store) => {
        store.selectedUnitId = store.selectedUnitId === unitId ? null : unitId
      })
    },

    equipWeapon: (unitId, weapon) => {
      set((store) => {
        const unit = store.game.units[unitId]
        if (unit === undefined) return
        if (!unit.availableWeapons.includes(weapon)) return
        unit.weapon = weapon
      })
    },
  })),
)
