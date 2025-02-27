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

            // Limiter la vitesse maximale pour éviter des sauts trop grands
            const maxSpeed = 3000; // Vitesse maximale en pixels par seconde
            velocity.vx = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.vx));
            velocity.vy = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.vy));

            // Mettre à jour la position
            position.x += velocity.vx * deltaTime;
            position.y -= velocity.vy * deltaTime;

            // Assurer que le div existe et est attaché au DOM
            if (!visual.div) {
                console.error("Visual div missing for entity", entity.uuid);
                return;
            }

            if (!visual.div.parentElement) {
                console.warn("Visual div not in DOM, re-adding to game world");
                if (this.game && this.game.gameWorld) {
                    this.game.gameWorld.appendChild(visual.div);
                }
            }

            // IMPORTANT: Toujours mettre à jour la position visuelle
            visual.div.style.left = `${position.x}px`;
            visual.div.style.top = `${position.y}px`;

            // Si l'entité est en knockback
            if (health?.isBeingKnockedBack) {
                // Vérifier si le knockback est terminé
                if (Date.now() - health.knockbackStartTime >= health.knockbackDuration) {
                    health.isBeingKnockedBack = false;

                    // Arrêter la vélocité
                    velocity.vx = 0;
                    velocity.vy = 0;
                } else {
                    // Appliquer un amortissement pendant le knockback
                    velocity.vx *= 0.95;
                    velocity.vy *= 0.95;
                }
            }

            // Mise à jour des inputs seulement si pas en knockback
            entity.getComponent('input')?.update();
        });
    }
}
