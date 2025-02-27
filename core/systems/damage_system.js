// Dans core/systems/damage_system.js
import { System } from './system.js';

export class Damage extends System {
    constructor() {
        super();
        this.damageInterval = 1000; // 1 seconde entre chaque dégât
        this.lastDamageTime = new Map(); // Stocke le dernier moment où un ennemi a fait des dégâts
        this.contactTimes = new Map(); // Stocke le temps de contact avec chaque ennemi
        this.contactBreakTimes = new Map(); // Stocke quand le contact a été perdu
        this.requiredContactTime = 200; // 0.5 seconde de contact nécessaire
        this.contactMemory = 200; // Durée pendant laquelle un contact est "mémorisé" en ms
    }

    update() {
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const playerHitbox = player.getComponent('circle_hitbox');
        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');
        const playerHealth = player.getComponent('health');

        if (!playerHitbox || !playerPos || !playerVisual || !playerHealth) return;

        const playerCenter = playerHitbox.getCircleCenter(playerPos, playerVisual);
        const currentTime = Date.now();

        // Set pour suivre les ennemis actuellement en contact
        const currentContacts = new Set();

        this.entities.forEach(enemy => {
            if (enemy === player || enemy.getComponent('collectible')) return;

            const enemyHitbox = enemy.getComponent('circle_hitbox');
            const enemyPos = enemy.getComponent('position');
            const enemyVisual = enemy.getComponent('visual');

            if (!enemyHitbox || !enemyPos || !enemyVisual) return;

            const enemyCenter = enemyHitbox.getCircleCenter(enemyPos, enemyVisual);

            // Vérifier la collision
            const distance = Math.hypot(
                playerCenter.x - enemyCenter.x,
                playerCenter.y - enemyCenter.y
            );

            const inContact = distance <= (playerHitbox.collisionRadius + enemyHitbox.collisionRadius);

            if (inContact) {
                currentContacts.add(enemy.uuid);

                // Initialiser le temps de contact s'il n'existe pas
                if (!this.contactTimes.has(enemy.uuid)) {
                    this.contactTimes.set(enemy.uuid, currentTime);
                    //console.log(`Nouvel ennemi en contact: ${enemy.uuid}`);
                }

                // Réinitialiser le temps de perte de contact
                this.contactBreakTimes.delete(enemy.uuid);

                // Calculer la durée du contact
                const contactDuration = currentTime - this.contactTimes.get(enemy.uuid);
                //console.log(`Contact avec ${enemy.uuid}: ${contactDuration}ms / ${this.requiredContactTime}ms`);

                // Vérifier si le contact a duré assez longtemps
                if (contactDuration >= this.requiredContactTime) {
                    // Vérifier le cooldown des dégâts
                    const lastDamageTime = this.lastDamageTime.get(enemy.uuid) || 0;
                    if (currentTime - lastDamageTime >= this.damageInterval) {
                        // Appliquer les dégâts
                        playerHealth.currentLives--;
                        this.lastDamageTime.set(enemy.uuid, currentTime);

                        //console.log(`DÉGÂTS INFLIGÉS! Vie restante: ${playerHealth.currentLives}`);

                        // Vérifier si le joueur est mort
                        if (playerHealth.currentLives <= 0) {
                            //console.log("Le joueur est mort!");
                            if (this.game.handlePlayerDeath) {
                                setTimeout(() => this.game.handlePlayerDeath(), 500);
                            }
                        }
                    }
                }
            } else {
                // L'ennemi n'est pas en contact, mais était-il en contact récemment?
                if (this.contactTimes.has(enemy.uuid)) {
                    // Si c'est la première frame sans contact, enregistrer le temps
                    if (!this.contactBreakTimes.has(enemy.uuid)) {
                        this.contactBreakTimes.set(enemy.uuid, currentTime);
                    }

                    // Vérifier si l'interruption de contact est récente
                    const breakDuration = currentTime - this.contactBreakTimes.get(enemy.uuid);

                    if (breakDuration <= this.contactMemory) {
                        // Considérer comme toujours en contact pour les petites interruptions
                        currentContacts.add(enemy.uuid);
                        //console.log(`Contact mémorisé avec ${enemy.uuid}, interruption: ${breakDuration}ms`);
                    } else {
                        // Contact réellement perdu
                        //console.log(`Contact perdu avec ${enemy.uuid} après ${breakDuration}ms`);
                        this.contactTimes.delete(enemy.uuid);
                        this.contactBreakTimes.delete(enemy.uuid);
                    }
                }
            }
        });

        // Debug
        if (currentContacts.size > 0) {
            //console.log(`Ennemis en contact: ${currentContacts.size}`);
        }
    }
}