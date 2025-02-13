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
      const propertyA = entityA.getComponent('property');
      const inputA = entityA.getComponent('input');

      if (!posA || !visualA || !velocityA) continue;

      for (let j = 0; j < entitiesArray.length; j++) {
        const entityB = entitiesArray[j];
        const posB = entityB.getComponent('position');
        const visualB = entityB.getComponent('visual');
        const propertyB = entityB.getComponent('property');

        if (!posB || !visualB || entityA === entityB) continue;

        if (this.isColliding(posA, visualA, posB, visualB)) {
          propertyA.isOnGround = false;
          propertyB.isCollided = true;
          if (!propertyB.solid) continue;
          this.resolveCollision(posA, visualA, velocityA, propertyA, inputA, posB, visualB, propertyB);
        }
      }
    }
  }

  isColliding(posA, visualA, posB, visualB) {
    return posA.x < posB.x + visualB.width && posA.x + visualA.width > posB.x && posA.y < posB.y + visualB.height && posA.y + visualA.height > posB.y;
  }

  resolveCollision(posA, visualA, velocityA, propertyA, inputA, posB, visualB, propertyB) {
    const rectA = {
      left: posA.x,
      right: posA.x + visualA.width,
      top: posA.y,
      bottom: posA.y + visualA.height,
    };
    const rectB = {
      left: posB.x,
      right: posB.x + visualB.width,
      top: posB.y,
      bottom: posB.y + visualB.height,
    };
    // overlaps calculs
    const overlapX = Math.min(rectA.right - rectB.left, rectB.right - rectA.left);
    const overlapY = Math.min(rectA.bottom - rectB.top, rectB.bottom - rectA.top);
    // collision resolution
    if (overlapX < overlapY) {
      // Collision horizontale
      if (posA.x < posB.x) {
        posA.x = rectB.left - visualA.width;
        // propertyA.collisionStates.isOnRightWall = true;
      } else {
        posA.x = rectB.right;
        // propertyA.collisionStates.isOnLeftWall = true;
      }
      velocityA.vx = 0;
    } else {
      // Collision verticale
      if (posA.y < posB.y) {
        posA.y = rectB.top - visualA.height;
        propertyA.isOnGround = true;
        if (inputA) inputA.jump = 0;
      } else {
        posA.y = rectB.bottom;
        // propertyA.collisionStates.isOnCeiling = true;
      }
      velocityA.vy = 0;
    }
    // Mise à jour immédiate de la position
    visualA.div.style.left = `${posA.x}px`;
    visualA.div.style.top = `${posA.y}px`;
  }
}
