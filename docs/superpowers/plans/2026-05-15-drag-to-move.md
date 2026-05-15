# Drag-to-move Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le click-to-select + click-to-move par un drag-to-move avec flèche directionnelle cappée à la portée de l'unité.

**Architecture:** Une fonction pure `capPosition` dans `src/domain/` gère le capping géométrique. Le store Zustand reçoit un `dragState` avec trois actions (`startDrag`, `updateDrag`, `endDrag`). `Board.tsx` écoute le store et dessine la flèche via un `Graphics` dédié.

**Tech Stack:** TypeScript strict, Pixi.js v8, Zustand + Immer, Vitest.

---

### Task 1: Fonction pure `capPosition` dans le domain

**Files:**
- Create: `src/domain/position.ts`
- Create: `src/domain/position.test.ts`

- [ ] **Step 1: Écrire les tests échouants**

```ts
// src/domain/position.test.ts
import { describe, it, expect } from 'vitest'
import { capPosition } from './position'

describe('capPosition', () => {
  it('retourne rawTarget si la distance est dans la portée', () => {
    const from = { x: 0, y: 0 }
    const raw = { x: 3, y: 4 }   // distance = 5
    expect(capPosition(from, raw, 5)).toEqual({ x: 3, y: 4 })
  })

  it('cappe rawTarget à maxDist dans la même direction', () => {
    const from = { x: 0, y: 0 }
    const raw = { x: 6, y: 8 }   // distance = 10, maxDist = 5
    const result = capPosition(from, raw, 5)
    expect(result.x).toBeCloseTo(3)
    expect(result.y).toBeCloseTo(4)
  })

  it('retourne from si rawTarget === from', () => {
    const from = { x: 5, y: 5 }
    expect(capPosition(from, { x: 5, y: 5 }, 6)).toEqual({ x: 5, y: 5 })
  })
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
npx vitest run src/domain/position.test.ts
```

Expected : FAIL — `capPosition` introuvable.

- [ ] **Step 3: Implémenter `capPosition`**

```ts
// src/domain/position.ts
import type { Position } from './unit'

export const capPosition = (from: Position, rawTarget: Position, maxDist: number): Position => {
  const dx = rawTarget.x - from.x
  const dy = rawTarget.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return from
  if (dist <= maxDist) return rawTarget

  const ratio = maxDist / dist
  return { x: from.x + dx * ratio, y: from.y + dy * ratio }
}
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
npx vitest run src/domain/position.test.ts
```

Expected : 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/position.ts src/domain/position.test.ts
git commit -m "feat: capPosition — capping géométrique de position dans la portée"
```

---

### Task 2: Mise à jour du store Zustand

**Files:**
- Modify: `src/view/game-store.ts`

- [ ] **Step 1: Remplacer le contenu du store**

```ts
// src/view/game-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState } from '../domain/game-state'
import type { UnitId, Position } from '../domain/unit'
import { applyMove } from '../engine/move'
import { capPosition } from '../domain/position'
import { createInfantry } from '../data/units'

type DragState = {
  unitId: UnitId
  target: Position
}

type GameStore = {
  game: GameState
  dragState: DragState | null
  startDrag: (unitId: UnitId, rawTarget: Position) => void
  updateDrag: (rawTarget: Position) => void
  endDrag: () => void
}

const INITIAL_UNITS = [
  createInfantry('inf-1', 8, 8),
  createInfantry('inf-2', 20, 15),
  createInfantry('inf-3', 35, 30),
]

