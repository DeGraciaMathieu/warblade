import { useEffect, useRef } from 'react'
import { Application, Container, Graphics, Text } from 'pixi.js'
import {
  BOARD_HEIGHT_IN,
  BOARD_HEIGHT_PX,
  BOARD_WIDTH_IN,
  BOARD_WIDTH_PX,
  PIXELS_PER_INCH,
  UNIT_RADIUS_PX,
} from './constants'
import { useGameStore } from './game-store'
import type { AttackDragState, DamageFlash, DragState } from './game-store'
import type { GameState } from '../domain/game-state'
import type { Obstacle } from '../domain/obstacle'
import type { UnitId } from '../domain/unit'
import { hasLineOfSight } from '../domain/position'

const GRID_COLOR = 0x2a2a2a
const BOARD_BG_COLOR = 0x242424
const PLAYER_1_COLOR = 0x6ea8fe
const PLAYER_2_COLOR = 0xe85d5d
const ARROW_COLOR = 0xffd166
const TARGET_LINE_COLOR = 0xff4444
const TARGET_LINE_BLOCKED_COLOR = 0x888888
const OBSTACLE_COLOR = 0x555555
const GAUGE_BG_COLOR = 0x444444
const GAUGE_FG_COLOR = 0x4caf50
const HEALTH_FG_COLOR = 0xff4444
const GAUGE_WIDTH_PX = UNIT_RADIUS_PX * 2
const GAUGE_HEIGHT_PX = 3
const GAUGE_OFFSET_Y = UNIT_RADIUS_PX + 4
const HEALTH_OFFSET_Y = GAUGE_OFFSET_Y + GAUGE_HEIGHT_PX + 2
const DAMAGE_FLASH_DURATION_MS = 1500
const DAMAGE_FLASH_FONT_SIZE = 14
const DAMAGE_FLASH_DRIFT_PX = 24
const SELECTED_OUTLINE_COLOR = 0xffffff
const SELECTED_OUTLINE_WIDTH = 2
const SELECTED_OUTLINE_GAP_PX = 3
const DRAG_THRESHOLD_PX = 8

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
  selectedUnitId: string | null,
  onPendingDrag: (id: UnitId, x: number, y: number) => void,
  onAttackDragStart: (id: UnitId, x: number, y: number) => void,
): void {
  for (const child of container.children) child.destroy()
  container.removeChildren()

  for (const unit of Object.values(game.units)) {
    const gfx = new Graphics()

    const unitColor = unit.playerId === 1 ? PLAYER_1_COLOR : PLAYER_2_COLOR
    if (unit.id === selectedUnitId) {
      gfx.circle(0, 0, UNIT_RADIUS_PX + SELECTED_OUTLINE_GAP_PX).stroke({ color: SELECTED_OUTLINE_COLOR, width: SELECTED_OUTLINE_WIDTH })
    }
    gfx.circle(0, 0, UNIT_RADIUS_PX).fill(unitColor)

    const moveRatio = unit.move > 0 ? unit.remainingMove / unit.move : 0
    gfx
      .rect(-GAUGE_WIDTH_PX / 2, GAUGE_OFFSET_Y, GAUGE_WIDTH_PX, GAUGE_HEIGHT_PX)
      .fill(GAUGE_BG_COLOR)
    if (moveRatio > 0) {
      gfx
        .rect(-GAUGE_WIDTH_PX / 2, GAUGE_OFFSET_Y, GAUGE_WIDTH_PX * moveRatio, GAUGE_HEIGHT_PX)
        .fill(GAUGE_FG_COLOR)
    }

    const healthRatio = unit.wounds > 0 ? unit.remainingWounds / unit.wounds : 0
    gfx
      .rect(-GAUGE_WIDTH_PX / 2, HEALTH_OFFSET_Y, GAUGE_WIDTH_PX, GAUGE_HEIGHT_PX)
      .fill(GAUGE_BG_COLOR)
    if (healthRatio > 0) {
      gfx
        .rect(-GAUGE_WIDTH_PX / 2, HEALTH_OFFSET_Y, GAUGE_WIDTH_PX * healthRatio, GAUGE_HEIGHT_PX)
        .fill(HEALTH_FG_COLOR)
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
        onPendingDrag(unit.id, local.x, local.y)
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

  const from = attacker.position
  const to = attackDragState.target

  const dx = (to.x - from.x) * PIXELS_PER_INCH
  const dy = (to.y - from.y) * PIXELS_PER_INCH
  if (Math.sqrt(dx * dx + dy * dy) === 0) return

  const losBlocked = !hasLineOfSight(from, to, game.obstacles)
  const color = losBlocked ? TARGET_LINE_BLOCKED_COLOR : TARGET_LINE_COLOR

  gfx
    .moveTo(from.x * PIXELS_PER_INCH, from.y * PIXELS_PER_INCH)
    .lineTo(to.x * PIXELS_PER_INCH, to.y * PIXELS_PER_INCH)
    .stroke({ color, width: 2, alpha: 0.8 })
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
      const damageLayer = new Container()

      drawGrid(boardGfx)

      app.stage.eventMode = 'static'
      boardGfx.eventMode = 'static'

      app.stage.addChild(boardLayer)
      app.stage.addChild(arrowLayer)
      app.stage.addChild(unitsLayer)
      app.stage.addChild(damageLayer)

      const center = () => {
        const offsetX = Math.round((app.screen.width - BOARD_WIDTH_PX) / 2)
        const offsetY = Math.round((app.screen.height - BOARD_HEIGHT_PX) / 2)
        boardLayer.position.set(offsetX, offsetY)
        arrowLayer.position.set(offsetX, offsetY)
        unitsLayer.position.set(offsetX, offsetY)
        damageLayer.position.set(offsetX, offsetY)
      }

      center()
      app.renderer.on('resize', center)

      let pendingDrag: { unitId: UnitId; startX: number; startY: number } | null = null

      app.stage.on('pointermove', (e) => {
        const { dragState, updateDrag, attackDragState, updateAttackDrag, startDrag } = useGameStore.getState()
        const local = e.getLocalPosition(boardGfx)
        const pos = { x: local.x / PIXELS_PER_INCH, y: local.y / PIXELS_PER_INCH }
        if (pendingDrag !== null) {
          const dx = local.x - pendingDrag.startX
          const dy = local.y - pendingDrag.startY
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) {
            startDrag(pendingDrag.unitId, pos)
            pendingDrag = null
          }
        }
        if (dragState !== null) updateDrag(pos)
        if (attackDragState !== null) updateAttackDrag(pos)
      })

      app.stage.on('pointerup', () => {
        const { dragState, endDrag, attackDragState, endAttackDrag, selectUnit } = useGameStore.getState()
        if (pendingDrag !== null) {
          selectUnit(pendingDrag.unitId)
          pendingDrag = null
        } else if (dragState !== null) {
          endDrag()
        }
        if (attackDragState !== null) endAttackDrag()
      })

      const renderedFlashIds = new Set<string>()

      const spawnDamageFlash = (flash: DamageFlash) => {
        const text = new Text({
          text: `-${flash.amount}`,
          style: { fill: HEALTH_FG_COLOR, fontSize: DAMAGE_FLASH_FONT_SIZE, fontWeight: 'bold' },
        })
        const startX = flash.position.x * PIXELS_PER_INCH
        const startY = flash.position.y * PIXELS_PER_INCH - UNIT_RADIUS_PX
        text.anchor.set(0.5, 1)
        text.position.set(startX, startY)
        damageLayer.addChild(text)

        let age = 0
        const onTick = () => {
          age += app.ticker.deltaMS
          const t = Math.min(age / DAMAGE_FLASH_DURATION_MS, 1)
          text.y = startY - t * DAMAGE_FLASH_DRIFT_PX
          text.alpha = 1 - t
          if (t >= 1) {
            app.ticker.remove(onTick)
            damageLayer.removeChild(text)
            text.destroy()
            renderedFlashIds.delete(flash.id)
            useGameStore.getState().clearDamageFlash(flash.id)
          }
        }
        app.ticker.add(onTick)
      }

      const unsubscribe = useGameStore.subscribe(({ game, dragState, attackDragState, damageFlashes, selectedUnitId, startAttackDrag }) => {
        drawObstacles(obstaclesGfx, game.obstacles)
        drawUnits(
          unitsLayer,
          game,
          selectedUnitId,
          (id, x, y) => { pendingDrag = { unitId: id, startX: x, startY: y } },
          (id, x, y) => startAttackDrag(id, { x, y }),
        )
        drawArrow(arrowGfx, game, dragState)
        drawTargetLine(targetLineGfx, game, attackDragState)
        for (const flash of damageFlashes) {
          if (!renderedFlashIds.has(flash.id)) {
            renderedFlashIds.add(flash.id)
            spawnDamageFlash(flash)
          }
        }
      })

      const { game, dragState, attackDragState, selectedUnitId, startAttackDrag } = useGameStore.getState()
      drawObstacles(obstaclesGfx, game.obstacles)
      drawUnits(
        unitsLayer,
        game,
        selectedUnitId,
        (id, x, y) => { pendingDrag = { unitId: id, startX: x, startY: y } },
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
