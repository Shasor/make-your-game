import { System } from './system.js';

export class Gravity extends System {
  constructor() {
    super();
    this.gravity = 0.5;
  }

  update() {
    this.entities.forEach((entity) => {
      const velocity = entity.getComponent('velocity');
      const property = entity.getComponent('property');
      if (!property.applyGravity || property.isOnGround) return;
      velocity.vy -= this.gravity;
    });
  }
}
