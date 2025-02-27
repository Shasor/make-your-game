// core/components/circle_hitbox_component.js
import { Component } from './component.js';

export class CircleHitbox extends Component {
    constructor(offsetX = 0, offsetY = 0, collisionRadius = 15, meleeRadius = 60, rangedRadius = 150) {
        super();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.collisionRadius = collisionRadius;
        this.meleeRadius = meleeRadius;
        this.rangedRadius = rangedRadius;
        this.excludedFromRanged = false;
        this.circles = {
            collision: null,
            melee: null,
            ranged: null
        };
    }

    initDebugCircles(gameWorld) {
        this.circles.collision = this.createCircle('collision', this.collisionRadius, 'transparent');
        this.circles.melee = this.createCircle('melee', this.meleeRadius, 'transparent');
        this.circles.ranged = this.createCircle('ranged', this.rangedRadius, 'transparent');

        Object.values(this.circles).forEach(circle => {
            if (circle) gameWorld.appendChild(circle);
        });
    }

    createCircle(type, radius, color) {
        const circle = document.createElement('div');
        circle.className = `hitbox-circle ${type}`;
        circle.style.position = 'absolute';
        circle.style.width = `${radius * 2}px`;
        circle.style.height = `${radius * 2}px`;
        circle.style.backgroundColor = color;
        circle.style.borderRadius = '50%';
        circle.style.pointerEvents = 'none';
        circle.style.transform = 'translate(-50%, -50%)';
        return circle;
    }

    getCircleCenter(position, visual) {
        return {
            x: position.x + (visual.width / 2) + this.offsetX,
            y: position.y + (visual.height / 2) + this.offsetY
        };
    }

    checkCollision(center1, center2, radius1, radius2) {
        const dx = center2.x - center1.x;
        const dy = center2.y - center1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (radius1 + radius2);
    }

    removeDebugCircles() {
        Object.values(this.circles).forEach(circle => {
            if (circle && circle.parentNode) {
                circle.parentNode.removeChild(circle);
            }
        });
    }
}
