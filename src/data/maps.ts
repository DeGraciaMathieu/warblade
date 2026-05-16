import type { Obstacle } from '../domain/obstacle'
import type { MapZone } from '../domain/map-zone'

export type MapData = {
  zones: MapZone[]
  obstacles: Obstacle[]
}

function obstaclesFromWalls(
  width: number,
  height: number,
  walls: [number, number][],
): Obstacle[] {
  const wallSet = new Set(walls.map(([x, y]) => `${x},${y}`))
  const walkable: boolean[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => !wallSet.has(`${x},${y}`)),
  )
  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  )
  const obstacles: Obstacle[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (walkable[y]![x] || visited[y]![x]) continue
      let w = 0
      while (x + w < width && !walkable[y]![x + w] && !visited[y]![x + w]) w++
      let h = 1
      while (y + h < height) {
        let fits = true
        for (let dx = 0; dx < w; dx++) {
          if (walkable[y + h]![x + dx] || visited[y + h]![x + dx]) { fits = false; break }
        }
        if (!fits) break
        h++
      }
      for (let dy = 0; dy < h; dy++)
        for (let dx = 0; dx < w; dx++)
          visited[y + dy]![x + dx] = true
      obstacles.push({ x, y, width: w, height: h })
    }
  }
  return obstacles
}

export const LABYRINTH_MAP: MapData = {
  zones: [],
  obstacles: obstaclesFromWalls(40, 36, [
    // barrières horizontales hautes (y=5-6)
    [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
    [28,5],[29,5],[30,5],[31,5],[32,5],[33,5],[34,5],[35,5],
    [4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
    [28,6],[29,6],[30,6],[31,6],[32,6],[33,6],[34,6],[35,6],
    // murs latéraux hauts (y=7-9)
    [4,7],[5,7],[34,7],[35,7],
    [4,8],[5,8],[34,8],[35,8],
    [4,9],[5,9],[34,9],[35,9],
    // obstacle central haut (y=11-12)
    [15,11],[16,11],[17,11],[18,11],[19,11],[20,11],[21,11],[22,11],[23,11],[24,11],
    [15,12],[16,12],[17,12],[18,12],[19,12],[20,12],[21,12],[22,12],[23,12],[24,12],
    // barrière médiane (y=16-18)
    [0,16],[1,16],[2,16],[3,16],[4,16],
    [11,16],[12,16],[13,16],
    [19,16],[20,16],
    [26,16],[27,16],[28,16],
    [35,16],[36,16],[37,16],[38,16],[39,16],
    [0,17],[1,17],[2,17],[3,17],[4,17],
    [11,17],[12,17],[13,17],
    [19,17],[20,17],
    [26,17],[27,17],[28,17],
    [35,17],[36,17],[37,17],[38,17],[39,17],
    [0,18],[1,18],[2,18],[3,18],[4,18],
    [11,18],[12,18],[13,18],
    [19,18],[20,18],
    [26,18],[27,18],[28,18],
    [35,18],[36,18],[37,18],[38,18],[39,18],
    // obstacle central bas (y=23-24)
    [15,23],[16,23],[17,23],[18,23],[19,23],[20,23],[21,23],[22,23],[23,23],[24,23],
    [15,24],[16,24],[17,24],[18,24],[19,24],[20,24],[21,24],[22,24],[23,24],[24,24],
    // murs latéraux bas (y=26-28)
    [4,26],[5,26],[34,26],[35,26],
    [4,27],[5,27],[34,27],[35,27],
    [4,28],[5,28],[34,28],[35,28],
    // barrières horizontales basses (y=29-30)
    [4,29],[5,29],[6,29],[7,29],[8,29],[9,29],[10,29],[11,29],
    [28,29],[29,29],[30,29],[31,29],[32,29],[33,29],[34,29],[35,29],
    [4,30],[5,30],[6,30],[7,30],[8,30],[9,30],[10,30],[11,30],
    [28,30],[29,30],[30,30],[31,30],[32,30],[33,30],[34,30],[35,30],
  ]),
}
