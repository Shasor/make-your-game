//create/collectable_create.js
import { Entity } from '../core/entities/entity.js';
import { Position } from '../core/components/position_component.js';
import { Visual } from '../core/components/visual_component.js';
import { Collectible } from '../core/components/collectible_component.js';
import { Property } from '../core/components/property_component.js';
import { CoinAnimation } from '../core/components/animation_component.js';
import { CircleHitbox } from '../core/components/circle_hitbox_component.js';
import { Audio } from '../core/components/audio_component.js'

export function createCollectable(x = 0, y = 0, type = 'coin', value = 1) {
    const collectable = new Entity();

    // Taille standard pour un collectible
    const width = 48;
    const height = 48;

    // Composants de base
    collectable.addComponent('position', new Position(x, y));
    collectable.addComponent('visual', new Visual('transparent', height, width));
    collectable.addComponent('collectible', new Collectible(type, value));
    collectable.addComponent('property', new Property(false, 0, false));
    collectable.addComponent('audio', new Audio());

    // Ajouter le hitbox circulaire
    // Petit rayon de collision pour une meilleure précision
    collectable.addComponent('circle_hitbox', new CircleHitbox(
        0,  // offsetX centré
        0, // offsetY centré
        20,       // rayon de collision
        0,        // pas de rayon d'attaque corps à corps
        0         // pas de rayon d'attaque à distance
    ));

    // Sélection de l'animation en fonction du type
    switch (type) {
        case 'coin':
            collectable.addComponent('animation', new CoinAnimation());
            break;
        default:
            collectable.addComponent('animation', new CoinAnimation());
    }

    return collectable;
}