const initialGameState: GameState = {
  units: Object.fromEntries(INITIAL_UNITS.map((u) => [u.id, u])),
}

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    game: initialGameState,
    dragState: null,

    startDrag: (unitId, rawTarget) => {
      set((store) => {
        const unit = store.game.units[unitId]
        if (unit === undefined) return
        store.dragState = {
          unitId,
          target: capPosition(unit.position, rawTarget, unit.move),
        }
      })
    },

    updateDrag: (rawTarget) => {
      set((store) => {
        if (store.dragState === null) return
        const unit = store.game.units[store.dragState.unitId]
        if (unit === undefined) return
        store.dragState.target = capPosition(unit.position, rawTarget, unit.move)
      })
    },

    endDrag: () => {
      set((store) => {
        if (store.dragState === null) return
        const { unitId, target } = store.dragState
        const { state } = applyMove(store.game, unitId, target)
        store.game = state
        store.dragState = null
      })
    },
  })),
)
```

- [ ] **Step 2: Vérifier que la suite de tests passe toujours**

```bash
npx vitest run
```

Expected : tous les tests existants PASS (le store n'a pas de tests, mais `applyMove` et `capPosition` doivent rester verts).

- [ ] **Step 3: Commit**

```bash
git add src/view/game-store.ts
git commit -m "feat: dragState dans le store — startDrag / updateDrag / endDrag"
```

---

### Task 3: Mise à jour de Board.tsx

**Files:**
- Modify: `src/view/Board.tsx`

- [ ] **Step 1: Remplacer le contenu de Board.tsx**

```tsx
// src/view/Board.tsx
import { useEffect, useRef } from 'react'
import { Application, Container, Graphics } from 'pixi.js'
import {
  BOARD_HEIGHT_IN,
  BOARD_HEIGHT_PX,
  BOARD_WIDTH_IN,
  BOARD_WIDTH_PX,
  PIXELS_PER_INCH,
} from './constants'
import { useGameStore } from './game-store'
import type { GameState } from '../domain/game-state'
import type { DragState } from './game-store'
import type { UnitId } from '../domain/unit'

const GRID_COLOR = 0x2a2a2a
const BOARD_BG_COLOR = 0x242424
const UNIT_COLOR = 0x6ea8fe
const UNIT_RADIUS_PX = 12
const ARROW_COLOR = 0xffd166

function drawGrid(gfx: Graphics): void {
  gfx.clear()
  gfx.rect(0, 0, BOARD_WIDTH_PX, BOARD_HEIGHT_PX).fill(BOARD_BG_COLOR)

  for (let x = 0; x <= BOARD_WIDTH_IN; x++) {
    const px = x * PIXELS_PER_INCH
    gfx.moveTo(px, 0).lineTo(px, BOARD_HEIGHT_PX).stroke({ color: GRID_COLOR, width: 1 })
  }

  for (let y = 0; y <= BOARD_HEIGHT_IN; y++) {
    const py = y * PIXELS_PER_INCH
    gfx.moveTo(0, py).lineTo(BOARD_WIDTH_PX, py).stroke({ color: GRID_COLOR, width: 1 })
  }
}

function drawUnits(
  container: Container,
  game: GameState,
  onDragStart: (id: UnitId, x: number, y: number) => void,
): void {
  for (const child of container.children) child.destroy()
  container.removeChildren()

  for (const unit of Object.values(game.units)) {
    const gfx = new Graphics()

    gfx.circle(0, 0, UNIT_RADIUS_PX).fill(UNIT_COLOR)
    gfx.position.set(unit.position.x * PIXELS_PER_INCH, unit.position.y * PIXELS_PER_INCH)
    gfx.eventMode = 'static'
    gfx.cursor = 'grab'
    gfx.on('pointerdown', (e) => {
      e.stopPropagation()
      const local = e.getLocalPosition(container)
      onDragStart(unit.id, local.x / PIXELS_PER_INCH, local.y / PIXELS_PER_INCH)
    })

    container.addChild(gfx)
  }
}

