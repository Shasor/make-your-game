import { System } from './system.js';

export class Gravity extends System {
    constructor() {
        super();
        this.gravity = 1000;
    }

    update(deltaTime) {
        this.entities.forEach((entity) => {
            const velocity = entity.getComponent('velocity');
            const property = entity.getComponent('property');

            // Vérifier que les deux composants existent
            if (!velocity || !property) return;

            // Vérifier si l'entité doit être affectée par la gravité
            if (property.applyGravity) {
                velocity.vy -= this.gravity * deltaTime;
            }
        });
    }
}
