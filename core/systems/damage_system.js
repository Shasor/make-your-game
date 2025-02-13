import { System } from './system.js';

export class Damage extends System {
    constructor() {
        super();
        this.lastDamageTime = 0;
        this.damageInterval = 1000;
    }

    update() {
        const currentTime = Date.now();

        this.entities.forEach((entity) => {
            const damageComponent = entity.getComponent('damage');
            const healthComponent = entity.getComponent('health');
            const propertyComponent = entity.getComponent('property');
            const animation = entity.getComponent('animation');
            const input = entity.getComponent('input');

            if (!damageComponent || !healthComponent || !propertyComponent || !animation) return;

            // Si déjà mort et en train de jouer l'animation de mort, ne rien faire
            if (healthComponent.currentHealth <= 0 && animation.currentState === 'death') {
                return;
            }

            if (propertyComponent.isCollided && currentTime - this.lastDamageTime >= this.damageInterval) {
                const isDead = healthComponent.takeDamage(damageComponent.damageAmount);
                this.lastDamageTime = currentTime;

                if (isDead && animation.sequences.death) {
                    console.log('Entity died, playing death animation'); // Debug log
                    propertyComponent.movable = false;
                    propertyComponent.solid = false;
                    animation.setState('death');

                    // Pour le joueur
                    if (input) {
                        const animationDuration = (animation.sequences.death.frames.length / animation.sequences.death.speed) * 1000;
                        setTimeout(() => this.restartGame(entity), animationDuration);
                    }
                }
            }

            propertyComponent.isCollided = false;
        });
    }

    restartGame(playerEntity) {
        const position = playerEntity.getComponent('position');
        const velocity = playerEntity.getComponent('velocity');
        const health = playerEntity.getComponent('health');
        const property = playerEntity.getComponent('property');
        const animation = playerEntity.getComponent('animation');

        position.x = 150;
        position.y = 150;

        velocity.vx = 0;
        velocity.vy = 0;

        health.reset();

        property.movable = true;
        property.isOnGround = false;

        animation.setState('idle');

        const visual = playerEntity.getComponent('visual');
        if (visual && visual.div) {
            visual.div.style.top = `${position.y}px`;
            visual.div.style.left = `${position.x}px`;
        }
    }
}