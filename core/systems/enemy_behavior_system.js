// core/systems/enemy_behavior_system.js
import { System } from './system.js';

export class EnemyBehavior extends System {
    constructor() {
        super();
        this.detectionDelay = 0; // Délai avant de commencer à suivre le joueur
        this.moveSpeed = 250; // Vitesse de déplacement
        this.detectedPlayers = new Map(); // Pour tracker les joueurs détectés
        this.isDetect = {};
        this.lastDetectionSoundTime = {}; // Pour éviter de jouer le son trop souvent
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
            const enemyAudio = enemy.getComponent('audio');

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
            const wasDetected = this.isDetect.bool && this.isDetect.enemy === enemy;
            const isNowDetected = distance <= enemyHitbox.rangedRadius + playerHitbox.collisionRadius;

            if (isNowDetected) {
                this.isDetect = { enemy: enemy, bool: true };

                // Jouer le son de détection uniquement lors de la première détection
                if (!wasDetected) {
                    this.playDetectionSound(enemy, enemyAudio);
                }
            }

            if (this.isDetect.bool && this.isDetect.enemy === enemy) {
                this.track(enemy, enemyProperty, enemyVelocity, enemyAnimation, dx, dy);
            }
        });
    }

    // Nouvelle méthode pour jouer le son de détection
    playDetectionSound(enemy, enemyAudio) {
        // Vérifier si l'ennemi a un composant audio
        if (!enemyAudio) return;

        // Éviter de jouer le son trop souvent (1.5 secondes minimum entre les sons)
        const now = Date.now();
        if (!this.lastDetectionSoundTime[enemy.uuid] ||
            now - this.lastDetectionSoundTime[enemy.uuid] > 1500) {

            // Mettre à jour le timestamp
            this.lastDetectionSoundTime[enemy.uuid] = now;

            // Émettre l'événement pour que le système audio puisse le gérer
            if (this.game && this.game.eventBus) {
                this.game.eventBus.emit('enemyDetection', enemy);
            } else {
                // Si pas d'event bus, tenter de jouer directement
                if (enemyAudio.sounds.has('enemy_detection')) {
                    enemyAudio.playSound('enemy_detection', { volume: 1.0 });
                }
            }
        }
    }

    track(enemy, enemyProperty, enemyVelocity, enemyAnimation, dx, dy) {
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
    }
}