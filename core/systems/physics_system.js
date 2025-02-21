// core/systems/physics_system.js
import { System } from './system.js';


export class PhysicsSystem extends System {
    constructor() {
        super();
        this.defaultGravity = 1000;
        this.waterGravity = -500;  // Gravité inversée pour l'eau
        this.waterJumpStrength = -425; // Force de saut inversée dans l'eau
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            const property = entity.getComponent('property');
            const position = entity.getComponent('position');
            const velocity = entity.getComponent('velocity');

            if (!property || !position || !velocity) return;

            // Vérifier les tuiles environnantes
            const surroundingTiles = this.getSurroundingTiles(position);

            // Gestion de l'eau
            if (surroundingTiles.some(tile => tile.isWater)) {
                property.applyGravity = true;
                property.jumpStrength = this.waterJumpStrength;
                velocity.vy = Math.max(velocity.vy, -200); // Limite la vitesse dans l'eau

                const animation = entity.getComponent('animation');
                if (animation && animation.sequences.swim) {
                    animation.setState('swim');
                }
            }

            // Gestion de la gelée
            if (surroundingTiles.some(tile => tile.isJelly)) {
                property.applyGravity = false;
                velocity.vy = 0;

                const animation = entity.getComponent('animation');
                if (animation && animation.sequences.climb) {
                    animation.setState('climb');
                }
            }

            // Gestion du patinage
            if (surroundingTiles.some(tile => tile.isSlippery)) {
                velocity.vx *= 0.98; // Réduction plus lente de la vitesse horizontale
                property.speed *= 0.5; // Réduction de la vitesse de déplacement
            }
        });
    }

    getSurroundingTiles(position) {
        // Logique pour obtenir les tuiles autour d'une position
        // À implémenter selon votre système de grille
        return [];
    }
}