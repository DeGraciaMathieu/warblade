import { describe, it, expect } from 'vitest'
import { losBlockers, solidTerrain } from './game-state'
import type { GameState } from './game-state'

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  units: {},
  walls: [],
  obstacles: [],
  captureZones: [],
  activePlayerId: 1,
  activatedUnitId: null,
  phase: 1,
  activatedUnitIds: [],
  gameOver: false,
  scores: { 1: 0, 2: 0 },
  ...overrides,
})

const wall = { x: 0, y: 0, width: 4, height: 4 }
const obstacle = { x: 10, y: 0, width: 2, height: 2 }

describe('séparation walls / obstacles pour la ligne de vue', () => {
  it('losBlockers retourne les walls', () => {
    const state = makeState({ walls: [wall] })
    expect(losBlockers(state)).toEqual([wall])
  })

  it('losBlockers n\'inclut pas les obstacles', () => {
    const state = makeState({ walls: [wall], obstacles: [obstacle] })
    expect(losBlockers(state)).not.toContainEqual(obstacle)
  })

  it('losBlockers est vide quand il n\'y a pas de walls', () => {
    const state = makeState({ obstacles: [obstacle] })
    expect(losBlockers(state)).toHaveLength(0)
  })
})

describe('terrain solide pour le mouvement et le couvert', () => {
  it('solidTerrain inclut les walls', () => {
    const state = makeState({ walls: [wall] })
    expect(solidTerrain(state)).toContainEqual(wall)
  })

  it('solidTerrain inclut les obstacles', () => {
    const state = makeState({ obstacles: [obstacle] })
    expect(solidTerrain(state)).toContainEqual(obstacle)
  })

  it('solidTerrain regroupe walls et obstacles', () => {
    const state = makeState({ walls: [wall], obstacles: [obstacle] })
    const terrain = solidTerrain(state)
    expect(terrain).toHaveLength(2)
    expect(terrain).toContainEqual(wall)
    expect(terrain).toContainEqual(obstacle)
  })

  it('solidTerrain est vide quand il n\'y a ni wall ni obstacle', () => {
    const state = makeState()
    expect(solidTerrain(state)).toHaveLength(0)
  })
})

describe('règle fondamentale : walls bloquent la LOS, obstacles non', () => {
  it('un obstacle ne bloque pas la ligne de vue', () => {
    const state = makeState({ walls: [], obstacles: [obstacle] })
    expect(losBlockers(state)).toHaveLength(0)
  })

  it('un wall bloque à la fois la LOS et le mouvement', () => {
    const state = makeState({ walls: [wall] })
    expect(losBlockers(state)).toContainEqual(wall)
    expect(solidTerrain(state)).toContainEqual(wall)
  })
})
