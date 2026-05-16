import type { StateCreator } from 'zustand'
import type { UiSlice, GameStore } from './types'
import { applyMove } from '../../engine/move'
import { resolveAttack } from '../../engine/combat'
import { endActivation } from '../../engine/turn'
import { resolveTarget, distance, capPosition } from '../../domain/position'
import { solidTerrain } from '../../domain/game-state'
import { UNIT_RADIUS_IN } from '../constants'

let flashCounter = 0

export const createUiSlice: StateCreator<GameStore, [['zustand/immer', never]], [], UiSlice> = (set) => ({
  dragState: null,
  attackDragState: null,
  damageFlashes: [],
  pendingDamageFlash: null,
  selectedUnitId: null,
  lastAttackResult: null,

  startDrag: (unitId, rawTarget) => {
    set((state) => {
      const unit = state.game.units[unitId]
      if (unit === undefined) return
      if (unit.playerId !== state.game.activePlayerId) return
      if (state.game.activatedUnitId !== null && state.game.activatedUnitId !== unitId) return
      if (state.game.activatedUnitIds.includes(unitId)) return
      state.game.activatedUnitId = unitId
      state.dragState = {
        unitId,
        target: resolveTarget(unit.position, rawTarget, unit.remainingMove, solidTerrain(state.game), UNIT_RADIUS_IN),
      }
    })
  },

  updateDrag: (rawTarget) => {
    set((state) => {
      if (state.dragState === null) return
      const unit = state.game.units[state.dragState.unitId]
      if (unit === undefined) return
      state.dragState.target = resolveTarget(unit.position, rawTarget, unit.remainingMove, solidTerrain(state.game), UNIT_RADIUS_IN)
    })
  },

  endDrag: () => {
    set((state) => {
      if (state.dragState === null) return
      const { unitId, target } = state.dragState
      const { state: game } = applyMove(state.game, unitId, target, UNIT_RADIUS_IN)
      state.game = game
      state.dragState = null
    })
  },

  startAttackDrag: (attackerId, position) => {
    set((state) => {
      const unit = state.game.units[attackerId]
      if (unit === undefined) return
      if (unit.playerId !== state.game.activePlayerId) return
      if (state.game.activatedUnitId !== null && state.game.activatedUnitId !== attackerId) return
      if (state.game.activatedUnitIds.includes(attackerId)) return
      state.game.activatedUnitId = attackerId
      state.attackDragState = { attackerId, target: position }
    })
  },

  updateAttackDrag: (position) => {
    set((state) => {
      if (state.attackDragState === null) return
      const unit = state.game.units[state.attackDragState.attackerId]
      if (unit === undefined) return
      state.attackDragState.target = capPosition(unit.position, position, unit.weapon.range)
    })
  },

  endAttackDrag: () => {
    set((state) => {
      if (state.attackDragState === null) return
      const { attackerId, target } = state.attackDragState
      state.attackDragState = null

      const targetUnit = Object.values(state.game.units).find(
        (u) => u.id !== attackerId && distance(u.position, target) <= UNIT_RADIUS_IN,
      )
      if (targetUnit === undefined) return

      const { state: game, events } = resolveAttack(state.game, attackerId, targetUnit.id, Math.random)
      state.game = endActivation(game)
      state.selectedUnitId = null

      for (const event of events) {
        if (event.type === 'attack-resolved') {
          state.lastAttackResult = event
          if (event.damageDealt > 0) {
            const hit = game.units[event.targetId]
            if (hit === undefined) continue
            state.pendingDamageFlash = { position: hit.position, amount: event.damageDealt }
          }
        }
      }
    })
  },

  flushPendingDamage: () => {
    set((state) => {
      if (state.pendingDamageFlash === null) return
      state.damageFlashes.push({
        id: `flash-${flashCounter++}`,
        ...state.pendingDamageFlash,
      })
      state.pendingDamageFlash = null
    })
  },

  clearDamageFlash: (id) => {
    set((state) => {
      state.damageFlashes = state.damageFlashes.filter((f) => f.id !== id)
    })
  },

  selectUnit: (unitId) => {
    set((state) => {
      state.selectedUnitId = state.selectedUnitId === unitId ? null : unitId
    })
  },

  endTurn: () => {
    set((state) => {
      state.game = endActivation(state.game)
      state.selectedUnitId = null
    })
  },
})
