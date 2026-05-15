import { useEffect, useRef } from 'react'
import { Application, Graphics } from 'pixi.js'
import {
  BOARD_HEIGHT_IN,
  BOARD_HEIGHT_PX,
  BOARD_WIDTH_IN,
  BOARD_WIDTH_PX,
  PIXELS_PER_INCH,
} from './constants'

const GRID_COLOR = 0x2a2a2a
const BOARD_BG_COLOR = 0x242424

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

      const gfx = new Graphics()
      app.stage.addChild(gfx)

      const center = () => {
        gfx.x = Math.round((app.screen.width - BOARD_WIDTH_PX) / 2)
        gfx.y = Math.round((app.screen.height - BOARD_HEIGHT_PX) / 2)
      }

      drawGrid(gfx)
      center()

      app.renderer.on('resize', center)
    })

    return () => {
      cleanedUp = true
      if (initResolved) {
        app.destroy(true)
      }
      // si init n'a pas encore résolu, destroy sera appelé dans le .then()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
