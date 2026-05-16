import type { Obstacle } from '../domain/obstacle'
import type { MapZone } from '../domain/map-zone'
import { generateObstacles } from '../domain/map-obstacles'
import { BOARD_WIDTH_IN, BOARD_HEIGHT_IN } from '../domain/board'

export type MapData = {
  zones: MapZone[]
  obstacles: Obstacle[]
}

// Donjon 48"×48" — déploiement bord N (y=1–5) et bord S (y=43–47)
// 5 pièces (NW, NE, Centre, SW, SE) reliées par des couloirs
// Symétrie N↔S (axe y=24) et E↔O (axe x=24)
const DUNGEON_ZONES: MapZone[] = [
  // ── Salles de déploiement ──────────────────────────────────────────────
  { x: 3,  y: 1,  width: 42, height: 4,  type: 'room' },
  { x: 3,  y: 43, width: 42, height: 4,  type: 'room' },

  // ── Pièces Nord ────────────────────────────────────────────────────────
  { x: 5,  y: 10, width: 8,  height: 8,  type: 'room' },
  { x: 35, y: 10, width: 8,  height: 8,  type: 'room' },

  // ── Pièce centrale ─────────────────────────────────────────────────────
  { x: 20, y: 18, width: 8,  height: 12, type: 'room' },

  // ── Pièces Sud ─────────────────────────────────────────────────────────
  { x: 5,  y: 30, width: 8,  height: 8,  type: 'room' },
  { x: 35, y: 30, width: 8,  height: 8,  type: 'room' },

  // ── Couloirs verticaux — déploiement Nord → pièces ─────────────────────
  { x: 7,  y: 5,  width: 4,  height: 5,  type: 'corridor' },
  { x: 38, y: 5,  width: 4,  height: 5,  type: 'corridor' },
  { x: 22, y: 5,  width: 4,  height: 13, type: 'corridor' },

  // ── Couloirs horizontaux — pièces Nord → centre ────────────────────────
  { x: 13, y: 12, width: 10, height: 4,  type: 'corridor' },
  { x: 25, y: 12, width: 10, height: 4,  type: 'corridor' },

  // ── Couloirs verticaux — flancs (NW↔SW, NE↔SE) ────────────────────────
  { x: 7,  y: 18, width: 4,  height: 12, type: 'corridor' },
  { x: 38, y: 18, width: 4,  height: 12, type: 'corridor' },

  // ── Couloirs horizontaux — pièces Sud → centre ─────────────────────────
  { x: 13, y: 32, width: 10, height: 4,  type: 'corridor' },
  { x: 25, y: 32, width: 10, height: 4,  type: 'corridor' },

  // ── Couloirs verticaux — pièces → déploiement Sud ──────────────────────
  { x: 7,  y: 38, width: 4,  height: 5,  type: 'corridor' },
  { x: 38, y: 38, width: 4,  height: 5,  type: 'corridor' },
  { x: 22, y: 30, width: 4,  height: 13, type: 'corridor' },
]

export const LABYRINTH_MAP: MapData = {
  zones: DUNGEON_ZONES,
  obstacles: generateObstacles(DUNGEON_ZONES, BOARD_WIDTH_IN, BOARD_HEIGHT_IN),
}
