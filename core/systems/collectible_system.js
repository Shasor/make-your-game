// core/systems/collectible_system.js
import { System } from './system.js';

export class Collectible extends System {
  constructor() {
    super();
    this.score = 0;
    // Créer et styliser l'affichage du score
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.position = 'fixed';
    this.scoreDisplay.style.top = '20px';
    this.scoreDisplay.style.right = '20px';
    this.scoreDisplay.style.fontSize = '24px';
    this.scoreDisplay.style.color = 'white';
    this.scoreDisplay.style.zIndex = '1000';
    document.body.appendChild(this.scoreDisplay);
    this.updateScoreDisplay();
  }

  update() {
    const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
    if (!player) return;

    this.entities.forEach((entity) => {
      const collectible = entity.getComponent('collectible');
      const property = entity.getComponent('property');

      if (!collectible || collectible.isCollected) return;

      if (property && property.isCollided) {
        this.score += collectible.collect();
        this.updateScoreDisplay();

        // Supprimer l'entité du jeu
        this.game.removeEntity(entity);
      }
    });
  }

  updateScoreDisplay() {
    this.scoreDisplay.textContent = `Score: ${this.score}`;
  }
}
