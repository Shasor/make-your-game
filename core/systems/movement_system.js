//core/systems/movement_system.js
import { System } from './system.js';

export class Movement extends System {
    update(deltaTime) {
        this.entities.forEach((entity) => {
            const position = entity.getComponent('position');
            const velocity = entity.getComponent('velocity');
            const visual = entity.getComponent('visual');
            const health = entity.getComponent('health');

            if (!position || !velocity || !visual) return;

            // Mettre à jour la position même pendant le knockback
            position.x += velocity.vx * deltaTime;
            position.y -= velocity.vy * deltaTime;

            // Appliquer un amortissement à la vélocité si en knockback
            if (health?.isBeingKnockedBack) {
                velocity.vx *= 0.95;
                velocity.vy *= 0.95;
            }

            // Mettre à jour la position visuelle
            visual.div.style.left = `${position.x}px`;
            visual.div.style.top = `${position.y}px`;

            // Mise à jour des inputs seulement si pas en knockback
            entity.getComponent('input')?.update();
        });
    }
}
