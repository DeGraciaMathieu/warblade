import { describe, it, expect } from 'vitest'
import { decide } from './ai-player'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'
import type { Obstacle } from '../domain/obstacle'

function makeUnit(id: string, playerId: 1 | 2, x: number, y: number, overrides: Partial<Unit> = {}): Unit {
  return {
    id,
    name: 'Test',
    playerId,
    position: { x, y },
    move: 6,
    remainingMove: 6,
    weapon: { name: 'rifle', range: 12, attacks: 1, toHit: 4, damage: 1 },
    availableWeapons: [],
    wounds: 3,
    remainingWounds: 3,
    save: 5,
    ...overrides,
  }
}

function makeState(units: Unit[], overrides: Partial<GameState> = {}): GameState {
  return {
    units: Object.fromEntries(units.map((u) => [u.id, u])),
    obstacles: [],
    activePlayerId: 2,
    activatedUnitId: null,
    phase: 1,
    activatedUnitIds: [],
    ...overrides,
  }
}

describe('décision de l\'IA', () => {
  it('returns null when it is player 1 turn', () => {
    const state = makeState([makeUnit('p1', 1, 0, 0), makeUnit('p2', 2, 10, 0)], { activePlayerId: 1 })
    expect(decide(state)).toBeNull()
  })

  it('returns null when all P2 units are already activated', () => {
    const state = makeState([makeUnit('p1', 1, 0, 0), makeUnit('p2', 2, 10, 0)], { activatedUnitIds: ['p2'] })
    expect(decide(state)).toBeNull()
  })

  it('returns null when there are no living enemies', () => {
    const state = makeState([makeUnit('p1', 1, 5, 0, { remainingWounds: 0 }), makeUnit('p2', 2, 0, 0)])
    expect(decide(state)).toBeNull()
  })

  it('attacks when enemy is within weapon range with LOS', () => {
    const state = makeState([makeUnit('p1', 1, 5, 0), makeUnit('p2', 2, 0, 0)])
    expect(decide(state)).toEqual({ type: 'attack', attackerId: 'p2', targetPosition: { x: 5, y: 0 } })
  })

  it('moves toward nearest enemy when out of weapon range', () => {
    const state = makeState([makeUnit('p1', 1, 30, 0), makeUnit('p2', 2, 0, 0)])
    const decision = decide(state)
    expect(decision?.type).toBe('move')
    if (decision?.type !== 'move') return
    expect(decision.unitId).toBe('p2')
    expect(decision.target.x).toBeGreaterThan(0)
    expect(decision.target.x).toBeLessThanOrEqual(6)
  })

  it('returns end-turn when already activated and no attack possible', () => {
    const state = makeState(
      [makeUnit('p1', 1, 30, 0), makeUnit('p2', 2, 0, 0)],
      { activatedUnitId: 'p2' },
    )
    expect(decide(state)).toEqual({ type: 'end-turn' })
  })

  it('does not attack when an obstacle blocks LOS', () => {
    const obstacle: Obstacle = { x: 2, y: -1, width: 1, height: 3 }
    const state = makeState(
      [makeUnit('p1', 1, 5, 0), makeUnit('p2', 2, 0, 0)],
      { obstacles: [obstacle] },
    )
    const decision = decide(state)
    expect(decision?.type).toBe('move')
  })

  it('picks an unactivated unit when multiple P2 units exist', () => {
    const state = makeState(
      [makeUnit('p1', 1, 5, 0), makeUnit('p2a', 2, 0, 0), makeUnit('p2b', 2, 1, 0)],
      { activatedUnitIds: ['p2a'] },
    )
    const decision = decide(state)
    expect(decision?.type).toBe('attack')
    if (decision?.type !== 'attack') return
    expect(decision.attackerId).toBe('p2b')
  })
})
