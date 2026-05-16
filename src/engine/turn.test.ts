import { describe, it, expect } from 'vitest'
import { endActivation } from './turn'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'

const makeUnit = (id: string, playerId: 1 | 2, overrides: Partial<Unit> = {}): Unit => ({
  id,
  playerId,
  position: { x: 0, y: 0 },
  move: 6,
  remainingMove: 0,
  weapon: { name: 'gun', range: 12, attacks: 1, toHit: 4, damage: 1 },
  availableWeapons: [],
  wounds: 1,
  remainingWounds: 1,
  save: 4,
  ...overrides,
})

const makeState = (activePlayerId: 1 | 2, activatedUnitId: string | null = null, units: Unit[] = []): GameState => ({
  units: Object.fromEntries(units.map((u) => [u.id, u])),
  obstacles: [],
  activePlayerId,
  activatedUnitId,
})

describe('endActivation', () => {
  it('switches from player 1 to player 2', () => {
    const result = endActivation(makeState(1))
    expect(result.activePlayerId).toBe(2)
  })

  it('switches from player 2 to player 1', () => {
    const result = endActivation(makeState(2))
    expect(result.activePlayerId).toBe(1)
  })

  it('does not mutate the original state', () => {
    const state = makeState(1)
    endActivation(state)
    expect(state.activePlayerId).toBe(1)
  })

  it('resets activatedUnitId to null', () => {
    const result = endActivation(makeState(1, 'unit-1'))
    expect(result.activatedUnitId).toBeNull()
  })

  it('resets remainingMove for units of the new active player', () => {
    const units = [
      makeUnit('p2-a', 2, { remainingMove: 0 }),
      makeUnit('p2-b', 2, { remainingMove: 2 }),
      makeUnit('p1-a', 1, { remainingMove: 0 }),
    ]
    const result = endActivation(makeState(1, null, units))

    expect(result.units['p2-a'].remainingMove).toBe(6)
    expect(result.units['p2-b'].remainingMove).toBe(6)
  })

  it('does not reset remainingMove for units of the previous active player', () => {
    const units = [
      makeUnit('p1-a', 1, { remainingMove: 1 }),
      makeUnit('p2-a', 2, { remainingMove: 0 }),
    ]
    const result = endActivation(makeState(1, null, units))

    expect(result.units['p1-a'].remainingMove).toBe(1)
  })
})
