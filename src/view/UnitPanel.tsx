import { useGameStore } from './game-store'
import type { Weapon } from '../domain/weapon'

export function UnitPanel() {
  const selectedUnitId = useGameStore((s) => s.selectedUnitId)
  const units = useGameStore((s) => s.game.units)
  const equipWeapon = useGameStore((s) => s.equipWeapon)

  if (selectedUnitId === null) return null

  const unit = units[selectedUnitId]
  if (unit === undefined) return null

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Unité {selectedUnitId}</div>
      <div style={styles.section}>Armes</div>
      {unit.availableWeapons.map((weapon) => (
        <WeaponButton
          key={weapon.name}
          weapon={weapon}
          active={weapon === unit.weapon}
          onSelect={() => equipWeapon(selectedUnitId, weapon)}
        />
      ))}
    </div>
  )
}

function WeaponButton({ weapon, active, onSelect }: { weapon: Weapon; active: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} style={{ ...styles.weaponBtn, ...(active ? styles.weaponBtnActive : {}) }}>
      <div style={styles.weaponName}>{weapon.name}</div>
      <div style={styles.weaponStats}>
        Portée {weapon.range}&quot; · {weapon.attacks} att · touche {weapon.toHit}+ · {weapon.damage} dmg
      </div>
    </button>
  )
}

const styles = {
  panel: {
    width: '220px',
    background: '#1e1e1e',
    borderLeft: '1px solid #333',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    color: '#ccc',
    fontFamily: 'monospace',
    fontSize: '13px',
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
    marginBottom: '4px',
  },
  weaponBtn: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '8px 10px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    color: '#ccc',
    fontFamily: 'monospace',
    width: '100%',
  },
  weaponBtnActive: {
    borderColor: '#6ea8fe',
    background: '#1a2a3a',
    color: '#fff',
  },
  weaponName: {
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  weaponStats: {
    fontSize: '11px',
    color: '#888',
  },
}
