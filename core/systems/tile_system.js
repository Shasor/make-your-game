// core/systems/tile_system.js
import { System } from './system.js';

export class TileSystem extends System {
    constructor() {
        super();
    }

    update() {
        this.entities.forEach(entity => {
            const tile = entity.getComponent('tile');
            const visual = entity.getComponent('visual');

            if (!tile || !visual) return;

            // Met à jour l'apparence de la tuile
            tile.updateVisual(visual);
        });
    }
}



