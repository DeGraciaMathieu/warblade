import type { Weapon } from '../domain/weapon'

export const FUSIL: Weapon = {
  name: 'Fusil Bolter',
  range: 24,
  attacks: 2,
  toHit: 4,
  damage: 1,
}

export const EPEE: Weapon = {
  name: 'Épée',
  range: 3,
  attacks: 3,
  toHit: 3,
  damage: 1,
}

export const SNIPER: Weapon = {
  name: 'Sniper',
  range: 36,
  attacks: 1,
  toHit: 3,
  damage: 3,
}
