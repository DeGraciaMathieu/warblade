import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import type { Weapon } from '../domain/weapon'
import type { AttackResolvedEvent } from '../domain/game-event'
import { applyMove } from '../engine/move'
import { resolveAttack } from '../engine/combat'
import { endActivation } from '../engine/turn'
import { resolveTarget, distance, capPosition } from '../domain/position'
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

type PendingDamageFlash = {
  position: Position
  amount: number
}

type GameStore = {
  game: GameState
  dragState: DragState | null
  attackDragState: AttackDragState | null
  damageFlashes: DamageFlash[]
  pendingDamageFlash: PendingDamageFlash | null
  selectedUnitId: UnitId | null
  lastAttackResult: AttackResolvedEvent | null
  startDrag: (unitId: UnitId, rawTarget: Position) => void
  updateDrag: (rawTarget: Position) => void
  endDrag: () => void
  startAttackDrag: (attackerId: UnitId, position: Position) => void
  updateAttackDrag: (position: Position) => void
  endAttackDrag: () => void
  flushPendingDamage: () => void
  clearDamageFlash: (id: string) => void
  selectUnit: (unitId: UnitId) => void
  equipWeapon: (unitId: UnitId, weapon: Weapon) => void
  endTurn: () => void
}

const INITIAL_UNITS = [
  createInfantry('p1-1', 1, 6, 3),
  createInfantry('p1-2', 1, 24, 3),
  createInfantry('p1-3', 1, 42, 3),
  createInfantry('p2-1', 2, 6, 45),
  createInfantry('p2-2', 2, 24, 45),
  createInfantry('p2-3', 2, 42, 45),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
  obstacles: LABYRINTH_MAP.obstacles,
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
}

let flashCounter = 0

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    game: initialGameState,
    dragState: null,
    attackDragState: null,
    damageFlashes: [],
    pendingDamageFlash: null,
    selectedUnitId: null,
    lastAttackResult: null,

    startDrag: (unitId, rawTarget) => {
      set((store) => {
        const unit = store.game.units[unitId]
        if (unit === undefined) return
        if (unit.playerId !== store.game.activePlayerId) return
        if (store.game.activatedUnitId !== null && store.game.activatedUnitId !== unitId) return
        if (store.game.activatedUnitIds.includes(unitId)) return
        store.game.activatedUnitId = unitId
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
        const unit = store.game.units[attackerId]
        if (unit === undefined) return
        if (unit.playerId !== store.game.activePlayerId) return
        if (store.game.activatedUnitId !== null && store.game.activatedUnitId !== attackerId) return
        if (store.game.activatedUnitIds.includes(attackerId)) return
        store.game.activatedUnitId = attackerId
        store.attackDragState = { attackerId, target: position }
      })
    },

    updateAttackDrag: (position) => {
      set((store) => {
        if (store.attackDragState === null) return
        const unit = store.game.units[store.attackDragState.attackerId]
        if (unit === undefined) return
        store.attackDragState.target = capPosition(unit.position, position, unit.weapon.range)
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
        store.game = endActivation(state)

        for (const event of events) {
          if (event.type === 'attack-resolved') {
            store.lastAttackResult = event
            if (event.damageDealt > 0) {
              const hit = state.units[event.targetId]
              if (hit === undefined) continue
              store.pendingDamageFlash = {
                position: hit.position,
                amount: event.damageDealt,
              }
            }
          }
        }
      })
    },

    flushPendingDamage: () => {
      set((store) => {
        if (store.pendingDamageFlash === null) return
        store.damageFlashes.push({
          id: `flash-${flashCounter++}`,
          ...store.pendingDamageFlash,
        })
        store.pendingDamageFlash = null
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
        const match = unit.availableWeapons.find((w) => w.name === weapon.name)
        if (match === undefined) return
        unit.weapon = match
      })
    },

    endTurn: () => {
      set((store) => {
        store.game = endActivation(store.game)
      })
    },
  })),
)
