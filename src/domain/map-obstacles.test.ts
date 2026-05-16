import { describe, it, expect } from 'vitest'
import { generateObstacles } from './map-obstacles'
import type { MapZone } from './map-zone'

describe('generateObstacles', () => {
  it('retourne un obstacle couvrant tout le plateau quand il n y a aucune zone', () => {
    const obstacles = generateObstacles([], 4, 4)

    expect(obstacles).toEqual([{ x: 0, y: 0, width: 4, height: 4 }])
  })

  it('retourne un tableau vide quand la zone couvre tout le plateau', () => {
    const zones: MapZone[] = [{ x: 0, y: 0, width: 4, height: 4, type: 'room' }]

    const obstacles = generateObstacles(zones, 4, 4)

    expect(obstacles).toEqual([])
  })

  it('génère des murs autour d une zone centrée', () => {
    const zones: MapZone[] = [{ x: 1, y: 1, width: 2, height: 2, type: 'room' }]

    const obstacles = generateObstacles(zones, 4, 4)

    const totalWallArea = obstacles.reduce((sum, o) => sum + o.width * o.height, 0)
    expect(totalWallArea).toBe(12) // 16 total - 4 walkable = 12

    for (const obs of obstacles) {
      for (let dy = 0; dy < obs.height; dy++) {
        for (let dx = 0; dx < obs.width; dx++) {
          const cx = obs.x + dx
          const cy = obs.y + dy
          const insideZone = cx >= 1 && cx < 3 && cy >= 1 && cy < 3
          expect(insideZone).toBe(false)
        }
      }
    }
  })

  it('fusionne les cellules non marchables en rectangles', () => {
    const zones: MapZone[] = [{ x: 1, y: 1, width: 2, height: 2, type: 'room' }]

    const obstacles = generateObstacles(zones, 4, 4)

    expect(obstacles.length).toBeLessThan(12)
  })

  it('gère deux zones connectées par un couloir', () => {
    const zones: MapZone[] = [
      { x: 0, y: 0, width: 2, height: 2, type: 'room' },
      { x: 4, y: 0, width: 2, height: 2, type: 'room' },
      { x: 2, y: 0, width: 2, height: 1, type: 'corridor' },
    ]

    const obstacles = generateObstacles(zones, 6, 3)

    const totalWallArea = obstacles.reduce((sum, o) => sum + o.width * o.height, 0)
    const walkableArea = 2 * 2 + 2 * 2 + 2 * 1
    expect(totalWallArea).toBe(6 * 3 - walkableArea)
  })

  it('les bords du plateau sont des murs quand aucune zone ne les couvre', () => {
    const zones: MapZone[] = [{ x: 1, y: 1, width: 1, height: 1, type: 'room' }]

    const obstacles = generateObstacles(zones, 3, 3)

    const wallCells = new Set<string>()
    for (const obs of obstacles) {
      for (let dy = 0; dy < obs.height; dy++) {
        for (let dx = 0; dx < obs.width; dx++) {
          wallCells.add(`${obs.x + dx},${obs.y + dy}`)
        }
      }
    }

    for (let x = 0; x < 3; x++) {
      expect(wallCells.has(`${x},0`)).toBe(true)
      expect(wallCells.has(`${x},2`)).toBe(true)
    }
    for (let y = 0; y < 3; y++) {
      expect(wallCells.has(`0,${y}`)).toBe(true)
      expect(wallCells.has(`2,${y}`)).toBe(true)
    }
  })

  it('traite room et corridor de la même manière pour la marchabilité', () => {
    const roomOnly: MapZone[] = [{ x: 0, y: 0, width: 3, height: 3, type: 'room' }]
    const corridorOnly: MapZone[] = [{ x: 0, y: 0, width: 3, height: 3, type: 'corridor' }]

    const obstaclesRoom = generateObstacles(roomOnly, 3, 3)
    const obstaclesCorridor = generateObstacles(corridorOnly, 3, 3)

    expect(obstaclesRoom).toEqual(obstaclesCorridor)
  })
})
