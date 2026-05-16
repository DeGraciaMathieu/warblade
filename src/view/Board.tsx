import { useEffect, useRef } from 'react'
import { Application, Container, Graphics } from 'pixi.js'
import {
  BOARD_HEIGHT_IN,
  BOARD_HEIGHT_PX,
  BOARD_WIDTH_IN,
  BOARD_WIDTH_PX,
  PIXELS_PER_INCH,
  UNIT_RADIUS_PX,
} from './constants'
import { useGameStore } from './game-store'
import type { AttackDragState, DragState } from './game-store'
import type { GameState } from '../domain/game-state'
import type { Obstacle } from '../domain/obstacle'
import type { UnitId } from '../domain/unit'

const GRID_COLOR = 0x2a2a2a
const BOARD_BG_COLOR = 0x242424
const UNIT_COLOR = 0x6ea8fe
const ARROW_COLOR = 0xffd166
const TARGET_LINE_COLOR = 0xff4444
const OBSTACLE_COLOR = 0x555555
const GAUGE_BG_COLOR = 0x444444
const GAUGE_FG_COLOR = 0x4caf50
const GAUGE_WIDTH_PX = UNIT_RADIUS_PX * 2
const GAUGE_HEIGHT_PX = 3
const GAUGE_OFFSET_Y = UNIT_RADIUS_PX + 4

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

function drawObstacles(gfx: Graphics, obstacles: Obstacle[]): void {
  gfx.clear()
  for (const obs of obstacles) {
    gfx
      .rect(obs.x * PIXELS_PER_INCH, obs.y * PIXELS_PER_INCH, obs.width * PIXELS_PER_INCH, obs.height * PIXELS_PER_INCH)
      .fill(OBSTACLE_COLOR)
  }
}

function drawUnits(
  container: Container,
  game: GameState,
  onDragStart: (id: UnitId, x: number, y: number) => void,
  onAttackDragStart: (id: UnitId, x: number, y: number) => void,
): void {
  for (const child of container.children) child.destroy()
  container.removeChildren()

  for (const unit of Object.values(game.units)) {
    const gfx = new Graphics()

    gfx.circle(0, 0, UNIT_RADIUS_PX).fill(UNIT_COLOR)

    const ratio = unit.move > 0 ? unit.remainingMove / unit.move : 0
    gfx
      .rect(-GAUGE_WIDTH_PX / 2, GAUGE_OFFSET_Y, GAUGE_WIDTH_PX, GAUGE_HEIGHT_PX)
      .fill(GAUGE_BG_COLOR)
    if (ratio > 0) {
      gfx
        .rect(-GAUGE_WIDTH_PX / 2, GAUGE_OFFSET_Y, GAUGE_WIDTH_PX * ratio, GAUGE_HEIGHT_PX)
        .fill(GAUGE_FG_COLOR)
    }

    gfx.position.set(unit.position.x * PIXELS_PER_INCH, unit.position.y * PIXELS_PER_INCH)
    gfx.eventMode = 'static'
    gfx.cursor = 'grab'
    gfx.on('pointerdown', (e) => {
      e.stopPropagation()
      const local = e.getLocalPosition(container)
      if (e.button === 2) {
        onAttackDragStart(unit.id, local.x / PIXELS_PER_INCH, local.y / PIXELS_PER_INCH)
      } else {
        onDragStart(unit.id, local.x / PIXELS_PER_INCH, local.y / PIXELS_PER_INCH)
      }
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

function drawTargetLine(gfx: Graphics, game: GameState, attackDragState: AttackDragState | null): void {
  gfx.clear()
  if (attackDragState === null) return

  const attacker = game.units[attackDragState.attackerId]
  if (attacker === undefined) return

  const fromX = attacker.position.x * PIXELS_PER_INCH
  const fromY = attacker.position.y * PIXELS_PER_INCH
  const toX = attackDragState.target.x * PIXELS_PER_INCH
  const toY = attackDragState.target.y * PIXELS_PER_INCH

  const dx = toX - fromX
  const dy = toY - fromY
  if (Math.sqrt(dx * dx + dy * dy) === 0) return

  gfx.moveTo(fromX, fromY).lineTo(toX, toY).stroke({ color: TARGET_LINE_COLOR, width: 2, alpha: 0.8 })
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
      app.canvas.addEventListener('contextmenu', (e) => e.preventDefault())

      const boardGfx = new Graphics()
      const obstaclesGfx = new Graphics()
      const boardLayer = new Container()
      boardLayer.addChild(boardGfx)
      boardLayer.addChild(obstaclesGfx)

      const arrowGfx = new Graphics()
      const targetLineGfx = new Graphics()
      const arrowLayer = new Container()
      arrowLayer.addChild(arrowGfx)
      arrowLayer.addChild(targetLineGfx)

      const unitsLayer = new Container()

      drawGrid(boardGfx)

      app.stage.eventMode = 'static'
      boardGfx.eventMode = 'static'

      boardGfx.on('pointermove', (e) => {
        const { dragState, updateDrag, attackDragState, updateAttackDrag } = useGameStore.getState()
        const local = e.getLocalPosition(boardGfx)
        const pos = { x: local.x / PIXELS_PER_INCH, y: local.y / PIXELS_PER_INCH }
        if (dragState !== null) updateDrag(pos)
        if (attackDragState !== null) updateAttackDrag(pos)
      })

      app.stage.on('pointerup', () => {
        const { dragState, endDrag, attackDragState, endAttackDrag } = useGameStore.getState()
        if (dragState !== null) endDrag()
        if (attackDragState !== null) endAttackDrag()
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

      const unsubscribe = useGameStore.subscribe(({ game, dragState, attackDragState, startDrag, startAttackDrag }) => {
        drawObstacles(obstaclesGfx, game.obstacles)
        drawUnits(
          unitsLayer,
          game,
          (id, x, y) => startDrag(id, { x, y }),
          (id, x, y) => startAttackDrag(id, { x, y }),
        )
        drawArrow(arrowGfx, game, dragState)
        drawTargetLine(targetLineGfx, game, attackDragState)
      })

      const { game, dragState, attackDragState, startDrag, startAttackDrag } = useGameStore.getState()
      drawObstacles(obstaclesGfx, game.obstacles)
      drawUnits(
        unitsLayer,
        game,
        (id, x, y) => startDrag(id, { x, y }),
        (id, x, y) => startAttackDrag(id, { x, y }),
      )
      drawArrow(arrowGfx, game, dragState)
      drawTargetLine(targetLineGfx, game, attackDragState)

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
