import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './game-store'

const DIE_DELAY_MS = 500
const PHASE_DELAY_MS = 800

export function DiceLog() {
  const result = useGameStore((s) => s.lastAttackResult)
  const units = useGameStore((s) => s.game.units)
  const flushPendingDamage = useGameStore((s) => s.flushPendingDamage)
  const [revealed, setRevealed] = useState(0)
  const prevResultRef = useRef(result)

  useEffect(() => {
    if (result === null || result === prevResultRef.current) return
    prevResultRef.current = result

    const total = result.hitRolls.length + result.saveRolls.length
    setRevealed(0)

    let count = 0
    let timerId: ReturnType<typeof setTimeout>

    const revealNext = () => {
      count++
      setRevealed(count)
      if (count >= total) {
        flushPendingDamage()
        return
      }
      const delay = count === result.hitRolls.length ? PHASE_DELAY_MS : DIE_DELAY_MS
      timerId = setTimeout(revealNext, delay)
    }

    timerId = setTimeout(revealNext, DIE_DELAY_MS)

    return () => clearTimeout(timerId)
  }, [result, flushPendingDamage])

  if (result === null) return null

  const attacker = units[result.attackerId]
  const target = units[result.targetId]
  if (attacker === undefined || target === undefined) return null

  const toHit = attacker.weapon.toHit
  const save = target.save
  const total = result.hitRolls.length + result.saveRolls.length
  const hitRevealed = Math.min(revealed, result.hitRolls.length)
  const saveRevealed = Math.max(0, revealed - result.hitRolls.length)

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Combat</div>
      <div style={styles.section}>Touches (besoin {toHit}+)</div>
      <div style={styles.rolls}>
        {result.hitRolls.map((r, i) => (
          <span key={i} style={i < hitRevealed ? (r >= toHit ? styles.success : styles.fail) : styles.hidden}>
            {i < hitRevealed ? r : '?'}
          </span>
        ))}
      </div>
      {result.saveRolls.length > 0 && hitRevealed === result.hitRolls.length && (
        <>
          <div style={styles.section}>Sauvegardes (besoin {save}+)</div>
          <div style={styles.rolls}>
            {result.saveRolls.map((r, i) => (
              <span key={i} style={i < saveRevealed ? (r >= save ? styles.success : styles.fail) : styles.hidden}>
                {i < saveRevealed ? r : '?'}
              </span>
            ))}
          </div>
        </>
      )}
      {revealed >= total && (
        <div style={styles.summary}>
          {result.hits} touche{result.hits > 1 ? 's' : ''} · {result.damageDealt} dgts
        </div>
      )}
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
  hidden: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '4px 8px',
    color: '#555',
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
