import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Health } from '../core/components/health_component.js';
import { Property } from '../core/components/property_component.js';

export function createEnemy(x = 0, y = 0, width = 40, height = 40, maxHealth = 100, color = 'blue') {
  const enemy = new Entity();
  enemy.addComponent('position', new Position(x, y));
  enemy.addComponent('visual', new Visual(color, height, width));
  enemy.addComponent('health', new Health(maxHealth));
  enemy.addComponent('property', new Property(false, 0, true, 0, false)); // L'ennemi est immobile
  return enemy;
}
