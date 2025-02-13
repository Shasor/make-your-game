import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Property } from '../core/components/property_component.js';
import { Health } from '../core/components/health_component.js';
import { Damage } from '../core/components/damage_component.js';
import { SatiroAnimation } from '../core/components/animation_component.js';
import { Velocity } from '../core/components/velocity_component.js';

export function createEnemy(x = 0, y = 0, width = 40, height = 40, maxHealth = 100, color = 'blue') {
  const enemy = new Entity();
  // Composants de base
  enemy.addComponent('position', new Position(x, y));
  enemy.addComponent('velocity', new Velocity());
  enemy.addComponent('visual', new Visual(color, height, width));
  enemy.addComponent('health', new Health(maxHealth));
  enemy.addComponent('property', new Property(false, 0, true, 0, true));
  enemy.addComponent('damage', new Damage(10));
  enemy.addComponent('animation', new SatiroAnimation());
  return enemy;
}
