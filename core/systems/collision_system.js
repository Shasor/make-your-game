// core/systems/collision_system.js
import { System } from './system.js';

export class Collision extends System {
    update() {
        const entities = Array.from(this.entities);

        // Réinitialiser l'état de collision pour toutes les entités
        entities.forEach((entity) => {
            const property = entity.getComponent('property');
            if (property) {
                property.isCollided = false;
            }
        });

        // Traiter les collisions pour chaque entité
        for (const entity of entities) {
            const position = entity.getComponent('position');
            const visual = entity.getComponent('visual');
            const velocity = entity.getComponent('velocity');
            const property = entity.getComponent('property');
            const hitbox = entity.getComponent('circle_hitbox');
            const input = entity.getComponent('input');

            if (!position || !visual || !velocity) continue;

            // Traiter différemment les entités avec et sans hitbox circulaire
            if (hitbox) {
                this.handleCircleCollisions(entity, entities);
            } else {
                this.handleRectangleCollisions(entity, entities);
            }
        }
    }

    handleCircleCollisions(entity, entities) {
        const position = entity.getComponent('position');
        const visual = entity.getComponent('visual');
        const velocity = entity.getComponent('velocity');
        const property = entity.getComponent('property');
        const hitbox = entity.getComponent('circle_hitbox');
        const input = entity.getComponent('input');

        const circleCenter = hitbox.getCircleCenter(position, visual);
        const circleRadius = hitbox.collisionRadius;

        // 1. Collisions avec les tiles
        for (const other of entities) {
            if (entity === other || !other.getComponent('tile')) continue;

            const tilePos = other.getComponent('position');
            const tileVisual = other.getComponent('visual');
            const tileProperty = other.getComponent('property');

            if (!tilePos || !tileVisual || !tileProperty.solid) continue;

            const rect = {
                left: tilePos.x,
                right: tilePos.x + tileVisual.width,
                top: tilePos.y,
                bottom: tilePos.y + tileVisual.height,
            };

            const closestPoint = {
                x: Math.max(rect.left, Math.min(circleCenter.x, rect.right)),
                y: Math.max(rect.top, Math.min(circleCenter.y, rect.bottom)),
            };

            const dx = circleCenter.x - closestPoint.x;
            const dy = circleCenter.y - closestPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < circleRadius) {
                if (distance === 0) continue;

                const overlap = circleRadius - distance;
                const normalX = dx / distance;
                const normalY = dy / distance;

                if (Math.abs(normalX) > 0.7) {
                    velocity.vx = 0;
                    position.x = position.x + normalX * overlap;
                }

                if (Math.abs(normalY) > 0.7) {
                    if (normalY < 0) {
                        property.isOnGround = true;
                        if (input) input.jump = 0;
                    }
                    velocity.vy = 0;
                    position.y = position.y + normalY * overlap;
                }

                visual.div.style.left = `${position.x}px`;
                visual.div.style.top = `${position.y}px`;
            }
        }

        // 2. Collisions avec les autres entités circulaires
        for (const other of entities) {
            if (entity === other || other.getComponent('tile')) continue;

            const posB = other.getComponent('position');
            const visualB = other.getComponent('visual');
            const hitboxB = other.getComponent('circle_hitbox');
            const propertyB = other.getComponent('property');

            if (!hitboxB) continue;

            const centerB = hitboxB.getCircleCenter(posB, visualB);
            const dx = centerB.x - circleCenter.x;
            const dy = centerB.y - circleCenter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const minDistance = circleRadius + hitboxB.collisionRadius;
            if (distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;
                const normalX = dx / distance;
                const normalY = dy / distance;

                const moveRatio = propertyB?.movable ? 0.5 : 1;

                position.x -= normalX * overlap * moveRatio;
                position.y -= normalY * overlap * moveRatio;

                if (propertyB?.movable) {
                    posB.x += normalX * overlap * moveRatio;
                    posB.y += normalY * overlap * moveRatio;
                    visualB.div.style.left = `${posB.x}px`;
                    visualB.div.style.top = `${posB.y}px`;
                }

                visual.div.style.left = `${position.x}px`;
                visual.div.style.top = `${position.y}px`;

                property.isCollided = true;
                propertyB.isCollided = true;
            }
        }
    }

    handleRectangleCollisions(entity, entities) {
        const position = entity.getComponent('position');
        const visual = entity.getComponent('visual');
        const property = entity.getComponent('property');

        const player = entities.find((e) => e.getComponent('input'));
        if (!player) return;

        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');

        if (this.checkRectCollision(position.x, position.y, visual.width, visual.height,
            playerPos.x, playerPos.y, playerVisual.width, playerVisual.height)) {
            property.isCollided = true;
        }
    }

    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
}