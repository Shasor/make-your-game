// core/systems/circle_hitbox_system.js
import { System } from './system.js';

export class CircleHitbox extends System {
    constructor() {
        super();
        this.DEBUG = true;
    }

    update() {
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');
        const playerHitbox = player.getComponent('circle_hitbox');
        const playerInput = player.getComponent('input');

        if (!playerHitbox || !playerPos || !playerVisual) return;

        const playerCenter = playerHitbox.getCenter(playerPos, playerVisual);

        if (this.DEBUG) {
            this.drawDebugCircles(playerCenter, playerHitbox);
        }

        this.entities.forEach(entity => {
            if (entity === player) return;

            const enemyPos = entity.getComponent('position');
            const enemyVisual = entity.getComponent('visual');
            const enemyHealth = entity.getComponent('health');

            if (!enemyPos || !enemyVisual || !enemyHealth) return;

            const enemyCenter = {
                x: enemyPos.x + (enemyVisual.width / 2),
                y: enemyPos.y + (enemyVisual.height / 2)
            };

            const distance = Math.sqrt(
                Math.pow(playerCenter.x - enemyCenter.x, 2) +
                Math.pow(playerCenter.y - enemyCenter.y, 2)
            );

            const isEnemyInDirection = (enemyCenter.x - playerCenter.x) *
                (playerInput.vector.h || playerVisual.div.style.transform === 'scaleX(-1)' ? -1 : 1) > 0;

            if (distance <= playerHitbox.meleeRadius && isEnemyInDirection) {
                if (playerInput.attack1) enemyHealth.takeDamage(20);
                if (playerInput.attack2) enemyHealth.takeDamage(30);
                if (playerInput.attack3) enemyHealth.takeDamage(40);
            }

            if (distance <= playerHitbox.rangedRadius && isEnemyInDirection) {
                if (playerInput.arrowShoot) enemyHealth.takeDamage(25);
                if (playerInput.magicAttack) enemyHealth.takeDamage(35);
            }

            if (enemyHealth.currentHealth <= 0) {
                const enemyAnimation = entity.getComponent('animation');
                if (enemyAnimation) {
                    enemyAnimation.setState('death');
                    setTimeout(() => {
                        if (enemyVisual.div) {
                            enemyVisual.div.remove();
                        }
                        this.game.removeEntity(entity);
                    }, 1000);
                }
            }
        });
    }

    drawDebugCircles(center, hitbox) {
        document.querySelectorAll('.debug-circle').forEach(el => el.remove());

        // Container pour les cercles
        const container = document.querySelector('.container');
        if (!container) return;

        const circles = [
            { radius: hitbox.terrainRadius, color: 'rgba(0, 255, 0, 0.2)' },
            { radius: hitbox.meleeRadius, color: 'rgba(255, 0, 0, 0.2)' },
            { radius: hitbox.rangedRadius, color: 'rgba(0, 0, 255, 0.2)' }
        ];

        circles.forEach(({ radius, color }) => {
            const circle = document.createElement('div');
            circle.className = 'debug-circle';
            circle.style.position = 'absolute';
            circle.style.width = `${radius * 2}px`;
            circle.style.height = `${radius * 2}px`;
            circle.style.backgroundColor = color;
            circle.style.borderRadius = '50%';

            // Ajuster la position pour centrer les cercles sur le personnage
            const leftPos = center.x - radius;
            const topPos = center.y - radius;

            circle.style.left = `${leftPos}px`;
            circle.style.top = `${topPos}px`;
            circle.style.pointerEvents = 'none';
            circle.style.zIndex = '1000'; // Pour s'assurer que les cercles sont visibles

            container.appendChild(circle);
        });
    }
}