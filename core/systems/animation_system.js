// core/systems/animation_system.js
import { System } from './system.js';

export class Animation extends System {
  constructor() {
    super();
    this.lastTime = performance.now();
  }

  update(deltaTime) {
    this.entities.forEach((entity) => {
      const animation = entity.getComponent('animation');
      const visual = entity.getComponent('visual');
      const input = entity.getComponent('input');

      if (!animation || !visual) return;

      if (!animation.initialized && animation.spriteSheet.complete) {
        animation.initialized = true;
      }

      if (!animation.initialized) return;

      // Gestion des états d'animation pour le player
      if (input) {
        if (!entity.getComponent('property').isOnGround) {
          animation.setState('jump');
        } else if (input.vector.h !== 0) {
          animation.setState('run');
          animation.isFlipped = input.vector.h < 0;
        } else {
          animation.setState('idle');
        }
      }

      // Mise à jour de l'animation
      animation.frameTimer += deltaTime;
      if (animation.frameTimer >= 1 / animation.sequences[animation.currentState].speed) {
        animation.frameTimer = 0;
        animation.currentFrame = (animation.currentFrame + 1) % animation.currentSequence.length;

        const frameNumber = animation.currentSequence[animation.currentFrame];
        const framePosition = animation.getFramePosition(frameNumber);

        visual.updateSprite(framePosition.x, framePosition.y, animation.isFlipped, animation.spriteSheet.src, animation.frameWidth, animation.frameHeight, animation.columns, animation.rows);
      }
    });
  }
}
