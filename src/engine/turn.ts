import type { GameState } from '../domain/game-state'
import type { PlayerId } from '../domain/unit'

export function endActivation(state: GameState): GameState {
  if (state.activatedUnitId === null) return state

  const newActivatedUnitIds = [...state.activatedUnitIds, state.activatedUnitId]

  const allUnitIds = Object.keys(state.units)
  const allActivated = allUnitIds.every((id) => newActivatedUnitIds.includes(id))

  if (allActivated) {
    const units = Object.fromEntries(
      Object.entries(state.units).map(([id, unit]) => [
        id,
        { ...unit, remainingMove: unit.move },
      ]),
    )
    return {
      ...state,
      units,
      activePlayerId: state.phase % 2 === 1 ? 2 : 1,
      activatedUnitId: null,
      phase: state.phase + 1,
      activatedUnitIds: [],
    }
  }

  const nextPlayerId: PlayerId = state.activePlayerId === 1 ? 2 : 1

  const nextPlayerHasActivableUnit = Object.values(state.units).some(
    (u) => u.playerId === nextPlayerId && !newActivatedUnitIds.includes(u.id),
  )

  return {
    ...state,
    activePlayerId: nextPlayerHasActivableUnit ? nextPlayerId : state.activePlayerId,
    activatedUnitId: null,
    activatedUnitIds: newActivatedUnitIds,
  }
}
