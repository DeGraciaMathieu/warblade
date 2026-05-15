import type { Position } from './unit'

export const capPosition = (from: Position, rawTarget: Position, maxDist: number): Position => {
  const dx = rawTarget.x - from.x
  const dy = rawTarget.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return from
  if (dist <= maxDist) return rawTarget

  const ratio = maxDist / dist
  return { x: from.x + dx * ratio, y: from.y + dy * ratio }
}
