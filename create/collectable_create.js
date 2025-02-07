import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Collectible } from '../core/components/collectible_component.js';
import { Property } from '../core/components/property_component.js';

export function createCollectable(x = 0, y = 0, type = 'coin', value = 1, width = 20, height = 20, color = 'gold') {
    const collectable = new Entity();

    // Composants de base
    collectable.addComponent('position', new Position(x, y));
    collectable.addComponent('visual', new Visual(color, height, width));
    collectable.addComponent('collectible', new Collectible(type, value));
    collectable.addComponent('property', new Property(false, 0, false)); // Non mobile

    return collectable;
}