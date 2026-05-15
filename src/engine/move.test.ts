import { describe, it, expect } from 'vitest'
import { applyMove } from './move'
import type { GameState } from '../domain/game-state'

const BASE_STATE: GameState = {
  units: {
    'unit-1': { id: 'unit-1', position: { x: 10, y: 10 }, move: 6 },
  },
}

describe('applyMove', () => {
  it("déplace une unité vers une destination dans sa portée", () => {
    const { state } = applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 })

    expect(state.units['unit-1']?.position).toEqual({ x: 14, y: 10 })
  })

  it("émet un événement unit-moved avec la position précédente et la nouvelle", () => {
    const { events } = applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 })

    expect(events).toHaveLength(1)
    expect(events[0]).toEqual({
      type: 'unit-moved',
      unitId: 'unit-1',
      from: { x: 10, y: 10 },
      to: { x: 14, y: 10 },
    })
  })

  it("refuse un déplacement qui dépasse la stat move", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-1', { x: 17, y: 10 })

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("accepte un déplacement exactement égal à la stat move", () => {
    const { state } = applyMove(BASE_STATE, 'unit-1', { x: 16, y: 10 })

    expect(state.units['unit-1']?.position).toEqual({ x: 16, y: 10 })
  })

  it("refuse un déplacement vers une position hors du plateau", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-1', { x: -1, y: 10 })

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("refuse un déplacement si l'unité est inconnue", () => {
    const { state, events } = applyMove(BASE_STATE, 'unit-x', { x: 10, y: 10 })

    expect(state).toBe(BASE_STATE)
    expect(events).toHaveLength(0)
  })

  it("ne mute pas le state d'entrée", () => {
    const original = structuredClone(BASE_STATE)

    applyMove(BASE_STATE, 'unit-1', { x: 14, y: 10 })

    expect(BASE_STATE).toEqual(original)
  })
})
