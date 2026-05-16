import { useState } from 'react'
import { App } from './App'
import { Menu } from './view/Menu'
import type { GameMode } from './view/Menu'

export function Root() {
  const [mode, setMode] = useState<GameMode | null>(null)

  if (mode === null) {
    return <Menu onSelect={setMode} />
  }

  return <App mode={mode} />
}
