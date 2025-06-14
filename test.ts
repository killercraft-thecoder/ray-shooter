if (game.ask("Map 1?")) {
    tiles.setCurrentTilemap(tilemap`level1`)
} else {

    tiles.setCurrentTilemap(tilemap`level2`)
}
// nothing else , the rest is handled in the raytracer