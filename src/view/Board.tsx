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
import type { UnitId } from '../domain/unit'

const GRID_COLOR = 0x2a2a2a
const BOARD_BG_COLOR = 0x242424
const UNIT_COLOR = 0x6ea8fe
const UNIT_SELECTED_COLOR = 0xffd166
const UNIT_RADIUS_PX = 12

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
  selectedUnitId: UnitId | null,
  onSelect: (id: UnitId) => void,
): void {
  for (const child of container.children) child.destroy()
  container.removeChildren()

  for (const unit of Object.values(game.units)) {
    const gfx = new Graphics()
    const color = unit.id === selectedUnitId ? UNIT_SELECTED_COLOR : UNIT_COLOR

    gfx.circle(0, 0, UNIT_RADIUS_PX).fill(color)
    gfx.position.set(unit.position.x * PIXELS_PER_INCH, unit.position.y * PIXELS_PER_INCH)
    gfx.eventMode = 'static'
    gfx.cursor = 'pointer'
    gfx.on('pointerdown', (e) => {
      e.stopPropagation()
      onSelect(unit.id)
    })

    container.addChild(gfx)
  }
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

      const unitsLayer = new Container()

      drawGrid(boardGfx)

      boardGfx.eventMode = 'static'
      boardGfx.on('pointerdown', (e) => {
        const { selectedUnitId, moveUnit } = useGameStore.getState()
        if (selectedUnitId === null) return

        const local = e.getLocalPosition(boardGfx)
        moveUnit(selectedUnitId, {
          x: local.x / PIXELS_PER_INCH,
          y: local.y / PIXELS_PER_INCH,
        })
      })

      app.stage.addChild(boardLayer)
      app.stage.addChild(unitsLayer)

      const center = () => {
        const offsetX = Math.round((app.screen.width - BOARD_WIDTH_PX) / 2)
        const offsetY = Math.round((app.screen.height - BOARD_HEIGHT_PX) / 2)
        boardLayer.position.set(offsetX, offsetY)
        unitsLayer.position.set(offsetX, offsetY)
      }

      center()
      app.renderer.on('resize', center)

      // Synchronise la couche Pixi avec le store sans passer par le cycle React :
      // le ref serait null au moment où useEffect s'exécute (init async).
      const unsubscribe = useGameStore.subscribe(({ game, selectedUnitId, selectUnit }) => {
        drawUnits(unitsLayer, game, selectedUnitId, selectUnit)
      })

      const { game, selectedUnitId, selectUnit } = useGameStore.getState()
      drawUnits(unitsLayer, game, selectedUnitId, selectUnit)

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
