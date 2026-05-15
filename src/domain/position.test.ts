import { describe, it, expect } from 'vitest'
import { capPosition } from './position'

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
