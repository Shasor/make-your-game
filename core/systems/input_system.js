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
          velocity.vy = input.vector.v * property.speed;
        }
      }
    });
  }
}
