// core/systems/circle_hitbox_system.js
import { System } from './system.js';

export class CircleHitbox extends System {
    constructor() {
        super();
        this.gameWorld = document.querySelector('.game-world');
    }

    update() {
        this.entities.forEach(entity => {
            const hitbox = entity.getComponent('circle_hitbox');
            const position = entity.getComponent('position');
            const visual = entity.getComponent('visual');
            const property = entity.getComponent('property');

            if (!hitbox || !position || !visual || !property) return;

            // Initialiser les cercles si nécessaire
            if (!hitbox.circles.collision) {
                hitbox.initDebugCircles(this.gameWorld);
            }

            // Mettre à jour la position des cercles
            const center = hitbox.getCircleCenter(position, visual);
            Object.values(hitbox.circles).forEach(circle => {
                if (circle) {
                    circle.style.left = `${center.x}px`;
                    circle.style.top = `${center.y}px`;
                }
            });

            // Vérifier les collisions avec d'autres entités
            this.checkEntityCollisions(entity, hitbox, center, property);
        });
    }

    checkEntityCollisions(entity1, hitbox1, center1, property1) {
        this.entities.forEach(entity2 => {
            if (entity1 === entity2) return;

            const hitbox2 = entity2.getComponent('circle_hitbox');
            const position2 = entity2.getComponent('position');
            const visual2 = entity2.getComponent('visual');
            const property2 = entity2.getComponent('property');

            if (!hitbox2 || !position2 || !visual2 || !property2) return;

            const center2 = hitbox2.getCircleCenter(position2, visual2);

            // Vérifier la collision physique
            if (hitbox1.checkCollision(center1, center2, hitbox1.collisionRadius, hitbox2.collisionRadius)) {
                property1.isCollided = true;
                property2.isCollided = true;
            }

            // Si c'est le joueur, vérifier aussi les zones d'attaque
            const input = entity1.getComponent('input');
            if (input) {
                if ((input.attack1 || input.attack2 || input.attack3) &&
                    hitbox1.checkCollision(center1, center2, hitbox1.meleeRadius, hitbox2.collisionRadius)) {
                    property2.isCollided = true;
                }
                if ((input.magicAttack || input.arrowShoot) &&
                    hitbox1.checkCollision(center1, center2, hitbox1.rangedRadius, hitbox2.collisionRadius)) {
                    property2.isCollided = true;
                }
            }
        });
    }
}

