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
      if (!property.applyGravity) return;
      velocity.vy -= this.gravity * deltaTime;
    });
  }
}
