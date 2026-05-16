import { distance, hasLineOfSight } from '../domain/position'
import type { GameState } from '../domain/game-state'
import type { Unit, UnitId, Position } from '../domain/unit'
import { UNIT_RADIUS_IN } from '../domain/unit'
import type { Obstacle } from '../domain/obstacle'

const CORNER_MARGIN_IN = 0.05   // marge supplémentaire autour du rayon pour les coins du visibility graph
const STUCK_THRESHOLD_IN = 0.01 // distance minimale en pouces considérée comme un progrès réel

export type AiDecision =
  | { type: 'move'; unitId: UnitId; target: Position }
  | { type: 'attack'; attackerId: UnitId; targetPosition: Position }
  | { type: 'end-turn' }

export function decide(state: GameState): AiDecision | null {
  if (state.activePlayerId !== 2) return null

  const unit = getUnitToAct(state)
  if (unit === null) return null

  const enemies = Object.values(state.units).filter(
    (u) => u.playerId === 1 && u.remainingWounds > 0,
  )
  if (enemies.length === 0) return null

  const attackTarget = findAttackTarget(unit, enemies, state)
  if (attackTarget !== null) {
    return { type: 'attack', attackerId: unit.id, targetPosition: attackTarget.position }
  }

  if (unit.remainingMove > 0) {
    const nearest = nearestUnit(unit.position, enemies)
    const target = moveToward(unit.position, nearest.position, unit.remainingMove, state.obstacles)
    if (distance(unit.position, target) < STUCK_THRESHOLD_IN) return { type: 'end-turn' }
    return { type: 'move', unitId: unit.id, target }
  }

  return { type: 'end-turn' }
}

function getUnitToAct(state: GameState): Unit | null {
  if (state.activatedUnitId !== null) {
    return state.units[state.activatedUnitId] ?? null
  }
  return (
    Object.values(state.units).find(
      (u) => u.playerId === 2 && !state.activatedUnitIds.includes(u.id),
    ) ?? null
  )
}

function findAttackTarget(unit: Unit, enemies: Unit[], state: GameState): Unit | null {
  return (
    enemies.find(
      (e) =>
        distance(unit.position, e.position) <= unit.weapon.range &&
        hasLineOfSight(unit.position, e.position, state.obstacles),
    ) ?? null
  )
}

function nearestUnit(from: Position, units: Unit[]): Unit {
  return units.reduce((nearest, u) =>
    distance(from, u.position) < distance(from, nearest.position) ? u : nearest,
  )
}

function moveToward(
  from: Position,
  to: Position,
  maxDist: number,
  obstacles: Obstacle[],
): Position {
  const path = findPath(from, to, obstacles, UNIT_RADIUS_IN)
  return moveAlongPath(path, maxDist)
}

function cornerNodes(obs: Obstacle, radius: number): Position[] {
  const m = radius + CORNER_MARGIN_IN
  return [
    { x: obs.x - m, y: obs.y - m },
    { x: obs.x + obs.width + m, y: obs.y - m },
    { x: obs.x - m, y: obs.y + obs.height + m },
    { x: obs.x + obs.width + m, y: obs.y + obs.height + m },
  ]
}

function findPath(
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
      if (!visited.has(j) && (u === -1 || dist[j] < dist[u])) u = j
    }
    if (u === -1 || dist[u] === Infinity) break
    visited.add(u)
    if (u === 1) break

    for (let v = 0; v < n; v++) {
      if (visited.has(v)) continue
      if (!hasLineOfSight(nodes[u], nodes[v], expanded)) continue
      const d = dist[u] + distance(nodes[u], nodes[v])
      if (d < dist[v]) {
        dist[v] = d
        prev[v] = u
      }
    }
  }

  if (dist[1] === Infinity) return [from]

  const path: Position[] = []
  let cur = 1
  while (cur !== -1) {
    path.unshift(nodes[cur])
    cur = prev[cur]
  }
  return path
}

function moveAlongPath(path: Position[], maxDist: number): Position {
  // findPath retourne toujours [from] au minimum — path[0] est toujours défini
  if (path.length < 2) return path[0]!

  // N'avance que sur le premier segment : LOS garanti depuis path[0].
  // La vue applique resolveTarget en ligne droite ; traverser plusieurs segments
  // retournerait une cible de l'autre côté d'un obstacle, bloquée par resolveTarget.
  const firstWaypoint = path[1]
  const d = distance(path[0], firstWaypoint)
  if (d <= maxDist) return firstWaypoint

  const ratio = maxDist / d
  return {
    x: path[0].x + (firstWaypoint.x - path[0].x) * ratio,
    y: path[0].y + (firstWaypoint.y - path[0].y) * ratio,
  }
}
