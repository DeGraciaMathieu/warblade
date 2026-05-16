import { useGameStore } from './game-store'

export function TurnBar() {
  const activePlayerId = useGameStore((s) => s.game.activePlayerId)
  const endTurn = useGameStore((s) => s.endTurn)

  return (
    <div style={styles.bar}>
      <span style={styles.label}>Joueur {activePlayerId}</span>
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
