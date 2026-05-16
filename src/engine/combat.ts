import type { GameState } from '../domain/game-state'
import type { GameEvent, AttackResolvedEvent } from '../domain/game-event'
import type { UnitId } from '../domain/unit'
import type { Rng } from '../domain/rng'
import { distance, hasLineOfSight } from '../domain/position'

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
  if (!hasLineOfSight(attacker.position, target.position, state.obstacles)) return { state, events: [] }

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
