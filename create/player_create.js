import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Velocity } from '../core/components/velocity_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Input } from '../core/components/input_component.js';
import { Property } from '../core/components/property_component.js';
import { Health } from '../core/components/health_component.js';
import { Damage } from '../core/components/damage_component.js';

export function createPlayer(x = 150, y = 150, width = 64, height = 64, color = 'red') {
    const entity = new Entity();
    entity.addComponent('position', new Position(x, y));
    entity.addComponent('velocity', new Velocity());
    entity.addComponent('visual', new Visual(color, height, width));
    entity.addComponent('input', new Input());
    entity.addComponent('property', new Property(true, 7, false, 12, true));
    entity.addComponent('health', new Health(100));
    entity.addComponent('damage', new Damage(10));
    return entity;
}
