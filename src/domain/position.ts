import type { Position } from './unit'
import type { Obstacle } from './obstacle'

export const distance = (a: Position, b: Position): number =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

export const capPosition = (from: Position, rawTarget: Position, maxDist: number): Position => {
  const dx = rawTarget.x - from.x
  const dy = rawTarget.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return from
  if (dist <= maxDist) return rawTarget

  const ratio = maxDist / dist
  return { x: from.x + dx * ratio, y: from.y + dy * ratio }
}

const slabEntry = (from: Position, to: Position, obs: Obstacle): number | null => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  let tEnter = 0
  let tExit = 1

  if (dx === 0) {
    if (from.x < obs.x || from.x > obs.x + obs.width) return null
  } else {
    const t1 = (obs.x - from.x) / dx
    const t2 = (obs.x + obs.width - from.x) / dx
    tEnter = Math.max(tEnter, Math.min(t1, t2))
    tExit = Math.min(tExit, Math.max(t1, t2))
  }

  if (dy === 0) {
    if (from.y < obs.y || from.y > obs.y + obs.height) return null
  } else {
    const t1 = (obs.y - from.y) / dy
    const t2 = (obs.y + obs.height - from.y) / dy
    tEnter = Math.max(tEnter, Math.min(t1, t2))
    tExit = Math.min(tExit, Math.max(t1, t2))
  }

  if (tEnter >= tExit || tEnter < 0) return null
  return tEnter
}

export const hasLineOfSight = (from: Position, to: Position, obstacles: Obstacle[]): boolean => {
  for (const obs of obstacles) {
    const t = slabEntry(from, to, obs)
    if (t !== null && t > 1e-6) return false
  }
  return true
}

export const resolveTarget = (
  from: Position,
  rawTarget: Position,
  maxDist: number,
  obstacles: Obstacle[],
  unitRadius: number,
): Position => {
  const capped = capPosition(from, rawTarget, maxDist)

  let tMin = 1
  for (const obs of obstacles) {
    const expanded: Obstacle = {
      x: obs.x - unitRadius,
      y: obs.y - unitRadius,
      width: obs.width + unitRadius * 2,
      height: obs.height + unitRadius * 2,
    }
    const t = slabEntry(from, capped, expanded)
    if (t !== null && t < tMin) tMin = t
  }

  if (tMin === 1) return capped

  const dx = capped.x - from.x
  const dy = capped.y - from.y
  return { x: from.x + dx * tMin, y: from.y + dy * tMin }
}
