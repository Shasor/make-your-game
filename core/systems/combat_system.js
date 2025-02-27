// core/systems/combat_system.js
import { System } from './system.js';

export class Combat extends System {
    constructor() {
        super();
    }

    update() {
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const playerInput = player.getComponent('input');
        const playerHitbox = player.getComponent('circle_hitbox');
        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');

        if (!playerInput || !playerHitbox || !playerPos || !playerVisual) return;

        // Si le joueur attaque
        if (playerInput.attack1 || playerInput.attack2 || playerInput.attack3) {
            //console.log("Player is attacking!");  // Debug
            const playerCenter = playerHitbox.getCircleCenter(playerPos, playerVisual);

            // Déterminer la force de recul en fonction du type d'attaque
            let knockbackForce = 20; // Force de base

            if (playerInput.attack1) knockbackForce = 20;
            if (playerInput.attack2) knockbackForce = 20;
            if (playerInput.attack3) knockbackForce = 20;

            this.entities.forEach(enemy => {
                if (enemy === player) return;

                const enemyHitbox = enemy.getComponent('circle_hitbox');
                const enemyPos = enemy.getComponent('position');
                const enemyVisual = enemy.getComponent('visual');
                const enemyHealth = enemy.getComponent('health');
                const enemyAnimation = enemy.getComponent('animation');
                const enemyVelocity = enemy.getComponent('velocity');

                if (!enemyHitbox || !enemyPos || !enemyVisual || !enemyHealth ||
                    !enemyAnimation || !enemyVelocity) return;

                const enemyCenter = enemyHitbox.getCircleCenter(enemyPos, enemyVisual);

                // Vérifier si l'ennemi est dans le rayon d'attaque melee
                const distance = Math.hypot(
                    playerCenter.x - enemyCenter.x,
                    playerCenter.y - enemyCenter.y
                );

                if (distance <= playerHitbox.meleeRadius) {
                    //console.log("Enemy in range! Current health:", enemyHealth.currentLives); // Debug

                    // Réduire la vie de l'ennemi
                    enemyHealth.currentLives--;

                    // Jouer l'animation de dégât
                    enemyAnimation.setState('hurt');

                    // Calculer la direction du knockback (à partir du joueur vers l'ennemi)
                    const knockbackDirX = enemyCenter.x - playerCenter.x;
                    const knockbackDirY = enemyCenter.y - playerCenter.y;

                    // Normaliser le vecteur de direction
                    const length = Math.sqrt(knockbackDirX * knockbackDirX + knockbackDirY * knockbackDirY);
                    const normalizedDirX = length > 0 ? knockbackDirX / length : 0;
                    const normalizedDirY = length > 0 ? knockbackDirY / length : 0;

                    // Appliquer la force de knockback (ajuster selon les besoins)
                    enemyVelocity.vx = normalizedDirX * knockbackForce;
                    enemyVelocity.vy = -normalizedDirY * knockbackForce; // Négatif car Y est inversé

                    // Marquer que l'ennemi est en knockback
                    if (enemyHealth.isBeingKnockedBack !== undefined) {
                        enemyHealth.isBeingKnockedBack = true;
                        enemyHealth.knockbackStartTime = Date.now();
                    }

                    //console.log("Enemy health after hit:", enemyHealth.currentLives); // Debug

                    // Si l'ennemi n'a plus de vie
                    if (enemyHealth.currentLives <= 0) {
                        //console.log("Enemy died!"); // Debug
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