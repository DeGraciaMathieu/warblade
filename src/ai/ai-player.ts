import { distance, hasLineOfSight } from '../domain/position'
import type { GameState } from '../domain/game-state'
import type { Unit, UnitId, Position } from '../domain/unit'

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

  if (state.activatedUnitId === null) {
    const nearest = nearestUnit(unit.position, enemies)
    const target = moveToward(unit.position, nearest.position, unit.remainingMove)
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

function moveToward(from: Position, to: Position, maxDist: number): Position {
  const d = distance(from, to)
  if (d === 0) return from
  const ratio = Math.min(maxDist, d) / d
  return {
    x: Math.round(from.x + (to.x - from.x) * ratio),
    y: Math.round(from.y + (to.y - from.y) * ratio),
  }
}
