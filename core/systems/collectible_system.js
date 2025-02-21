// core/systems/collectible_system.js

import { System } from './system.js';

export class Collectible extends System {
  constructor() {
    super();
    this.score = 0;
  }

  update() {
    const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
    if (!player) return;

    this.entities.forEach((entity) => {
      const collectible = entity.getComponent('collectible');
      const property = entity.getComponent('property');
      const visual = entity.getComponent('visual');

      if (!collectible || collectible.isCollected) return;

      if (property.isCollided) {
        this.score += collectible.collect();
        // Supprimer l'entity de tous les systèmes (+ DOM)
        this.game.removeEntity(entity);
      }
    });
  }
}
