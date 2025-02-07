import { System } from './system.js';

export class Collision extends System {
  update() {
    const entitiesArray = Array.from(this.entities);

    for (let i = 0; i < entitiesArray.length; i++) {
      const entityA = entitiesArray[i];
      const posA = entityA.getComponent('position');
      const visualA = entityA.getComponent('visual');
      const velocityA = entityA.getComponent('velocity');

      if (!posA || !visualA || !velocityA) continue;

      for (let j = i + 1; j < entitiesArray.length; j++) {
        const entityB = entitiesArray[j];
        const posB = entityB.getComponent('position');
        const visualB = entityB.getComponent('visual');
        const velocityB = entityB.getComponent('velocity');

        if (!posB || !visualB) continue;

        if (this.isColliding(posA, visualA, posB, visualB)) {
          this.resolveCollision(entityA, posA, visualA, velocityA, posB, visualB, velocityB);
        }
      }
    }
  }

  isColliding(posA, visualA, posB, visualB) {
    return posA.x < posB.x + visualB.width && posA.x + visualA.width > posB.x && posA.y < posB.y + visualB.height && posA.y + visualA.height > posB.y;
  }

  resolveCollision(entityA, posA, visualA, velocityA, posB, visualB, velocityB) {
    const overlapX = Math.min(posA.x + visualA.width - posB.x, posB.x + visualB.width - posA.x);
    const overlapY = Math.min(posA.y + visualA.height - posB.y, posB.y + visualB.height - posA.y);
    if (overlapX < overlapY) {
      if (posA.x > posB.x) posA.x = posB.x + visualB.width;
      else posA.x = posB.x - visualA.width;
      velocityA.x = 0;
    } else {
      if (posA.y > posB.y) posA.y = posB.y + visualB.height;
      else posA.y = posB.y - visualA.height;
      velocityA.y = 0;
    }
    entityA.div.style.top = `${posA.y}px`;
    entityA.div.style.left = `${posA.x}px`;
  }
}
