import type { Unit, PlayerId } from '../domain/unit'
import { EPEE, FUSIL, PISTOLET_BOLT, SNIPER } from './weapons'

export const INFANTRY_MOVE_IN = 14
export const INFANTRY_WOUNDS = 5
export const INFANTRY_SAVE = 4

export const SNIPER_MOVE_IN = 10
export const SNIPER_WOUNDS = 4
export const SNIPER_SAVE = 4

export const SQUAD_LEADER_MOVE_IN = 8
export const SQUAD_LEADER_WOUNDS = 8
export const SQUAD_LEADER_SAVE = 3

export const createInfantry = (id: string, playerId: PlayerId, x: number, y: number): Unit => ({
  id,
  name: 'Space Marine',
  emoji: '⚔️',
  playerId,
  position: { x, y },
  move: INFANTRY_MOVE_IN,
  remainingMove: INFANTRY_MOVE_IN,
  weapon: FUSIL,
  availableWeapons: [FUSIL, EPEE],
  wounds: INFANTRY_WOUNDS,
  remainingWounds: INFANTRY_WOUNDS,
  save: INFANTRY_SAVE,
})

export const createSquadLeader = (id: string, playerId: PlayerId, x: number, y: number): Unit => ({
  id,
  name: 'Chef d\'Escouade',
  emoji: '👑',
  playerId,
  position: { x, y },
  move: SQUAD_LEADER_MOVE_IN,
  remainingMove: SQUAD_LEADER_MOVE_IN,
  weapon: PISTOLET_BOLT,
  availableWeapons: [PISTOLET_BOLT, EPEE],
  wounds: SQUAD_LEADER_WOUNDS,
  remainingWounds: SQUAD_LEADER_WOUNDS,
  save: SQUAD_LEADER_SAVE,
})

export const createSniper = (id: string, playerId: PlayerId, x: number, y: number): Unit => ({
  id,
  name: 'Sniper',
  emoji: '🎯',
  playerId,
  position: { x, y },
  move: SNIPER_MOVE_IN,
  remainingMove: SNIPER_MOVE_IN,
  weapon: SNIPER,
  availableWeapons: [SNIPER, EPEE],
  wounds: SNIPER_WOUNDS,
  remainingWounds: SNIPER_WOUNDS,
  save: SNIPER_SAVE,
})
