import { describe, it, expect } from 'vitest'
import {
  createInfantry,
  createSniper,
  createSquadLeader,
  INFANTRY_MOVE_IN,
  INFANTRY_WOUNDS,
  INFANTRY_SAVE,
  SNIPER_MOVE_IN,
  SNIPER_WOUNDS,
  SNIPER_SAVE,
  SQUAD_LEADER_MOVE_IN,
  SQUAD_LEADER_WOUNDS,
  SQUAD_LEADER_SAVE,
} from './units'

describe('création d\'une infanterie', () => {
  it('positionne l\'unité aux coordonnées demandées', () => {
    const unit = createInfantry('u1', 1, 5, 12)
    expect(unit.position).toEqual({ x: 5, y: 12 })
  })

  it('assigne le bon joueur', () => {
    const unit = createInfantry('u1', 2, 0, 0)
    expect(unit.playerId).toBe(2)
  })

  it('wounds et remainingWounds sont identiques à la création', () => {
    const unit = createInfantry('u1', 1, 0, 0)
    expect(unit.remainingWounds).toBe(unit.wounds)
  })

  it('move et remainingMove sont identiques à la création', () => {
    const unit = createInfantry('u1', 1, 0, 0)
    expect(unit.remainingMove).toBe(unit.move)
  })

  it('l\'arme active est disponible dans availableWeapons', () => {
    const unit = createInfantry('u1', 1, 0, 0)
    expect(unit.availableWeapons).toContain(unit.weapon)
  })

  it('expose les constantes de profil correctes', () => {
    const unit = createInfantry('u1', 1, 0, 0)
    expect(unit.move).toBe(INFANTRY_MOVE_IN)
    expect(unit.wounds).toBe(INFANTRY_WOUNDS)
    expect(unit.save).toBe(INFANTRY_SAVE)
  })
})

describe('création d\'un sniper', () => {
  it('positionne l\'unité aux coordonnées demandées', () => {
    const unit = createSniper('s1', 2, 10, 3)
    expect(unit.position).toEqual({ x: 10, y: 3 })
  })

  it('assigne le bon joueur', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.playerId).toBe(1)
  })

  it('wounds et remainingWounds sont identiques à la création', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.remainingWounds).toBe(unit.wounds)
  })

  it('move et remainingMove sont identiques à la création', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.remainingMove).toBe(unit.move)
  })

  it('l\'arme active est disponible dans availableWeapons', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.availableWeapons).toContain(unit.weapon)
  })

  it('expose les constantes de profil correctes', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.move).toBe(SNIPER_MOVE_IN)
    expect(unit.wounds).toBe(SNIPER_WOUNDS)
    expect(unit.save).toBe(SNIPER_SAVE)
  })
})

describe('emoji de type d\'unité', () => {
  it('l\'infanterie a un emoji distinct', () => {
    const unit = createInfantry('u1', 1, 0, 0)
    expect(unit.emoji).toBeTruthy()
  })

  it('le sniper a un emoji distinct', () => {
    const unit = createSniper('s1', 1, 0, 0)
    expect(unit.emoji).toBeTruthy()
  })

  it('l\'infanterie et le sniper ont des emojis différents', () => {
    const infantry = createInfantry('i', 1, 0, 0)
    const sniper = createSniper('s', 1, 0, 0)
    expect(infantry.emoji).not.toBe(sniper.emoji)
  })
})

describe('création d\'un chef d\'escouade', () => {
  it('positionne l\'unité aux coordonnées demandées', () => {
    const unit = createSquadLeader('c1', 1, 3, 7)
    expect(unit.position).toEqual({ x: 3, y: 7 })
  })

  it('assigne le bon joueur', () => {
    const unit = createSquadLeader('c1', 2, 0, 0)
    expect(unit.playerId).toBe(2)
  })

  it('wounds et remainingWounds sont identiques à la création', () => {
    const unit = createSquadLeader('c1', 1, 0, 0)
    expect(unit.remainingWounds).toBe(unit.wounds)
  })

  it('move et remainingMove sont identiques à la création', () => {
    const unit = createSquadLeader('c1', 1, 0, 0)
    expect(unit.remainingMove).toBe(unit.move)
  })

  it('l\'arme active est disponible dans availableWeapons', () => {
    const unit = createSquadLeader('c1', 1, 0, 0)
    expect(unit.availableWeapons).toContain(unit.weapon)
  })

  it('expose les constantes de profil correctes', () => {
    const unit = createSquadLeader('c1', 1, 0, 0)
    expect(unit.move).toBe(SQUAD_LEADER_MOVE_IN)
    expect(unit.wounds).toBe(SQUAD_LEADER_WOUNDS)
    expect(unit.save).toBe(SQUAD_LEADER_SAVE)
  })

  it('est plus résistant qu\'un warrior', () => {
    const leader = createSquadLeader('c1', 1, 0, 0)
    const infantry = createInfantry('i1', 1, 0, 0)
    expect(leader.wounds).toBeGreaterThan(infantry.wounds)
  })

  it('est plus lent qu\'un warrior', () => {
    const leader = createSquadLeader('c1', 1, 0, 0)
    const infantry = createInfantry('i1', 1, 0, 0)
    expect(leader.move).toBeLessThan(infantry.move)
  })

  it('son arme principale a une portée plus courte que celle du warrior', () => {
    const leader = createSquadLeader('c1', 1, 0, 0)
    const infantry = createInfantry('i1', 1, 0, 0)
    expect(leader.weapon.range).toBeLessThan(infantry.weapon.range)
  })
})

describe('différences entre profils', () => {
  it('l\'infanterie a plus de blessures que le sniper', () => {
    const infantry = createInfantry('i', 1, 0, 0)
    const sniper = createSniper('s', 1, 0, 0)
    expect(infantry.wounds).toBeGreaterThan(sniper.wounds)
  })

  it('le sniper a une arme avec une plus grande portée que l\'infanterie', () => {
    const infantry = createInfantry('i', 1, 0, 0)
    const sniper = createSniper('s', 1, 0, 0)
    expect(sniper.weapon.range).toBeGreaterThan(infantry.weapon.range)
  })
})
