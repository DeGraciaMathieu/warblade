export type GameMode = 'two-players' | 'vs-ai'

type Props = {
  onSelect: (mode: GameMode) => void
}

export function Menu({ onSelect }: Props) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Warblade</h1>
      <p style={styles.subtitle}>Choisissez un mode de jeu</p>
      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => onSelect('two-players')}>
          Deux joueurs
        </button>
        <button style={styles.button} onClick={() => onSelect('vs-ai')}>
          Contre l'IA
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    background: '#1a1a1a',
    color: '#e8e0d0',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#c8a96e',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#888',
    letterSpacing: '0.05em',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.9rem 3rem',
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    background: 'transparent',
    border: '2px solid #c8a96e',
    color: '#c8a96e',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    transition: 'background 0.15s, color 0.15s',
  },
}
