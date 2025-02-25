// core/systems/health_system.js

import { System } from './system.js';

// core/systems/health_system.js
export class Health extends System {
    constructor() {
        super();
        this.livesDisplay = this.createPlayerLivesDisplay();
    }

    createPlayerLivesDisplay() {
        const display = document.createElement('div');
        display.style.position = 'fixed';
        display.style.top = '20px';
        display.style.left = '20px';
        display.style.display = 'flex';
        display.style.gap = '10px';
        display.style.zIndex = '1000';
        document.body.appendChild(display);
        return display;
    }

    update() {
        this.entities.forEach(entity => {
            const health = entity.getComponent('health');
            const visual = entity.getComponent('visual');

            if (!health || !visual) return;

            if (entity.getComponent('input')) {
                // Affichage des vies du joueur en haut à gauche
                this.updatePlayerLives(health);
            } else {
                // Affichage des points de vie au-dessus des ennemis
                this.updateEnemyHealth(visual, health);
            }
        });
    }

    updatePlayerLives(health) {
        this.livesDisplay.innerHTML = '';
        for (let i = 0; i < health.maxLives; i++) {
            const heart = document.createElement('div');
            heart.style.width = '20px';
            heart.style.height = '20px';
            heart.style.backgroundColor = i < health.currentLives ? 'red' : '#444';
            heart.style.borderRadius = '50%';
            this.livesDisplay.appendChild(heart);
        }
    }

    updateEnemyHealth(visual, health) {
        let healthBar = visual.div.querySelector('.health-dots');
        if (!healthBar) {
            healthBar = document.createElement('div');
            healthBar.className = 'health-dots';
            healthBar.style.position = 'absolute';
            healthBar.style.top = '-20px';
            healthBar.style.left = '50%';
            healthBar.style.transform = 'translateX(-50%)';
            healthBar.style.display = 'flex';
            healthBar.style.gap = '5px';
            healthBar.style.zIndex = '1000';
            visual.div.appendChild(healthBar);
        }

        healthBar.innerHTML = '';
        for (let i = 0; i < health.maxLives; i++) {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.backgroundColor = i < health.currentLives ? 'red' : '#444';
            dot.style.borderRadius = '50%';
            healthBar.appendChild(dot);
        }
    }
}