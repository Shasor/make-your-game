//core/systems/movement_system.js
import { System } from './system.js';

export class Movement extends System {
  update(deltaTime) {
    this.entities.forEach((entity) => {
      entity.getComponent('input')?.update();
      const position = entity.getComponent('position');
      const velocity = entity.getComponent('velocity');
      const visual = entity.getComponent('visual');

      if (!position || !velocity || !visual) return;

      position.x += velocity.vx * deltaTime;
      position.y -= velocity.vy * deltaTime;
      visual.div.style.left = `${position.x}px`;
      visual.div.style.top = `${position.y}px`;
    });
  }
}
