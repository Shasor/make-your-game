import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Property } from '../core/components/property_component.js';

export function createTile(x = 0, y = 0, width = 0, height = 0, color = 'pink') {
  const tile = new Entity();
  tile.addComponent('position', new Position(x, y));
  tile.addComponent('visual', new Visual(color, height, width));
  tile.addComponent('property', new Property(false, 0, true, 0, false)); // Non déplaçable, vitesse 0, solide
  return tile;
}
