import { describe, it, expect } from 'vitest'
import { FUSIL, EPEE, SNIPER } from './weapons'

describe('validité des stats d\'armes', () => {
  const allWeapons = [FUSIL, EPEE, SNIPER]

  it.each(allWeapons)('$name — attacks est au moins 1', (weapon) => {
    expect(weapon.attacks).toBeGreaterThanOrEqual(1)
  })

  it.each(allWeapons)('$name — range est positive', (weapon) => {
    expect(weapon.range).toBeGreaterThan(0)
  })

  it.each(allWeapons)('$name — damage est au moins 1', (weapon) => {
    expect(weapon.damage).toBeGreaterThanOrEqual(1)
  })

  it.each(allWeapons)('$name — toHit est entre 1 et 6 inclus', (weapon) => {
    expect(weapon.toHit).toBeGreaterThanOrEqual(1)
    expect(weapon.toHit).toBeLessThanOrEqual(6)
  })
})

describe('hiérarchie des armes', () => {
  it('le sniper a une plus grande portée que le fusil', () => {
    expect(SNIPER.range).toBeGreaterThan(FUSIL.range)
  })

  it('le sniper fait plus de dégâts par touche que le fusil', () => {
    expect(SNIPER.damage).toBeGreaterThan(FUSIL.damage)
  })

  it('l\'épée a moins de portée que le fusil', () => {
    expect(EPEE.range).toBeLessThan(FUSIL.range)
  })
})
