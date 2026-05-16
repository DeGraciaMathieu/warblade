import { useGameStore } from './game-store'

export function DiceLog() {
  const result = useGameStore((s) => s.lastAttackResult)
  const units = useGameStore((s) => s.game.units)

  if (result === null) return null

  const attacker = units[result.attackerId]
  const target = units[result.targetId]
  if (attacker === undefined || target === undefined) return null

  const toHit = attacker.weapon.toHit
  const save = target.save

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Combat</div>
      <div style={styles.section}>Touches (besoin {toHit}+)</div>
      <div style={styles.rolls}>
        {result.hitRolls.map((r, i) => (
          <span key={i} style={r >= toHit ? styles.success : styles.fail}>{r}</span>
        ))}
      </div>
      {result.saveRolls.length > 0 && (
        <>
          <div style={styles.section}>Sauvegardes (besoin {save}+)</div>
          <div style={styles.rolls}>
            {result.saveRolls.map((r, i) => (
              <span key={i} style={r >= save ? styles.success : styles.fail}>{r}</span>
            ))}
          </div>
        </>
      )}
      <div style={styles.summary}>
        {result.hits} touche{result.hits > 1 ? 's' : ''} · {result.damageDealt} dgts
      </div>
    </div>
  )
}

const styles = {
  panel: {
    background: '#1e1e1e',
    borderLeft: '1px solid #333',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: '13px',
    width: '220px',
  },
  title: {
    color: '#6ea8fe',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
  },
  section: {
    color: '#888',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  rolls: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  success: {
    background: '#1a3a1a',
    border: '1px solid #4caf50',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  fail: {
    background: '#3a1a1a',
    border: '1px solid #f44336',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#f44336',
    fontWeight: 'bold',
  },
  summary: {
    marginTop: '4px',
    color: '#aaa',
    fontSize: '12px',
    borderTop: '1px solid #333',
    paddingTop: '8px',
  },
}
