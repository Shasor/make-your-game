// core/systems/combat_system.js
import { System } from './system.js';

export class Combat extends System {
    constructor() {
        super();
    }

    update() {
        const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
        if (!player) return;

        const playerInput = player.getComponent('input');
        const playerHitbox = player.getComponent('circle_hitbox');
        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');

        if (!playerInput || !playerHitbox || !playerPos || !playerVisual) return;

        // Si le joueur attaque
        if (playerInput.attack1 || playerInput.attack2 || playerInput.attack3) {
            const playerCenter = playerHitbox.getCircleCenter(playerPos, playerVisual);

            this.entities.forEach((enemy) => {
                if (enemy === player) return;

                const enemyHitbox = enemy.getComponent('circle_hitbox');
                const enemyPos = enemy.getComponent('position');
                const enemyVisual = enemy.getComponent('visual');
                const enemyHealth = enemy.getComponent('health');
                const enemyAnimation = enemy.getComponent('animation');

                if (!enemyHitbox || !enemyPos || !enemyVisual || !enemyHealth || !enemyAnimation) return;

                const enemyCenter = enemyHitbox.getCircleCenter(enemyPos, enemyVisual);

                // Vérifier si l'ennemi est dans le rayon d'attaque melee
                const distance = Math.hypot(playerCenter.x - enemyCenter.x, playerCenter.y - enemyCenter.y);

                if (distance <= playerHitbox.meleeRadius) {
                    // Réduire la vie de l'ennemi
                    enemyHealth.currentLives--;

                    // Jouer l'animation de dégât
                    enemyAnimation.setState('hurt');

                    // Si l'ennemi n'a plus de vie
                    if (enemyHealth.currentLives <= 0) {
                        console.log("Enemy died!"); // Debug
                        enemyAnimation.setState('death');

                        // Utiliser la méthode centralisée pour compter les morts
                        if (this.game && this.game.incrementEnemyKillCount) {
                            this.game.incrementEnemyKillCount(enemy);
                        }

                        // Supprimer l'ennemi après la durée de l'animation
                        const deathDuration = (enemyAnimation.sequences.death.frames.length /
                            enemyAnimation.sequences.death.speed) * 1000;

                        setTimeout(() => {
                            this.game.removeEntity(enemy);
                        }, deathDuration);
                    }
                }
            });
        }
    }
}
