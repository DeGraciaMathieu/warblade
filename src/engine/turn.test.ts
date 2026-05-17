import { describe, it, expect } from 'vitest'
import { endActivation } from './turn'
import type { GameState } from '../domain/game-state'
import type { Unit } from '../domain/unit'

const makeUnit = (id: string, playerId: 1 | 2, overrides: Partial<Unit> = {}): Unit => ({
  id,
  name: 'Marine',
  playerId,
  position: { x: 0, y: 0 },
  move: 6,
  remainingMove: 0,
  weapon: { name: 'gun', range: 12, attacks: 1, toHit: 4, damage: 1 },
  availableWeapons: [],
  wounds: 1,
  remainingWounds: 1,
  save: 4,
  ...overrides,
})

const makeState = (overrides: Partial<GameState> = {}, units: Unit[] = []): GameState => ({
  units: Object.fromEntries(units.map((u) => [u.id, u])),
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

describe('endActivation', () => {
  it('passe du joueur 1 au joueur 2', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 1, activatedUnitId: 'p1-1' }, units)

    const result = endActivation(state)

    expect(result.activePlayerId).toBe(2)
  })

  it('passe du joueur 2 au joueur 1', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 2, activatedUnitId: 'p2-1' }, units)

    const result = endActivation(state)

    expect(result.activePlayerId).toBe(1)
  })

  it('ne mute pas le state original', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 1, activatedUnitId: 'p1-1' }, units)

    endActivation(state)

    expect(state.activePlayerId).toBe(1)
    expect(state.activatedUnitIds).toEqual([])
  })

  it('reset activatedUnitId à null', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 1, activatedUnitId: 'p1-1' }, units)

    const result = endActivation(state)

    expect(result.activatedUnitId).toBeNull()
  })

  it('ajoute l unité activée à activatedUnitIds', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 1, activatedUnitId: 'p1-1' }, units)

    const result = endActivation(state)

    expect(result.activatedUnitIds).toContain('p1-1')
  })

  it('conserve les unités déjà activées dans activatedUnitIds', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p1-2', 1), makeUnit('p2-1', 2), makeUnit('p2-2', 2)]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
    }, units)

    const result = endActivation(state)

    expect(result.activatedUnitIds).toContain('p1-1')
    expect(result.activatedUnitIds).toContain('p2-1')
  })

  it('si le joueur suivant n a plus d unité activable, reste sur le joueur courant', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p1-2', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 1,
      activatedUnitId: 'p1-1',
      activatedUnitIds: ['p2-1'],
    }, units)

    const result = endActivation(state)

    expect(result.activePlayerId).toBe(1)
  })

  it('démarre une nouvelle phase quand toutes les unités ont été activées', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.phase).toBe(2)
    expect(result.activatedUnitIds).toEqual([])
  })

  it('reset remainingMove de toutes les unités en début de nouvelle phase', () => {
    const units = [
      makeUnit('p1-1', 1, { remainingMove: 0 }),
      makeUnit('p2-1', 2, { remainingMove: 1 }),
    ]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.units['p1-1'].remainingMove).toBe(6)
    expect(result.units['p2-1'].remainingMove).toBe(6)
  })

  it('le joueur qui n a pas commencé la phase précédente commence la suivante', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.activePlayerId).toBe(2)
  })

  it('le joueur 1 commence la phase 3', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 1,
      activatedUnitId: 'p1-1',
      activatedUnitIds: ['p2-1'],
      phase: 2,
    }, units)

    const result = endActivation(state)

    expect(result.activePlayerId).toBe(1)
  })

  it('ne reset pas remainingMove en cours de phase', () => {
    const units = [
      makeUnit('p1-1', 1, { remainingMove: 2 }),
      makeUnit('p1-2', 1, { remainingMove: 0 }),
      makeUnit('p2-1', 2, { remainingMove: 3 }),
    ]
    const state = makeState({ activePlayerId: 1, activatedUnitId: 'p1-1' }, units)

    const result = endActivation(state)

    expect(result.units['p1-1'].remainingMove).toBe(2)
    expect(result.units['p2-1'].remainingMove).toBe(3)
  })

  it('retourne le state inchangé si aucune unité n est activée', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activePlayerId: 1, activatedUnitId: null }, units)

    const result = endActivation(state)

    expect(result).toBe(state)
  })

  it('retourne le state inchangé si la partie est terminée', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({ activatedUnitId: 'p1-1', gameOver: true }, units)

    const result = endActivation(state)

    expect(result).toBe(state)
  })

  it('passe gameOver à true quand la phase MAX_PHASES se termine', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      phase: 5,
    }, units)

    const result = endActivation(state)

    expect(result.gameOver).toBe(true)
  })

  it('ne démarre pas de nouvelle phase après MAX_PHASES', () => {
    const units = [makeUnit('p1-1', 1), makeUnit('p2-1', 2)]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      phase: 5,
    }, units)

    const result = endActivation(state)

    expect(result.phase).toBe(5)
  })
})

describe('scores de zones de capture', () => {
  it('attribue un point au joueur qui contrôle une zone en fin de phase', () => {
    const units = [
      makeUnit('p1-1', 1, { position: { x: 5.5, y: 5.5 } }),
      makeUnit('p2-1', 2, { position: { x: 20, y: 20 } }),
    ]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      captureZones: [{ tiles: [{ x: 5, y: 5 }] }],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.scores[1]).toBe(1)
    expect(result.scores[2]).toBe(0)
  })

  it('n\'attribue pas de point pour une zone contestée', () => {
    const units = [
      makeUnit('p1-1', 1, { position: { x: 5.5, y: 5.5 } }),
      makeUnit('p2-1', 2, { position: { x: 5.2, y: 5.2 } }),
    ]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      captureZones: [{ tiles: [{ x: 5, y: 5 }] }],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.scores[1]).toBe(0)
    expect(result.scores[2]).toBe(0)
  })

  it('attribue les points même à la dernière phase', () => {
    const units = [
      makeUnit('p1-1', 1, { position: { x: 5.5, y: 5.5 } }),
      makeUnit('p2-1', 2, { position: { x: 20, y: 20 } }),
    ]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      captureZones: [{ tiles: [{ x: 5, y: 5 }] }],
      phase: 5,
    }, units)

    const result = endActivation(state)

    expect(result.scores[1]).toBe(1)
    expect(result.gameOver).toBe(true)
  })

  it('accumule les points sur les phases précédentes', () => {
    const units = [
      makeUnit('p1-1', 1, { position: { x: 5.5, y: 5.5 } }),
      makeUnit('p2-1', 2, { position: { x: 20, y: 20 } }),
    ]
    const state = makeState({
      activePlayerId: 2,
      activatedUnitId: 'p2-1',
      activatedUnitIds: ['p1-1'],
      captureZones: [{ tiles: [{ x: 5, y: 5 }] }],
      scores: { 1: 2, 2: 0 },
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.scores[1]).toBe(3)
  })

  it('ne marque pas de point en cours de phase', () => {
    const units = [
      makeUnit('p1-1', 1, { position: { x: 5.5, y: 5.5 } }),
      makeUnit('p1-2', 1),
      makeUnit('p2-1', 2, { position: { x: 20, y: 20 } }),
    ]
    const state = makeState({
      activePlayerId: 1,
      activatedUnitId: 'p1-1',
      captureZones: [{ tiles: [{ x: 5, y: 5 }] }],
      phase: 1,
    }, units)

    const result = endActivation(state)

    expect(result.scores[1]).toBe(0)
  })
})
