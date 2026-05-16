import type { GameState } from '../domain/game-state'
import { losBlockers, solidTerrain } from '../domain/game-state'
import type { GameEvent, AttackResolvedEvent } from '../domain/game-event'
import type { UnitId } from '../domain/unit'
import type { Obstacle } from '../domain/obstacle'
import type { Rng } from '../domain/rng'
import { UNIT_RADIUS_IN } from '../domain/unit'
import { distance, hasLineOfSight, isInCover } from '../domain/position'

type Resolution = {
  state: GameState
  events: GameEvent[]
}

const roll = (rng: Rng): number => Math.floor(rng() * 6) + 1

export const resolveAttack = (
  state: GameState,
  attackerId: UnitId,
  targetId: UnitId,
  rng: Rng,
): Resolution => {
  const attacker = state.units[attackerId]
  const target = state.units[targetId]

  if (attacker === undefined || target === undefined) return { state, events: [] }

  const dist = distance(attacker.position, target.position)
  if (dist > attacker.weapon.range) return { state, events: [] }

  const enemyObstacles: Obstacle[] = Object.values(state.units)
    .filter((u) => u.playerId !== attacker.playerId && u.id !== targetId)
    .map((u) => ({
      x: u.position.x - UNIT_RADIUS_IN,
      y: u.position.y - UNIT_RADIUS_IN,
      width: 2 * UNIT_RADIUS_IN,
      height: 2 * UNIT_RADIUS_IN,
    }))

  if (!hasLineOfSight(attacker.position, target.position, [...losBlockers(state), ...enemyObstacles])) return { state, events: [] }

  const inCover = isInCover(attacker.position, target.position, UNIT_RADIUS_IN, solidTerrain(state))

  const hitRolls: number[] = []
  let hits = 0
  for (let i = 0; i < attacker.weapon.attacks; i++) {
    const r = roll(rng)
    hitRolls.push(r)
    if (r >= attacker.weapon.toHit) hits++
  }

  const saveRolls: number[] = []
  let damageDealt = 0
  for (let i = 0; i < hits; i++) {
    const r = roll(rng)
    saveRolls.push(r)
    if (r < target.save) {
      damageDealt += attacker.weapon.damage
    }
  }

  const newRemainingWounds = Math.max(0, target.remainingWounds - damageDealt)

  const event: AttackResolvedEvent = {
    type: 'attack-resolved',
    attackerId,
    targetId,
    hits,
    damageDealt,
    hitRolls,
    saveRolls,
    inCover,
  }

  const newState: GameState = {
    ...state,
    units: {
      ...state.units,
      [targetId]: { ...target, remainingWounds: newRemainingWounds },
    },
  }

  return { state: newState, events: [event] }
}
