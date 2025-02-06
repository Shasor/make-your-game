import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Velocity } from '../core/components/velocity_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Input } from '../core/components/input_component.js';
import { Feature } from '../core/components/feature_component.js';
import { Health } from '../core/components/health_component.js';

export function createPlayer(x = 0, y = 0, width = 32, height = 32, movable = false, speed = 5, color = 'purple') {
  const entity = new Entity();
  entity.addComponent('position', new Position(x, y));
  entity.addComponent('velocity', new Velocity());
  entity.addComponent('visual', new Visual(color, height, width));
  entity.addComponent('input', new Input());
  entity.addComponent('feature', new Feature(movable, speed));
  entity.addComponent('health', new Health());
  return entity;
}
