import { Board } from './view/Board'
import { UnitPanel } from './view/UnitPanel'
import { DiceLog } from './view/DiceLog'

export function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Board />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <UnitPanel />
        <DiceLog />
      </div>
    </div>
  )
}
