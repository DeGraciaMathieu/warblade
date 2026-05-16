import { describe, it, expect } from 'vitest'
import { endActivation } from './turn'
import type { GameState } from '../domain/game-state'

const makeState = (activePlayerId: 1 | 2, activatedUnitId: string | null = null): GameState => ({
  units: {},
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
})
