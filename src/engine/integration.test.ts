import { describe, it, expect } from 'vitest'
import { applyMove } from './move'
import { resolveAttack } from './combat'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'
import { UNIT_RADIUS_IN } from '../domain/unit'
import { FUSIL } from '../data/weapons'

const makeUnit = (id: string, overrides: Partial<Unit> = {}): Unit => ({
  id,
  name: 'Marine',
  playerId: 1,
  position: { x: 0, y: 0 },
  move: 14,
  remainingMove: 14,
  weapon: FUSIL,
  availableWeapons: [FUSIL],
  wounds: 5,
  remainingWounds: 5,
  save: 5,
  ...overrides,
})

const makeState = (...units: Unit[]): GameState => ({
  units: Object.fromEntries(units.map((u) => [u.id, u])),
  walls: [],
  obstacles: [],
  captureZones: [],
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
  gameOver: false,
  scores: { 1: 0, 2: 0 },
})

describe('pipeline mouvement + attaque dans la même phase', () => {
  it('une unité qui se déplace d\'abord peut ensuite attaquer depuis sa nouvelle position', () => {
    // P1 à (0,0), P2 à (30,0) — hors portée du fusil (range 24)
    const p1 = makeUnit('p1', { playerId: 1, position: { x: 0, y: 0 }, move: 14, remainingMove: 14 })
    const p2 = makeUnit('p2', { playerId: 2, position: { x: 30, y: 0 }, remainingWounds: 5, save: 7 })
    const state = makeState(p1, p2)

    // Mouvement vers (10,0) — distance 10 < 14, valide
    const { state: afterMove } = applyMove(state, 'p1', { x: 10, y: 0 }, UNIT_RADIUS_IN)
    // P1 est maintenant à (10,0), P2 à (30,0) : distance 20 < 24 → dans portée
    const { state: afterAttack, events } = resolveAttack(afterMove, 'p1', 'p2', () => 0.99)

    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe('attack-resolved')
    expect(afterAttack.units['p2']?.remainingWounds).toBeLessThan(5)
  })

  it('une unité qui ne se déplace pas assez reste hors de portée et ne peut pas attaquer', () => {
    // P1 à (0,0), P2 à (30,0) — hors portée du fusil (range 24)
    const p1 = makeUnit('p1', { playerId: 1, position: { x: 0, y: 0 }, move: 4, remainingMove: 4 })
    const p2 = makeUnit('p2', { playerId: 2, position: { x: 30, y: 0 } })
    const state = makeState(p1, p2)

    // Mouvement de seulement 4 unités → P1 à (4,0), toujours à 26 de P2 (> 24)
    const { state: afterMove } = applyMove(state, 'p1', { x: 4, y: 0 }, UNIT_RADIUS_IN)
    const { state: afterAttack, events } = resolveAttack(afterMove, 'p1', 'p2', () => 0.99)

    expect(events).toHaveLength(0)
    expect(afterAttack.units['p2']?.remainingWounds).toBe(5)
  })

  it('le remainingMove est consommé après le déplacement, la position est mise à jour pour l\'attaque', () => {
    const p1 = makeUnit('p1', { playerId: 1, position: { x: 0, y: 0 }, move: 14, remainingMove: 14 })
    const p2 = makeUnit('p2', { playerId: 2, position: { x: 10, y: 0 } })
    const state = makeState(p1, p2)

    const { state: afterMove } = applyMove(state, 'p1', { x: 6, y: 0 }, UNIT_RADIUS_IN)

    expect(afterMove.units['p1']?.position).toEqual({ x: 6, y: 0 })
    expect(afterMove.units['p1']?.remainingMove).toBeCloseTo(8)

    const { events } = resolveAttack(afterMove, 'p1', 'p2', () => 0.5)
    expect(events).toHaveLength(1)
  })
})

describe('attaque sur une unité à 0 blessures', () => {
  it('une unité à 0 remainingWounds peut encore être ciblée — les blessures restent à 0', () => {
    const alwaysHit = () => 0.99
    const p1 = makeUnit('p1', { playerId: 1, position: { x: 0, y: 0 } })
    const deadP2 = makeUnit('p2', { playerId: 2, position: { x: 10, y: 0 }, remainingWounds: 0, save: 7 })
    const state = makeState(p1, deadP2)

    const { state: next, events } = resolveAttack(state, 'p1', 'p2', alwaysHit)

    expect(events).toHaveLength(1)
    expect(next.units['p2']?.remainingWounds).toBe(0)
  })
})
