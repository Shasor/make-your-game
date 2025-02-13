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
      const property = entity.getComponent('property');
      const health = entity.getComponent('health');

      if (!animation || !visual) return;

      if (!animation.initialized && animation.spriteSheet.complete) {
        animation.initialized = true;
      }
      if (!animation.initialized) return;

      // Si déjà en animation de mort, ne pas changer d'état
      if (animation.currentState === 'death') {
        this.updateAnimation(animation, visual, deltaTime);
        return;
      }

      // Vérifier la mort
      if (health && health.currentHealth <= 0) {
        // console.log('Setting death animation');
        animation.setState('death');
        this.updateAnimation(animation, visual, deltaTime);
        return;
      }

      // Animations normales
      if (input && property) {
        // console.log('isPushing:', property.isPushing);
        // console.log('Current input vector:', input.vector.h);

        // Vérifier la condition de push en premier
        if (property.isPushing && input.vector.h !== 0) {
          // console.log('Setting push animation');
          animation.setState('push');
        } else if (input.attack1) {
          animation.setState('attack1');
        } else if (input.attack2) {
          animation.setState('attack2');
        } else if (input.attack3) {
          animation.setState('attack3');
        } else if (input.magicAttack) {
          animation.setState('magicAttack');
        } else if (input.arrowShoot) {
          animation.setState('arrowShoot');
        } else if (input.roll) {
          animation.setState('roulade');
        } else if (!property.isOnGround) {
          animation.setState('jump');
        } else if (input.vector.h !== 0) {
          animation.setState('run');
          animation.isFlipped = input.vector.h < 0;
        } else {
          animation.setState('idle');
        }
      }

      this.updateAnimation(animation, visual, deltaTime);
    });
  }

  updateAnimation(animation, visual, deltaTime) {
    animation.frameTimer += deltaTime;
    if (animation.frameTimer >= 1 / animation.sequences[animation.currentState].speed) {
      animation.frameTimer = 0;
      animation.currentFrame = (animation.currentFrame + 1) % animation.currentSequence.length;

      const frameNumber = animation.currentSequence[animation.currentFrame];
      const framePosition = animation.getFramePosition(frameNumber);

      visual.updateSprite(framePosition.x, framePosition.y, animation.isFlipped, animation.spriteSheet.src, animation.frameWidth, animation.frameHeight, animation.columns, animation.rows);
    }
  }
}
