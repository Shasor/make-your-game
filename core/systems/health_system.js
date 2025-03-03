// core/systems/health_system.js

import { System } from './system.js';

// core/systems/health_system.js
export class Health extends System {
    constructor() {
      super();
      this.livesDisplay = this.createPlayerLivesDisplay();
      this.prevLivesPlayer = 3;
      this.updatePlayerLives(this.prevLivesPlayer);
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

          if (entity.getComponent('input') && health.currentLives !== this.prevLivesPlayer) {
            this.prevLivesPlayer = health.currentLives;
            // Affichage des vies du joueur en haut à gauche
            this.updatePlayerLives(health.currentLives);
          }
        });
    }

    updatePlayerLives(health) {
      this.livesDisplay.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('div');
        heart.style.width = '20px';
        heart.style.height = '20px';
        heart.style.backgroundColor = i < health ? 'red' : '#444';
        heart.style.borderRadius = '50%';
        this.livesDisplay.appendChild(heart);
      }
    }
}