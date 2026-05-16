import type { MapZone } from './map-zone'
import type { Obstacle } from './obstacle'

export const generateObstacles = (
  zones: MapZone[],
  boardWidth: number,
  boardHeight: number,
): Obstacle[] => {
  const walkable: boolean[][] = Array.from({ length: boardHeight }, () =>
    Array.from({ length: boardWidth }, () => false),
  )

  for (const zone of zones) {
    const xEnd = Math.min(zone.x + zone.width, boardWidth)
    const yEnd = Math.min(zone.y + zone.height, boardHeight)
    for (let y = Math.max(zone.y, 0); y < yEnd; y++) {
      for (let x = Math.max(zone.x, 0); x < xEnd; x++) {
        walkable[y]![x] = true
      }
    }
  }

  const visited: boolean[][] = Array.from({ length: boardHeight }, () =>
    Array.from({ length: boardWidth }, () => false),
  )

  const obstacles: Obstacle[] = []

  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      if (walkable[y]![x] || visited[y]![x]) continue

      let w = 0
      while (x + w < boardWidth && !walkable[y]![x + w] && !visited[y]![x + w]) {
        w++
      }

      let h = 1
      while (y + h < boardHeight) {
        let rowFits = true
        for (let dx = 0; dx < w; dx++) {
          if (walkable[y + h]![x + dx] || visited[y + h]![x + dx]) {
            rowFits = false
            break
          }
        }
        if (!rowFits) break
        h++
      }

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          visited[y + dy]![x + dx] = true
        }
      }

      obstacles.push({ x, y, width: w, height: h })
    }
  }

  return obstacles
}
