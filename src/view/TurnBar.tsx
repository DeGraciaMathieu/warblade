import { useEffect } from 'react'
import { useGameStore } from './game-store'

export function TurnBar() {
  const activePlayerId = useGameStore((s) => s.game.activePlayerId)
  const phase = useGameStore((s) => s.game.phase)
  const scores = useGameStore((s) => s.game.scores)
  const endTurn = useGameStore((s) => s.endTurn)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') endTurn()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [endTurn])

  return (
    <div style={styles.bar}>
      <span style={styles.label}>Phase {phase} — Joueur {activePlayerId}</span>
      <span style={styles.scores}>J1 : {scores[1]} — J2 : {scores[2]}</span>
      <button onClick={endTurn} style={styles.button}>Passer</button>
    </div>
  )
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: '#1e1e1e',
    borderBottom: '1px solid #333',
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  label: {
    fontWeight: 'bold' as const,
  },
  scores: {
    color: '#c8a96e',
    fontWeight: 'bold' as const,
  },
  button: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '6px 14px',
    cursor: 'pointer',
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
}
