import { Board } from './view/Board'
import { UnitPanel } from './view/UnitPanel'
import { DiceLog } from './view/DiceLog'
import { TurnBar } from './view/TurnBar'
import { useAiPlayer } from './ai/useAiPlayer'
import type { GameMode } from './view/Menu'

type Props = {
  mode: GameMode
}

export function App({ mode }: Props) {
  useAiPlayer(mode === 'vs-ai')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <TurnBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Board />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <UnitPanel />
          <DiceLog />
        </div>
      </div>
    </div>
  )
}
