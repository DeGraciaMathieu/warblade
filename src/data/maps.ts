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
  obstacles: obstaclesFromWalls(30, 28, [
    // rangée y=4-5 (original y=2)
    [4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[20,4],[21,4],[22,4],[23,4],[24,4],[25,4],
    [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[20,5],[21,5],[22,5],[23,5],[24,5],[25,5],
    // rangée y=6-7 (original y=3)
    [4,6],[5,6],[24,6],[25,6],
    [4,7],[5,7],[24,7],[25,7],
    // rangée y=8-9 (original y=4)
    [12,8],[13,8],[14,8],[15,8],[16,8],[17,8],
    [12,9],[13,9],[14,9],[15,9],[16,9],[17,9],
    // rangée y=12-13 (original y=6)
    [0,12],[1,12],[2,12],[3,12],[8,12],[9,12],[20,12],[21,12],[26,12],[27,12],[28,12],[29,12],
    [0,13],[1,13],[2,13],[3,13],[8,13],[9,13],[20,13],[21,13],[26,13],[27,13],[28,13],[29,13],
    // rangée y=14-15 (original y=7)
    [0,14],[1,14],[2,14],[3,14],[8,14],[9,14],[20,14],[21,14],[26,14],[27,14],[28,14],[29,14],
    [0,15],[1,15],[2,15],[3,15],[8,15],[9,15],[20,15],[21,15],[26,15],[27,15],[28,15],[29,15],
    // rangée y=18-19 (original y=9)
    [12,18],[13,18],[14,18],[15,18],[16,18],[17,18],
    [12,19],[13,19],[14,19],[15,19],[16,19],[17,19],
    // rangée y=20-21 (original y=10)
    [4,20],[5,20],[24,20],[25,20],
    [4,21],[5,21],[24,21],[25,21],
    // rangée y=22-23 (original y=11)
    [4,22],[5,22],[6,22],[7,22],[8,22],[9,22],[20,22],[21,22],[22,22],[23,22],[24,22],[25,22],
    [4,23],[5,23],[6,23],[7,23],[8,23],[9,23],[20,23],[21,23],[22,23],[23,23],[24,23],[25,23],
  ]),
}
