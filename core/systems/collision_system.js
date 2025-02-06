import { System } from './system.js';

export class Collision extends System {
  constructor() {
    super();
  }

  update() {
    const entitiesArray = Array.from(this.entities);

    for (let i = 0; i < entitiesArray.length; i++) {
      const entityA = entitiesArray[i];
      const posA = entityA.getComponent('position');
      const visualA = entityA.getComponent('visual');
      const velocityA = entityA.getComponent('velocity');

      if (!posA || !visualA) continue;

      for (let j = i + 1; j < entitiesArray.length; j++) {
        const entityB = entitiesArray[j];
        const posB = entityB.getComponent('position');
        const visualB = entityB.getComponent('visual');
        const velocityB = entityB.getComponent('velocity');

        if (!posB || !visualB) continue;

        if (this.isColliding(posA, visualA, posB, visualB)) {
          this.resolveCollision(posA, visualA, velocityA, posB, visualB, velocityB);
        }
      }
    }
  }

  isColliding(posA, visualA, posB, visualB) {
    return posA.x < posB.x + visualB.width && posA.x + visualA.width > posB.x && posA.y < posB.y + visualB.height && posA.y + visualA.height > posB.y;
  }

  resolveCollision(posA, visualA, velocityA, posB, visualB, velocityB) {
    const overlapX = Math.min(posA.x + visualA.width - posB.x, posB.x + visualB.width - posA.x);
    const overlapY = Math.min(posA.y + visualA.height - posB.y, posB.y + visualB.height - posA.y);

    if (overlapX < overlapY) {
      if (posA.x < posB.x) {
        posA.x -= overlapX / 2;
      } else {
        posA.x += overlapX / 2;
      }
      if (velocityA) velocityA.vx = 0;
      if (velocityB) velocityB.vx = 0;
    } else {
      if (posA.y < posB.y) {
        posA.y -= overlapY / 2;
      } else {
        posA.y += overlapY / 2;
      }
      if (velocityA) velocityA.vy = 0;
      if (velocityB) velocityB.vy = 0;
    }
  }
}
