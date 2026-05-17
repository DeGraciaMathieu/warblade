import { describe, it, expect } from 'vitest'
import { findPath, truncatePath } from './pathfinding'

describe('calcul du chemin contournant les obstacles', () => {
  it('retourne un chemin direct si aucun obstacle ne bloque le trajet', () => {
    const path = findPath({ x: 0, y: 0 }, { x: 5, y: 0 }, [], 0.5)
    expect(path).toEqual([{ x: 0, y: 0 }, { x: 5, y: 0 }])
  })

  it('contourne un obstacle en passant par un coin', () => {
    // Unité à gauche, destination à droite, mur vertical au milieu
    const path = findPath(
      { x: 0, y: 5 },
      { x: 10, y: 5 },
      [{ x: 4, y: 2, width: 2, height: 6 }],
      0.5,
    )
    expect(path.length).toBeGreaterThan(2)
    expect(path[0]).toEqual({ x: 0, y: 5 })
    expect(path[path.length - 1]).toEqual({ x: 10, y: 5 })
  })

  it('retourne [from] si la destination est entièrement inaccessible', () => {
    const from = { x: 5, y: 5 }
    // La destination {10,10} est enfermée dans un obstacle {8,8,4,4}
    const path = findPath(from, { x: 10, y: 10 }, [{ x: 8, y: 8, width: 4, height: 4 }], 0.5)
    expect(path).toEqual([from])
  })
})

describe('troncature du chemin à une distance max', () => {
  it('retourne le chemin complet si maxDist couvre toute la longueur', () => {
    const path = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }]
    expect(truncatePath(path, 10)).toEqual(path)
  })

  it('tronque au milieu d\'un segment', () => {
    const path = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }]
    const result = truncatePath(path, 7)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ x: 0, y: 0 })
    expect(result[1]).toEqual({ x: 5, y: 0 })
    expect(result[2]).toEqual({ x: 7, y: 0 })
  })

  it('s\'arrête exactement à un waypoint intermédiaire', () => {
    const path = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }]
    expect(truncatePath(path, 5)).toEqual([{ x: 0, y: 0 }, { x: 5, y: 0 }])
  })

  it('retourne juste le point de départ si maxDist est 0', () => {
    const path = [{ x: 0, y: 0 }, { x: 5, y: 0 }]
    expect(truncatePath(path, 0)).toEqual([{ x: 0, y: 0 }])
  })

  it('retourne le chemin d\'un seul point sans erreur', () => {
    expect(truncatePath([{ x: 3, y: 3 }], 5)).toEqual([{ x: 3, y: 3 }])
  })
})
