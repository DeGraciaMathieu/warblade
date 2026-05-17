import { distance, hasLineOfSight } from '../domain/position'
import type { GameState } from '../domain/game-state'
import { losBlockers, solidTerrain } from '../domain/game-state'
import type { Unit, UnitId, Position } from '../domain/unit'
import { UNIT_RADIUS_IN } from '../domain/unit'
import type { Obstacle } from '../domain/obstacle'
import { findPath } from '../engine/pathfinding'

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
    const target = moveToward(unit.position, nearest.position, unit.remainingMove, solidTerrain(state))
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
        hasLineOfSight(unit.position, e.position, losBlockers(state)),
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

function moveAlongPath(path: Position[], maxDist: number): Position {
  // findPath retourne toujours [from] au minimum — path[0] est toujours défini
  if (path.length < 2) return path[0]!

  // N'avance que sur le premier segment : LOS garanti depuis path[0].
  const firstWaypoint = path[1]
  const d = distance(path[0], firstWaypoint)
  if (d <= maxDist) return firstWaypoint

  const ratio = maxDist / d
  return {
    x: path[0].x + (firstWaypoint.x - path[0].x) * ratio,
    y: path[0].y + (firstWaypoint.y - path[0].y) * ratio,
  }
}
