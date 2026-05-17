import { distance, hasLineOfSight } from '../domain/position'
import type { Position } from '../domain/unit'
import type { Obstacle } from '../domain/obstacle'

const CORNER_MARGIN_IN = 0.05

function cornerNodes(obs: Obstacle, radius: number): Position[] {
  const m = radius + CORNER_MARGIN_IN
  return [
    { x: obs.x - m, y: obs.y - m },
    { x: obs.x + obs.width + m, y: obs.y - m },
    { x: obs.x - m, y: obs.y + obs.height + m },
    { x: obs.x + obs.width + m, y: obs.y + obs.height + m },
  ]
}

export function findPath(
  from: Position,
  to: Position,
  obstacles: Obstacle[],
  unitRadius: number,
): Position[] {
  const expanded = obstacles.map((obs) => ({
    x: obs.x - unitRadius,
    y: obs.y - unitRadius,
    width: obs.width + unitRadius * 2,
    height: obs.height + unitRadius * 2,
  }))

  if (hasLineOfSight(from, to, expanded)) {
    return [from, to]
  }

  const nodes: Position[] = [
    from,
    to,
    ...obstacles.flatMap((obs) => cornerNodes(obs, unitRadius)),
  ]
  const n = nodes.length
  const dist = new Array<number>(n).fill(Infinity)
  const prev = new Array<number>(n).fill(-1)
  dist[0] = 0
  const visited = new Set<number>()

  for (;;) {
    let u = -1
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && (u === -1 || dist[j]! < dist[u]!)) u = j
    }
    if (u === -1 || dist[u] === Infinity) break
    visited.add(u)
    if (u === 1) break

    for (let v = 0; v < n; v++) {
      if (visited.has(v)) continue
      if (!hasLineOfSight(nodes[u]!, nodes[v]!, expanded)) continue
      const d = dist[u]! + distance(nodes[u]!, nodes[v]!)
      if (d < dist[v]!) {
        dist[v] = d
        prev[v] = u
      }
    }
  }

  if (dist[1] === Infinity) return [from]

  const path: Position[] = []
  let cur = 1
  while (cur !== -1) {
    path.unshift(nodes[cur]!)
    cur = prev[cur]!
  }
  return path
}

export function pathLength(path: Position[]): number {
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += distance(path[i - 1]!, path[i]!)
  }
  return total
}

export function truncatePath(path: Position[], maxDist: number): Position[] {
  if (path.length <= 1) return path.slice()

  let remaining = maxDist
  const result: Position[] = [path[0]!]

  for (let i = 1; i < path.length; i++) {
    if (remaining === 0) break
    const segLen = distance(path[i - 1]!, path[i]!)
    if (segLen <= remaining) {
      result.push(path[i]!)
      remaining -= segLen
      if (remaining === 0) break
    } else {
      const ratio = remaining / segLen
      result.push({
        x: path[i - 1]!.x + (path[i]!.x - path[i - 1]!.x) * ratio,
        y: path[i - 1]!.y + (path[i]!.y - path[i - 1]!.y) * ratio,
      })
      break
    }
  }

  return result
}
