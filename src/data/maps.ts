import type { Obstacle } from '../domain/obstacle'

export type MapData = {
  obstacles: Obstacle[]
}

// Labyrinthe 48"×48" — murs de 2", couloirs de 6"
export const LABYRINTH_MAP: MapData = {
  obstacles: [
    // ── Murs horizontaux ──────────────────────────────────────────────────
    { x: 0,  y: 8,  width: 18, height: 2 }, // haut gauche
    { x: 24, y: 8,  width: 24, height: 2 }, // haut droite
    { x: 8,  y: 16, width: 14, height: 2 }, // rang 2 gauche
    { x: 28, y: 16, width: 14, height: 2 }, // rang 2 droite
    { x: 0,  y: 24, width: 10, height: 2 }, // rang 3 bord gauche
    { x: 16, y: 24, width: 16, height: 2 }, // rang 3 centre
    { x: 38, y: 24, width: 10, height: 2 }, // rang 3 bord droit
    { x: 8,  y: 32, width: 16, height: 2 }, // rang 4 gauche
    { x: 30, y: 32, width: 18, height: 2 }, // rang 4 droite
    { x: 0,  y: 40, width: 22, height: 2 }, // bas gauche
    { x: 28, y: 40, width: 20, height: 2 }, // bas droite

    // ── Murs verticaux ────────────────────────────────────────────────────
    { x: 8,  y: 0,  width: 2, height: 14 }, // col 1 haut
    { x: 22, y: 0,  width: 2, height: 20 }, // col centre-gauche haut
    { x: 38, y: 0,  width: 2, height: 14 }, // col droite haut
    { x: 8,  y: 18, width: 2, height: 10 }, // col 1 milieu
    { x: 16, y: 10, width: 2, height: 10 }, // col intérieure gauche
    { x: 32, y: 10, width: 2, height: 12 }, // col intérieure droite
    { x: 44, y: 10, width: 2, height: 18 }, // col bord droit
    { x: 22, y: 26, width: 2, height: 12 }, // col centre milieu-bas
    { x: 36, y: 26, width: 2, height: 12 }, // col droite milieu-bas
    { x: 8,  y: 34, width: 2, height: 14 }, // col 1 bas
    { x: 44, y: 34, width: 2, height: 14 }, // col bord droit bas
  ],
}
