//core/systems/movement_system.js
import { System } from './system.js';

export class Movement extends System {
  update() {
    this.entities.forEach((entity) => {
      const input = entity.getComponent('input');
      if (!input) return;
      input.update();
      const position = entity.getComponent('position');
      const velocity = entity.getComponent('velocity');
      const visual = entity.getComponent('visual');

      position.x += velocity.vx;
      position.y -= velocity.vy;
      visual.div.style.left = `${position.x}px`;
      visual.div.style.top = `${position.y}px`;
    });
  }
}