function drawArrow(gfx: Graphics, game: GameState, dragState: DragState | null): void {
  gfx.clear()
  if (dragState === null) return

  const unit = game.units[dragState.unitId]
  if (unit === undefined) return

  const fromX = unit.position.x * PIXELS_PER_INCH
  const fromY = unit.position.y * PIXELS_PER_INCH
  const toX = dragState.target.x * PIXELS_PER_INCH
  const toY = dragState.target.y * PIXELS_PER_INCH

  const dx = toX - fromX
  const dy = toY - fromY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return

  gfx.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ color: ARROW_COLOR, width: 2 })

  const angle = Math.atan2(dy, dx)
  const headLen = 10
  const headAngle = Math.PI / 6

  gfx
    .moveTo(toX, toY)
    .lineTo(
      toX - headLen * Math.cos(angle - headAngle),
      toY - headLen * Math.sin(angle - headAngle),
    )
    .lineTo(
      toX - headLen * Math.cos(angle + headAngle),
      toY - headLen * Math.sin(angle + headAngle),
    )
    .lineTo(toX, toY)
    .fill(ARROW_COLOR)
}

export function Board() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const app = new Application()
    let initResolved = false
    let cleanedUp = false

    void app.init({ resizeTo: window, background: '#1a1a1a', antialias: true }).then(() => {
      initResolved = true
      if (cleanedUp) {
        app.destroy(true)
        return
      }

      container.appendChild(app.canvas)

      const boardGfx = new Graphics()
      const boardLayer = new Container()
      boardLayer.addChild(boardGfx)

      const arrowGfx = new Graphics()
      const arrowLayer = new Container()
      arrowLayer.addChild(arrowGfx)

      const unitsLayer = new Container()

      drawGrid(boardGfx)

      boardGfx.eventMode = 'static'

      boardGfx.on('pointermove', (e) => {
        const { dragState, updateDrag } = useGameStore.getState()
        if (dragState === null) return
        const local = e.getLocalPosition(boardGfx)
        updateDrag({ x: local.x / PIXELS_PER_INCH, y: local.y / PIXELS_PER_INCH })
      })

      boardGfx.on('pointerup', () => {
        const { dragState, endDrag } = useGameStore.getState()
        if (dragState === null) return
        endDrag()
      })

      app.stage.addChild(boardLayer)
      app.stage.addChild(arrowLayer)
      app.stage.addChild(unitsLayer)

      const center = () => {
        const offsetX = Math.round((app.screen.width - BOARD_WIDTH_PX) / 2)
        const offsetY = Math.round((app.screen.height - BOARD_HEIGHT_PX) / 2)
        boardLayer.position.set(offsetX, offsetY)
        arrowLayer.position.set(offsetX, offsetY)
        unitsLayer.position.set(offsetX, offsetY)
      }

      center()
      app.renderer.on('resize', center)

      const unsubscribe = useGameStore.subscribe(({ game, dragState, startDrag }) => {
        drawUnits(unitsLayer, game, (id, x, y) => startDrag(id, { x, y }))
        drawArrow(arrowGfx, game, dragState)
      })

      const { game, dragState, startDrag } = useGameStore.getState()
      drawUnits(unitsLayer, game, (id, x, y) => startDrag(id, { x, y }))
      drawArrow(arrowGfx, game, dragState)

      return unsubscribe
    })

    return () => {
      cleanedUp = true
      if (initResolved) {
        app.destroy(true)
      }
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

**Note :** `DragState` doit être exporté depuis `game-store.ts`. Ajouter `export` devant `type DragState` dans la Task 2.

- [ ] **Step 2: Exporter `DragState` depuis game-store.ts**

Dans `src/view/game-store.ts`, changer :
```ts
type DragState = {
```
en :
```ts
export type DragState = {
```

- [ ] **Step 3: Vérifier que tous les tests passent**

```bash
npx vitest run
```

Expected : tous les tests PASS.

- [ ] **Step 4: Lancer le dev server et tester manuellement**

```bash
npm run dev
```

Vérifier :
- Cliquer-glisser sur une unité affiche une flèche jaune.
- La flèche est cappée si on dépasse la portée.
- Relâcher déplace l'unité à la position cible.
- Pas de coloration de sélection résiduelle.

- [ ] **Step 5: Commit**

```bash
git add src/view/Board.tsx src/view/game-store.ts
git commit -m "feat: Board drag-to-move avec rendu de flèche directionnelle"
```
