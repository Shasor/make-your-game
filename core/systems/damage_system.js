import { System } from './system.js';

export class Damage extends System {
    constructor() {
        super();
        this.lastDamageTime = 0;
        this.damageInterval = 1000; // 1 seconde entre chaque dégât
    }

    update() {
        const currentTime = Date.now();

        this.entities.forEach((entity) => {
            const damageComponent = entity.getComponent('damage');
            const healthComponent = entity.getComponent('health');
            const propertyComponent = entity.getComponent('property');

            // Vérifie si l'entité a les composants nécessaires et si elle est en collision
            if (damageComponent && healthComponent && propertyComponent && propertyComponent.isCollided) {
                // Vérifie si assez de temps s'est écoulé depuis le dernier dégât
                if (currentTime - this.lastDamageTime >= this.damageInterval) {
                    console.log('Health before damage:', healthComponent.currentHealth);
                    const isDead = healthComponent.takeDamage(damageComponent.damageAmount);
                    console.log('Health after damage:', healthComponent.currentHealth);

                    if (isDead) {
                        this.handleDeath(entity);
                    }

                    this.lastDamageTime = currentTime;
                }
            }

            // Réinitialise l'état de collision pour le prochain frame
            if (propertyComponent) {
                propertyComponent.isCollided = false;
            }
        });
    }

    handleDeath(entity) {
        const visual = entity.getComponent('visual');
        const property = entity.getComponent('property');

        if (visual && visual.div) {
            visual.div.style.opacity = '0.5';
            visual.div.style.transition = 'all 0.3s';
        }

        if (property) {
            property.movable = false;
        }
    }
}