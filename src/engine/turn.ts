import type { GameState } from '../domain/game-state'

export function endActivation(state: GameState): GameState {
  const nextPlayerId = state.activePlayerId === 1 ? 2 : 1

  const units = Object.fromEntries(
    Object.entries(state.units).map(([id, unit]) => [
      id,
      unit.playerId === nextPlayerId ? { ...unit, remainingMove: unit.move } : unit,
    ]),
  )

  return {
    ...state,
    units,
    activePlayerId: nextPlayerId,
    activatedUnitId: null,
  }
}
