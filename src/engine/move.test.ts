import { describe, it, expect } from 'vitest'
import { applyMove } from './move'
import type { GameState } from '../domain/game-state'
import { UNIT_RADIUS_IN } from '../domain/unit'

const BASE_STATE: GameState = {
  units: {
    'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 6, remainingMove: 6 },
  },
  walls: [],
  obstacles: [],
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
}

describe('déplacement d\'une unité', () => {
  it("déplace une unité vers une destination dans sa portée", () => {
    const { state } = applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(state.units['unit-1']?.position).toEqual({ x: 14, y: 10 })
  })

  it("émet un événement unit-moved avec la position précédente et la nouvelle", () => {
    const { events } = applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'unit-moved',
      unitId: 'unit-1',
      from: { x: 10, y: 10 },
      to: { x: 14, y: 10 },
    })
  })

  it("refuse un déplacement qui dépasse la stat move", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-1', { x: 3, y: 10 }, UNIT_RADIUS_IN)

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("accepte un déplacement exactement égal à la stat move", () => {
    const { state } = applyMove(BASE_STATE, 'unit-1', { x: 4, y: 10 }, UNIT_RADIUS_IN)

    expect(state.units['unit-1']?.position).toEqual({ x: 4, y: 10 })
  })

  it("refuse un déplacement vers une position hors du plateau", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-1', { x: -1, y: 10 }, UNIT_RADIUS_IN)

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("refuse un déplacement si l'unité est inconnue", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-x', { x: 10, y: 10 }, UNIT_RADIUS_IN)

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("bloque si remainingMove est épuisé", () => {
    const exhausted: GameState = {
      units: {
        'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 6, remainingMove: 0 },
      },
      walls: [],
      obstacles: [],
      activePlayerId: 1,
    }

    const { state, events } = applyMove(exhausted, 'unit-1', { x: 11, y: 10 }, UNIT_RADIUS_IN)

    expect(state).toBe(exhausted)
    expect(events).toHaveLength(0)
  })

  it("bloque si la distance dépasse remainingMove même si elle est dans move", () => {
    const partial: GameState = {
      units: {
        'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 6, remainingMove: 2 },
      },
      walls: [],
      obstacles: [],
      activePlayerId: 1,
    }

    const { state, events } = applyMove(partial, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(state).toBe(partial)
    expect(events).toHaveLength(0)
  })

  it("ne mute pas le state d'entrée", () => {
    const original = structuredClone(BASE_STATE)

    applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(BASE_STATE).toEqual(original)
  })

  it("refuse un déplacement si la cible chevauche une autre unité", () => {
    const state: GameState = {
      units: {
        'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 10, remainingMove: 10 },
        'unit-2': { id: 'unit-2', position: { x: 14, y: 10 }, move: 6, remainingMove: 6 },
      },
      walls: [],
      obstacles: [],
      activePlayerId: 1,
      activatedUnitId: null,
      phase: 1,
      activatedUnitIds: [],
    }

    const { state: result, events } = applyMove(state, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(result).toBe(state)
    expect(events).toHaveLength(0)
  })

  it("accepte un déplacement si la cible est suffisamment loin d une autre unité", () => {
    const state: GameState = {
      units: {
        'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 10, remainingMove: 10 },
        'unit-2': { id: 'unit-2', position: { x: 17, y: 10 }, move: 6, remainingMove: 6 },
      },
      walls: [],
      obstacles: [],
      activePlayerId: 1,
      activatedUnitId: null,
      phase: 1,
      activatedUnitIds: [],
    }

    const { state: result } = applyMove(state, 'unit-1', { x: 14, y: 10 }, UNIT_RADIUS_IN)

    expect(result.units['unit-1']?.position).toEqual({ x: 14, y: 10 })
  })

  it("refuse un déplacement si la destination chevauche un mur", () => {
    const state: GameState = {
      ...BASE_STATE,
      walls: [{ x: 12, y: 9, width: 4, height: 4 }],
    }

    const { state: result, events } = applyMove(state, 'unit-1', { x: 13, y: 10 }, UNIT_RADIUS_IN)

    expect(result).toBe(state)
    expect(events).toHaveLength(0)
  })

  it("refuse un déplacement si la destination chevauche un obstacle", () => {
    const state: GameState = {
      ...BASE_STATE,
      obstacles: [{ x: 12, y: 9, width: 4, height: 4 }],
    }

    const { state: result, events } = applyMove(state, 'unit-1', { x: 13, y: 10 }, UNIT_RADIUS_IN)

    expect(result).toBe(state)
    expect(events).toHaveLength(0)
  })

  it("refuse un déplacement si les cercles des deux unités se chevauchent", () => {
    const state: GameState = {
      units: {
        'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 10, remainingMove: 10 },
        'unit-2': { id: 'unit-2', position: { x: 14, y: 10 }, move: 6, remainingMove: 6 },
      },
      walls: [],
      obstacles: [],
      activePlayerId: 1,
      activatedUnitId: null,
      phase: 1,
      activatedUnitIds: [],
    }

    const { state: result, events } = applyMove(state, 'unit-1', { x: 12.5, y: 10 }, UNIT_RADIUS_IN)

    expect(result).toBe(state)
    expect(events).toHaveLength(0)
  })
})
