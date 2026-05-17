import { describe, it, expect } from 'vitest'
import { controlledBy } from './capture-zone'
import type { CaptureZone } from './capture-zone'
import type { Unit } from './unit'

const makeUnit = (id: string, playerId: 1 | 2, position: { x: number; y: number }): Unit => ({
  id,
  name: 'Marine',
  emoji: '⚔️',
  playerId,
  position,
  move: 6,
  remainingMove: 6,
  weapon: { name: 'gun', range: 12, attacks: 1, toHit: 4, damage: 1 },
  availableWeapons: [],
  wounds: 1,
  remainingWounds: 1,
  save: 4,
})

const zone: CaptureZone = { tiles: [{ x: 5, y: 5 }] }

describe('contrôle d\'une zone de capture', () => {
  it('le joueur 1 contrôle la zone s\'il est le seul dessus', () => {
    const units = [makeUnit('a', 1, { x: 5.5, y: 5.5 })]
    expect(controlledBy(zone, units)).toBe(1)
  })

  it('le joueur 2 contrôle la zone s\'il est le seul dessus', () => {
    const units = [makeUnit('a', 2, { x: 5.5, y: 5.5 })]
    expect(controlledBy(zone, units)).toBe(2)
  })

  it('retourne null si aucune unité n\'est sur la zone', () => {
    expect(controlledBy(zone, [])).toBeNull()
  })

  it('retourne null si les deux joueurs ont autant d\'unités sur la zone', () => {
    const units = [
      makeUnit('a', 1, { x: 5.5, y: 5.5 }),
      makeUnit('b', 2, { x: 5.2, y: 5.2 }),
    ]
    expect(controlledBy(zone, units)).toBeNull()
  })

  it('le joueur avec le plus d\'unités contrôle la zone', () => {
    const units = [
      makeUnit('a', 1, { x: 5.5, y: 5.5 }),
      makeUnit('b', 1, { x: 5.2, y: 5.2 }),
      makeUnit('c', 2, { x: 5.8, y: 5.8 }),
    ]
    expect(controlledBy(zone, units)).toBe(1)
  })

  it('une unité hors de la zone ne compte pas', () => {
    const units = [
      makeUnit('a', 1, { x: 3.5, y: 5.5 }),
      makeUnit('b', 2, { x: 5.5, y: 5.5 }),
    ]
    expect(controlledBy(zone, units)).toBe(2)
  })

  it('une zone multi-tuiles agrège toutes ses tuiles', () => {
    const multiZone: CaptureZone = { tiles: [{ x: 5, y: 5 }, { x: 6, y: 5 }] }
    const units = [
      makeUnit('a', 1, { x: 5.5, y: 5.5 }),
      makeUnit('b', 1, { x: 6.5, y: 5.5 }),
      makeUnit('c', 2, { x: 6.2, y: 5.2 }),
    ]
    expect(controlledBy(multiZone, units)).toBe(1)
  })
})
