import { Board } from './view/Board'
import { UnitPanel } from './view/UnitPanel'

export function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Board />
      </div>
      <UnitPanel />
    </div>
  )
}
