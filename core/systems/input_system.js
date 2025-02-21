import { System } from './system.js';

export class Input extends System {
    update() {
        this.entities.forEach((entity) => {
            if (entity.components.has('input')) {
                const input = entity.getComponent('input');
                const velocity = entity.getComponent('velocity');
                const property = entity.getComponent('property');
                if (input && velocity && property.movable) {
                    velocity.vx = input.vector.h * property.speed;
                    if (input.vector.v > 0) {
                        input.vector.v = 0;
                        property.isOnGround = false;
                        velocity.vy = property.jumpStrength;
                    }
                }
            }
        });
    }
}

