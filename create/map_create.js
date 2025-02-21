import { fetchMap } from '../utils/utils.js';
import { createPlayer } from './player_create.js';
import { createTile } from './tile_create.js';

const TILE_SIZE = 32;

export async function createMap(game, path) {
  const map = await fetchMap(path);
  const ratio = TILE_SIZE / map.metadata.tileSize;

  let tiles = map.layers[0].data.tiles;
  for (const tile of tiles) {
    if (tile.properties.solid) {
      const entity = createTile(tile.x * ratio, tile.y * ratio, TILE_SIZE, TILE_SIZE, 'assets/sprites/world_tileset.png', tile.tx, tile.ty);
      game.addEntity(entity);
    }
  }
  const player = createPlayer();
  game.addEntity(player);

  game.currentMap = path.split('/')[path.split('/').length - 1];
}
