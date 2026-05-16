import { describe, it, expect } from 'vitest'
import { resolveAttack } from './combat'
import { seededRng } from '../domain/rng'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'
import { FUSIL } from '../data/weapons'

const makeUnit = (id: string, overrides: Partial<Unit> = {}): Unit => ({
  id,
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
  obstacles: [],
  activePlayerId: 1,
  activatedUnitId: null,
})

describe('resolveAttack', () => {
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

  it('retourne state inchangé si la LOS est bloquée par un obstacle', () => {
    const attacker = makeUnit('a', { position: { x: 0, y: 0 } })
    const target = makeUnit('b', { position: { x: 10, y: 0 } })
    const obstacle = { x: 4, y: -2, width: 2, height: 4 }
    const state: GameState = { units: { a: attacker, b: target }, obstacles: [obstacle], activePlayerId: 1, activatedUnitId: null }
    const { state: next, events } = resolveAttack(state, 'a', 'b', seededRng(1))

    expect(next).toEqual(state)
    expect(events).toHaveLength(0)
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
    // 2 attaques, toutes touchent, save impossible → 2 dégâts × 1 = 2
    expect(next.units['b']?.remainingWounds).toBe(3)
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

  it('retourne les jets individuels dans l\'événement', () => {
    // hit rolls: 6 (touche, ≥4), 1 (rate, <4) → 1 touche → 1 save roll
    // save roll: 3 (échoue, <5) → 1 dégât
    const rolls = [0.99, 0.01, 0.4]
    let idx = 0
    const rng = () => rolls[idx++]!
    const attacker = makeUnit('a', {
      position: { x: 0, y: 0 },
      weapon: { ...FUSIL, attacks: 2, toHit: 4 },
    })
    const target = makeUnit('b', { position: { x: 10, y: 0 }, save: 5 })
    const state = makeState(attacker, target)
    const { events } = resolveAttack(state, 'a', 'b', rng)
    const event = events[0]
    expect(event?.type).toBe('attack-resolved')
    if (event?.type === 'attack-resolved') {
      expect(event.hitRolls).toEqual([6, 1])
      expect(event.saveRolls).toEqual([3])
    }
  })

  it('retourne les jets de sauvegarde pour chaque touche', () => {
    const alwaysHit: () => number = () => 0.99 // roll 6 → touche (toHit=4), save échoue (save=5, roll 6 ≥ 5)
    const attacker = makeUnit('a', {
      position: { x: 0, y: 0 },
      weapon: { ...FUSIL, attacks: 2, toHit: 1 },
    })
    const target = makeUnit('b', { position: { x: 10, y: 0 }, save: 5 })
    const state = makeState(attacker, target)
    const { events } = resolveAttack(state, 'a', 'b', alwaysHit)
    const event = events[0]
    if (event?.type === 'attack-resolved') {
      expect(event.hitRolls).toHaveLength(2)
      expect(event.saveRolls).toHaveLength(2)
    }
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
