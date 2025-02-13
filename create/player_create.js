import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Velocity } from '../core/components/velocity_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Input } from '../core/components/input_component.js';
import { Property } from '../core/components/property_component.js';
import { Health } from '../core/components/health_component.js';
import { Damage } from '../core/components/damage_component.js';
import { PlayerAnimation } from '../core/components/animation_component.js';
import { CircleHitbox } from '../core/components/circle_hitbox_component.js';


export function createPlayer(x = 150, y = 150, width = 64, height = 64, color = null) {
    const entity = new Entity();
    entity.addComponent('position', new Position(x, y));
    entity.addComponent('velocity', new Velocity());
    entity.addComponent('visual', new Visual(color, height, width));
    entity.addComponent('input', new Input());
    entity.addComponent('property', new Property(true, 7, false, 12, true));
    entity.addComponent('health', new Health(100));
    entity.addComponent('damage', new Damage(10));
    entity.addComponent('animation', new PlayerAnimation());
    entity.addComponent('circle_hitbox', new CircleHitbox(
        0,  // offsetX: décalage horizontal depuis le coin supérieur gauche (width/2 pour centrer)
        0,  // offsetY: décalage vertical depuis le coin supérieur gauche (peut être ajusté selon le sprite)
        15,  // terrainRadius: rayon de collision avec le terrain
        60, // meleeRadius: rayon des attaques au corps à corps
        150  // rangedRadius: rayon des attaques à distance
    ));
    return entity;
}
