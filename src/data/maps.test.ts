import { describe, it, expect } from 'vitest'
import { ingestMap } from './maps'

describe('ingestion d une map JSON', () => {
  it('convertit les walls en rectangles dans MapData.walls', () => {
    const map = ingestMap({ width: 4, height: 1, walls: [[0, 0], [1, 0], [2, 0], [3, 0]], zones: [], obstacles: [] })

    expect(map.walls).toEqual([{ x: 0, y: 0, width: 4, height: 1 }])
    expect(map.obstacles).toEqual([])
  })

  it('convertit les obstacles JSON en rectangles dans MapData.obstacles', () => {
    const map = ingestMap({ width: 4, height: 1, walls: [], zones: [], obstacles: [[0, 0], [1, 0], [2, 0], [3, 0]] })

    expect(map.obstacles).toEqual([{ x: 0, y: 0, width: 4, height: 1 }])
    expect(map.walls).toEqual([])
  })

  it('garde walls et obstacles séparés', () => {
    const map = ingestMap({ width: 3, height: 2, walls: [[0, 0]], zones: [], obstacles: [[2, 1]] })

    expect(map.walls).toEqual([{ x: 0, y: 0, width: 1, height: 1 }])
    expect(map.obstacles).toEqual([{ x: 2, y: 1, width: 1, height: 1 }])
  })

  it('retourne walls et obstacles vides quand les deux sont vides', () => {
    const map = ingestMap({ width: 4, height: 4, walls: [], zones: [], obstacles: [] })

    expect(map.walls).toEqual([])
    expect(map.obstacles).toEqual([])
  })

  it('convertit les zones en une CaptureZone contenant toutes les tuiles', () => {
    const map = ingestMap({ width: 4, height: 4, walls: [], zones: [[1, 1], [2, 1]], obstacles: [] })

    expect(map.captureZones).toHaveLength(1)
    expect(map.captureZones[0]?.tiles).toEqual([{ x: 1, y: 1 }, { x: 2, y: 1 }])
  })

  it('retourne captureZones vide si zones est vide', () => {
    const map = ingestMap({ width: 4, height: 4, walls: [], zones: [], obstacles: [] })

    expect(map.captureZones).toEqual([])
  })
})
