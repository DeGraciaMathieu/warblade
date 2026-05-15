import { describe, it, expect } from 'vitest'
import { capPosition, resolveTarget } from './position'
import type { Obstacle } from './obstacle'

describe('capPosition', () => {
  it('retourne rawTarget si la distance est dans la portée', () => {
    const from = { x: 0, y: 0 }
    const raw = { x: 3, y: 4 }   // distance = 5
    expect(capPosition(from, raw, 5)).toEqual({ x: 3, y: 4 })
  })

  it('cappe rawTarget à maxDist dans la même direction', () => {
    const from = { x: 0, y: 0 }
    const raw = { x: 6, y: 8 }   // distance = 10, maxDist = 5
    const result = capPosition(from, raw, 5)
    expect(result.x).toBeCloseTo(3)
    expect(result.y).toBeCloseTo(4)
  })

  it('retourne from si rawTarget === from', () => {
    const from = { x: 5, y: 5 }
    expect(capPosition(from, { x: 5, y: 5 }, 6)).toEqual({ x: 5, y: 5 })
  })
})

describe('resolveTarget', () => {
  const none: Obstacle[] = []

  it('sans obstacle, retourne rawTarget si dans la portée', () => {
    const from = { x: 0, y: 0 }
    expect(resolveTarget(from, { x: 3, y: 4 }, 5, none)).toEqual({ x: 3, y: 4 })
  })

  it('sans obstacle, cappe à maxDist', () => {
    const from = { x: 0, y: 0 }
    const result = resolveTarget(from, { x: 6, y: 8 }, 5, none)
    expect(result.x).toBeCloseTo(3)
    expect(result.y).toBeCloseTo(4)
  })

  it('obstacle hors de la trajectoire, ignore l\'obstacle', () => {
    const from = { x: 0, y: 10 }
    const obs: Obstacle = { x: 5, y: 0, width: 5, height: 5 }
    expect(resolveTarget(from, { x: 20, y: 10 }, 30, [obs])).toEqual({ x: 20, y: 10 })
  })

  it('obstacle sur la trajectoire, stoppe au bord d\'entrée', () => {
    const from = { x: 0, y: 10 }
    const obs: Obstacle = { x: 15, y: 8, width: 10, height: 4 }
    const result = resolveTarget(from, { x: 30, y: 10 }, 40, [obs])
    expect(result.x).toBeCloseTo(15)
    expect(result.y).toBeCloseTo(10)
  })

  it('deux obstacles sur la trajectoire, stoppe au plus proche', () => {
    const from = { x: 0, y: 10 }
    const obs1: Obstacle = { x: 20, y: 8, width: 5, height: 4 }
    const obs2: Obstacle = { x: 10, y: 8, width: 5, height: 4 }
    const result = resolveTarget(from, { x: 40, y: 10 }, 50, [obs1, obs2])
    expect(result.x).toBeCloseTo(10)
    expect(result.y).toBeCloseTo(10)
  })

  it('cible dans la portée mais derrière un obstacle, stoppe au bord', () => {
    const from = { x: 0, y: 10 }
    const obs: Obstacle = { x: 5, y: 8, width: 4, height: 4 }
    const result = resolveTarget(from, { x: 12, y: 10 }, 20, [obs])
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(10)
  })
})
