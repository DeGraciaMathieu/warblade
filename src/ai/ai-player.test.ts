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
    walls: [],
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

  it('continue de se déplacer quand le mouvement restant est non nul', () => {
    const state = makeState(
      [makeUnit('p1', 1, 30, 0), makeUnit('p2', 2, 0, 0, { remainingMove: 2.4 })],
      { activatedUnitId: 'p2' },
    )
    expect(decide(state)?.type).toBe('move')
  })

  it('termine le tour quand le mouvement restant est épuisé', () => {
    const state = makeState(
      [makeUnit('p1', 1, 30, 0), makeUnit('p2', 2, 0, 0, { remainingMove: 0 })],
      { activatedUnitId: 'p2' },
    )
    expect(decide(state)).toEqual({ type: 'end-turn' })
  })

  it('ne attaque pas quand un mur bloque la LOS', () => {
    const wall: Obstacle = { x: 2, y: -1, width: 1, height: 3 }
    const state = makeState(
      [makeUnit('p1', 1, 5, 0), makeUnit('p2', 2, 0, 0)],
      { walls: [wall] },
    )
    const decision = decide(state)
    expect(decision?.type).toBe('move')
  })

  it('contourne un obstacle qui bloque le chemin direct', () => {
    // Mur vertical entre l'IA (0,0) et l'ennemi (20,0), bloquant y ∈ [-2, 2]
    const wall: Obstacle = { x: 3, y: -2, width: 1, height: 4 }
    const state = makeState(
      [makeUnit('p1', 1, 20, 0), makeUnit('p2', 2, 0, 0)],
      { obstacles: [wall] },
    )
    const decision = decide(state)
    expect(decision?.type).toBe('move')
    if (decision?.type !== 'move') return
    // L'IA doit avancer vers l'ennemi
    expect(decision.target.x).toBeGreaterThan(0)
    // Le chemin direct est bloqué : l'IA doit dévier de y=0
    expect(Math.abs(decision.target.y)).toBeGreaterThan(1)
  })

  it('ne dépasse pas sa distance de mouvement en contournant', () => {
    const wall: Obstacle = { x: 3, y: -2, width: 1, height: 4 }
    const state = makeState(
      [makeUnit('p1', 1, 20, 0), makeUnit('p2', 2, 0, 0)],
      { obstacles: [wall] },
    )
    const decision = decide(state)
    if (decision?.type !== 'move') return
    const from = { x: 0, y: 0 }
    const traveledX = decision.target.x - from.x
    const traveledY = decision.target.y - from.y
    const straightLineDist = Math.sqrt(traveledX ** 2 + traveledY ** 2)
    // La distance en ligne droite ne peut pas dépasser le budget de mouvement
    expect(straightLineDist).toBeLessThanOrEqual(6 + 0.01)
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
