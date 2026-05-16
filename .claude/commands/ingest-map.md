Ingest the following map JSON and add it as a new named export in `src/data/maps.ts`.

Map JSON: $ARGUMENTS

## Input format

```ts
{ width: number; height: number; walls: [number, number][] }
```

- `width` / `height` : dimensions de la grille en cases
- `walls` : liste de positions `[x, y]` non-franchissables (murs)

## Steps

1. **Ask for a name** if none is given in `$ARGUMENTS` (e.g. "CASTLE_MAP"). Use it as the export identifier.

2. **Read `src/data/maps.ts`** to understand the existing style and imports.

3. **Add a conversion helper** `obstaclesFromWalls` in `src/data/maps.ts` (private, not exported) if it does not already exist:

```ts
function obstaclesFromWalls(
  width: number,
  height: number,
  walls: [number, number][],
): Obstacle[] {
  const wallSet = new Set(walls.map(([x, y]) => `${x},${y}`))
  const walkable: boolean[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => !wallSet.has(`${x},${y}`)),
  )
  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  )
  const obstacles: Obstacle[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (walkable[y]![x] || visited[y]![x]) continue
      let w = 0
      while (x + w < width && !walkable[y]![x + w] && !visited[y]![x + w]) w++
      let h = 1
      while (y + h < height) {
        let fits = true
        for (let dx = 0; dx < w; dx++) {
          if (walkable[y + h]![x + dx] || visited[y + h]![x + dx]) { fits = false; break }
        }
        if (!fits) break
        h++
      }
      for (let dy = 0; dy < h; dy++)
        for (let dx = 0; dx < w; dx++)
          visited[y + dy]![x + dx] = true
      obstacles.push({ x, y, width: w, height: h })
    }
  }
  return obstacles
}
```

4. **Add the new map constant** at the end of the file:

```ts
export const <NAME>_MAP: MapData = {
  zones: [],
  obstacles: obstaclesFromWalls(<width>, <height>, <walls>),
}
```

Fill in `<NAME>`, `<width>`, `<height>`, and `<walls>` from the parsed JSON.

## Constraints

- Ne modifier que `src/data/maps.ts`.
- Ne pas toucher à `generateObstacles` ni à aucun fichier domain.
- Ne pas exporter `obstaclesFromWalls`.
- Si `obstaclesFromWalls` existe déjà, ne pas le recréer.
- Vérifier que les imports `Obstacle` et `MapData` sont présents en tête de fichier.
