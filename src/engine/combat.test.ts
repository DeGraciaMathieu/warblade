import { describe, it, expect } from 'vitest'
import { resolveAttack } from './combat'
import { seededRng } from '../domain/rng'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'
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
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
})

describe('résolution d\'une attaque', () => {
  it('retourne state inchangé si l\'attaquant est inconnu', () => {
    const state = makeState(makeUnit('b'))
    const { state: next, events } = resolveAttack(state, 'unknown', 'b', seededRng(1))
    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
  })

  it('retourne state inchangé si la cible est inconnue', () => {
    const state = makeState(makeUnit('a'))
    const { state: next, events } = resolveAttack(state, 'a', 'unknown', seededRng(1))
    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
  })

  it('retourne state inchangé si la LOS est bloquée par un mur', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    const wall = { x: 4, y: -2, width: 2, height: 4 }
    const state: GameState = { units: { a: attacker, b: target }, walls: [wall], obstacles: [], activePlayerId: 1, activatedUnitId: null }
    const { state: next, events } = resolveAttack(state, 'a', 'b', seededRng(1))

    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
  })

  it('la LOS n\'est pas bloquée par un obstacle', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    const obstacle = { x: 4, y: -2, width: 2, height: 4 }
    const state: GameState = { units: { a: attacker, b: target }, walls: [], obstacles: [obstacle], activePlayerId: 1, activatedUnitId: null }
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))

    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe('attack-resolved')
  })

  it('la LOS est bloquée par une unité ennemie interposée', () => {
    const attacker = makeUnit('a', { playerId: 1, position: { x: 0, y: 0 } })
    const blocker = makeUnit('c', { playerId: 2, position: { x: 10, y: 0 } })
    const target = makeUnit('b', { playerId: 2, position: { x: 20, y: 0 } })
    const state = makeState(attacker, blocker, target)
    const { state: next, events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
  })

  it('la LOS n\'est pas bloquée par une unité alliée interposée', () => {
    const attacker = makeUnit('a', { playerId: 1, position: { x: 0, y: 0 } })
    const ally = makeUnit('c', { playerId: 1, position: { x: 10, y: 0 } })
    const target = makeUnit('b', { playerId: 2, position: { x: 20, y: 0 } })
    const state = makeState(attacker, ally, target)
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe('attack-resolved')
  })

  it('retourne state inchangé si la cible est hors de portée', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 30, y: 0 } })
    const state = makeState(attacker, target)
    const { state: next, events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
  })

  it('émet un événement attack-resolved quand l\'attaque est résolue', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    const state = makeState(attacker, target)
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(events).toHaveLength(1)
    expect(events[0]?.type).toBe('attack-resolved')
  })

  it('les dégâts non sauvegardés réduisent les remainingWounds de la cible', () => {
    // rng seedé contrôlé : on force tous les jets à réussir (toHit=4, save=5)
    const alwaysHit: () => number = () => 0.99 // ≥ 4/6 et ≥ 5/6 → touche, pas de save
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 }, wounds: 5, remainingWounds: 5, save: 7 }) // save impossible
    const state = makeState(attacker, target)
    const { state: next } = resolveAttack(state, 'a', 'b', alwaysHit)
    // 3 attaques, toutes touchent, save impossible → 3 dégâts × 1 = 3
    expect(next.units['b']?.remainingWounds).toBe(2)
  })

  it('les sauvegardes réussies annulent les dégâts', () => {
    const alwaysSave: () => number = () => 0.01 // touche échoue (< 4/6) ET save réussit toujours
    const attacker = makeUnit('a', {
      position: { x: 0, y: 0 },
      weapon: { ...FUSIL, toHit: 1 }, // touche toujours
    })
    const target = makeUnit('b', { position: { x: 10, y: 0 }, wounds: 5, remainingWounds: 5, save: 1 })
    const state = makeState(attacker, target)
    const { state: next } = resolveAttack(state, 'a', 'b', alwaysSave)
    expect(next.units['b']?.remainingWounds).toBe(5)
  })

  it('expose inCover false quand la cible est entièrement visible', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    const state = makeState(attacker, target)
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(events[0]).toMatchObject({ type: 'attack-resolved', inCover: false })
  })

  it('expose inCover true quand un obstacle bloque un bord de la cible', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    // Obstacle bloque le bord nord de la cible mais pas son centre → LOS passe, couvert actif
    const obstacle = { x: 9, y: -2, width: 2, height: 1.5 }
    const state: GameState = { ...makeState(attacker, target), obstacles: [obstacle] }
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(events[0]).toMatchObject({ type: 'attack-resolved', inCover: true })
  })

  it('expose inCover true quand un mur bloque un bord de la cible', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    // Mur bloque le bord nord de la cible mais pas son centre → LOS passe, couvert actif
    const wall = { x: 9, y: -2, width: 2, height: 1.5 }
    const state: GameState = { ...makeState(attacker, target), walls: [wall] }
    const { events } = resolveAttack(state, 'a', 'b', seededRng(1))
    expect(events[0]).toMatchObject({ type: 'attack-resolved', inCover: true })
  })

  it('remainingWounds ne descend pas en dessous de 0', () => {
    const alwaysHit: () => number = () => 0.99
    const attacker = makeUnit('a', {
      position: { x: 0, y: 0 },
      weapon: { ...FUSIL, attacks: 10, damage: 3 },
    })
    const target = makeUnit('b', { position: { x: 10, y: 0 }, wounds: 5, remainingWounds: 2, save: 7 })
    const state = makeState(attacker, target)
    const { state: next } = resolveAttack(state, 'a', 'b', alwaysHit)
    expect(next.units['b']?.remainingWounds).toBe(0)
  })
})
