import type { GameState } from '../domain/game-state'

export function endActivation(state: GameState): GameState {
  return {
    ...state,
    activePlayerId: state.activePlayerId === 1 ? 2 : 1,
    activatedUnitId: null,
  }
}
