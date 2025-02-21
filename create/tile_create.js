// create/tile_create.js
import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Property } from '../core/components/property_component.js';
import { Tile } from '../core/components/tile_component.js';

export function createTile(gridX, gridY, tilesetX, tilesetY, properties = {}) {
  const tile = new Entity();
  const TILE_SIZE = 64; // Taille finale d'une tile (utilisez la valeur que vous voulez pour l'écartement)

  // Position basée sur la grille
  tile.addComponent('position', new Position(gridX * TILE_SIZE, gridY * TILE_SIZE));

  // La taille visuelle doit être la même que l'écartement
  tile.addComponent('visual', new Visual(null, TILE_SIZE, TILE_SIZE));

  // Les autres composants
  tile.addComponent('property', new Property(false, 0, properties.solid || false, 0, false));

  const tileComponent = new Tile();
  tileComponent.init('./assets/sprites/Tileset_Base.png');
  tileComponent.setTilePosition(tilesetX, tilesetY);
  tile.addComponent('tile', tileComponent);

  return tile;
}
