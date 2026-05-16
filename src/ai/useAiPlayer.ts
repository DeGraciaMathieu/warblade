import { useEffect, useRef } from 'react'
import { useGameStore } from '../view/game-store'
import { decide } from './ai-player'

const AI_DELAY_MS = 800

export function useAiPlayer(enabled: boolean): void {
  const game = useGameStore((s) => s.game)
  const startDrag = useGameStore((s) => s.startDrag)
  const endDrag = useGameStore((s) => s.endDrag)
  const startAttackDrag = useGameStore((s) => s.startAttackDrag)
  const endAttackDrag = useGameStore((s) => s.endAttackDrag)
  const endTurn = useGameStore((s) => s.endTurn)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!enabled || decide(game) === null) return

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      const currentGame = useGameStore.getState().game
      const decision = decide(currentGame)
      if (decision === null) return

      if (decision.type === 'move') {
        startDrag(decision.unitId, decision.target)
        endDrag()
      } else if (decision.type === 'attack') {
        startAttackDrag(decision.attackerId, decision.targetPosition)
        endAttackDrag()
      } else {
        endTurn()
      }
    }, AI_DELAY_MS)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [game, enabled])
}
