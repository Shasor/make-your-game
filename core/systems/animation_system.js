// core/systems/animation_system.js
import { System } from './system.js';

export class Animation extends System {
    constructor() {
        super();
        this.lastTime = performance.now();
    }

    // Nouvelle méthode pour initialiser les événements
    setGame(game) {
        super.setGame(game);
        // Maintenant on peut s'abonner aux événements car this.game existe
        this.game.eventBus.on('entityDeath', this.handleEntityDeath.bind(this));
    }

    handleEntityDeath(entity) {
        const animation = entity.getComponent('animation');
        const property = entity.getComponent('property');

        if (!animation || !property) return;

        animation.setState('death');
        property.solid = false;
        property.movable = false;

        // Si ce n'est pas le joueur, c'est un ennemi qui meurt
        if (!entity.getComponent('input')) {
            // Utiliser la méthode centralisée pour compter les morts
            if (this.game && this.game.incrementEnemyKillCount) {
                this.game.incrementEnemyKillCount(entity);
            }

            const deathDuration = (animation.sequences.death.frames.length /
                animation.sequences.death.speed) * 1000;

            setTimeout(() => {
                this.game.removeEntity(entity);
            }, deathDuration);
        }
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

            // Si déjà en animation de mort
            if (animation.currentState === 'death') {
                this.updateAnimation(animation, visual, deltaTime);
                return;
            }

            // Vérifier la mort
            if (health && health.currentLives <= 0) {
                this.game.eventBus.emit('entityDeath', entity);
                return;
            }

            // Pour les entités en knockback, maintenir l'animation 'hurt'
            if (health && health.isBeingKnockedBack) {
                animation.setState('hurt');
            } else {
                // Animations normales
                if (input && property) {
                    if (property.isPushing && input.vector.h !== 0) {
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
            }
            this.updateAnimation(animation, visual, deltaTime);
        });
    }

    updateAnimation(animation, visual, deltaTime) {
        // Vérifier si le div existe toujours 
        if (!visual || !visual.div) {
            console.error("Visual div missing for entity with animation", animation);
            return;
        }

        // Vérifier si le div est attaché au DOM
        if (!visual.div.parentElement) {
            console.warn("Visual div not in DOM, re-adding to game world");
            this.game.gameWorld.appendChild(visual.div);
        }

        animation.frameTimer += deltaTime;
        if (animation.frameTimer >= 1 / animation.sequences[animation.currentState].speed) {
            animation.frameTimer = 0;
            animation.currentFrame = (animation.currentFrame + 1) % animation.currentSequence.length;

            const frameNumber = animation.currentSequence[animation.currentFrame];
            const framePosition = animation.getFramePosition(frameNumber);

            visual.updateSprite(
                framePosition.x,
                framePosition.y,
                animation.isFlipped,
                animation.spriteSheet.src,
                animation.frameWidth,
                animation.frameHeight,
                animation.columns,
                animation.rows
            );
        }
    }
}