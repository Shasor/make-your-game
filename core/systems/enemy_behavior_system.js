// core/systems/enemy_behavior_system.js
import { System } from './system.js';

export class EnemyBehavior extends System {
    constructor() {
        super();
        this.detectionDelay = 0; // Délai avant de commencer à suivre le joueur
        this.moveSpeed = 300; // Vitesse de déplacement
        this.detectedPlayers = new Map(); // Pour tracker les joueurs détectés
    }

    update(deltaTime) {
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const playerPos = player.getComponent('position');
        const playerHitbox = player.getComponent('circle_hitbox');
        const playerVisual = player.getComponent('visual');

        if (!playerPos || !playerHitbox || !playerVisual) return;

        this.entities.forEach(enemy => {
            if (enemy === player) return;

            const enemyPos = enemy.getComponent('position');
            const enemyHitbox = enemy.getComponent('circle_hitbox');
            const enemyVisual = enemy.getComponent('visual');
            const enemyVelocity = enemy.getComponent('velocity');
            const enemyProperty = enemy.getComponent('property');
            const enemyAnimation = enemy.getComponent('animation');

            if (!enemyPos || !enemyHitbox || !enemyVisual || !enemyVelocity || !enemyProperty || !enemyAnimation) return;

            // Calculer les centres
            const playerCenter = {
                x: playerPos.x + playerVisual.width / 2,
                y: playerPos.y + playerVisual.height / 2
            };

            const enemyCenter = {
                x: enemyPos.x + enemyVisual.width / 2,
                y: enemyPos.y + enemyVisual.height / 2
            };

            // Calculer la distance
            const dx = playerCenter.x - enemyCenter.x;
            const dy = playerCenter.y - enemyCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Si le joueur est dans la zone de détection
            if (distance <= enemyHitbox.rangedRadius + playerHitbox.collisionRadius) {
                if (!this.detectedPlayers.has(enemy.uuid)) {
                    this.detectedPlayers.set(enemy.uuid, {
                        detectionTime: Date.now(),
                        isTracking: false
                    });
                }

                const detectionData = this.detectedPlayers.get(enemy.uuid);

                // Attendre le délai de détection
                if (Date.now() - detectionData.detectionTime >= this.detectionDelay) {
                    // Activer le mode "fantôme"
                    enemyProperty.applyGravity = false;
                    enemyProperty.movable = true;
                    detectionData.isTracking = true;

                    // Normaliser le vecteur de direction
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const dirX = dx / length;
                    const dirY = dy / length;

                    // Mettre à jour la vélocité
                    enemyVelocity.vx = dirX * this.moveSpeed;
                    enemyVelocity.vy = -dirY * this.moveSpeed; // Inverse car Y est inversé dans le jeu

                    // Mettre à jour l'animation et la direction du sprite
                    if (dx < 0) {
                        enemyAnimation.isFlipped = true;
                    } else {
                        enemyAnimation.isFlipped = false;
                    }

                    if (enemyAnimation.sequences.magic) {
                        enemyAnimation.setState('magic');
                    }
                }
            } else {
                // Réinitialiser si le joueur sort de la zone
                if (this.detectedPlayers.has(enemy.uuid)) {
                    const detectionData = this.detectedPlayers.get(enemy.uuid);
                    if (detectionData.isTracking) {
                        // Remettre les propriétés par défaut
                        enemyProperty.applyGravity = true;
                        enemyProperty.movable = false;
                        enemyVelocity.vx = 0;
                        enemyVelocity.vy = 0;

                        if (enemyAnimation.sequences.idle) {
                            enemyAnimation.setState('idle');
                        }
                    }
                    this.detectedPlayers.delete(enemy.uuid);
                }
            }
        });
    }
}