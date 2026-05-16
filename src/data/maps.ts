import type { Obstacle } from '../domain/obstacle'

export type MapData = {
  obstacles: Obstacle[]
}

// Ruines urbaines 48"×48" — déploiement bord N (y=0–6) et bord S (y=42–48)
// 5 couloirs N–S : flancs (6"), entre ruine et bâtiment (4"), centre des U
export const LABYRINTH_MAP: MapData = {
  obstacles: [
    // ── Ruine NW — L ouvrant vers SE ─────────────────────────────────────
    { x: 6,  y: 10, width: 10, height: 2 },
    { x: 6,  y: 10, width: 2,  height: 8  },
    // ── Bâtiment Nord — U ouvert vers le sud ─────────────────────────────
    { x: 20, y: 10, width: 8,  height: 2  },
    { x: 20, y: 10, width: 2,  height: 8  },
    { x: 26, y: 10, width: 2,  height: 8  },
    // ── Ruine NE — L ouvrant vers SW ─────────────────────────────────────
    { x: 32, y: 10, width: 10, height: 2  },
    { x: 40, y: 10, width: 2,  height: 8  },
    // ── Murs isolés — brise-vues centraux ────────────────────────────────
    { x: 6,  y: 24, width: 10, height: 2  },
    { x: 32, y: 24, width: 10, height: 2  },
    // ── Ruine SW — L ouvrant vers NE ─────────────────────────────────────
    { x: 6,  y: 38, width: 10, height: 2  },
    { x: 6,  y: 30, width: 2,  height: 10 },
    // ── Bâtiment Sud — U ouvert vers le nord ─────────────────────────────
    { x: 20, y: 38, width: 8,  height: 2  },
    { x: 20, y: 30, width: 2,  height: 8  },
    { x: 26, y: 30, width: 2,  height: 8  },
    // ── Ruine SE — L ouvrant vers NW ─────────────────────────────────────
    { x: 32, y: 38, width: 10, height: 2  },
    { x: 40, y: 30, width: 2,  height: 10 },
  ],
}
