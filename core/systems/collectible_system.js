// core/systems/collectible_system.js

import { System } from './system.js';


export class Collectible extends System {
    constructor() {
        super();
        this.score = 0;
    }

    update() {
        const player = Array.from(this.entities).find(entity => 
            entity.getComponent('input')
        );
        if (!player) return;

        this.entities.forEach(entity => {
            const collectible = entity.getComponent('collectible');
            const property = entity.getComponent('property');
            const visual = entity.getComponent('visual');

            if (!collectible || collectible.isCollected) return;

            if (property.isCollided) {
                console.log('Collectible collecté !');
                this.score += collectible.collect();
                console.log(this.score);
                // Supprimer le visuel
                if (visual && visual.div) {
                    visual.div.remove(); // Supprime l'élément du DOM
                }
                
                // Retirer l'entité de la liste des entités du système
                this.entities.delete(entity);
                
                // Émettre un événement personnalisé avec l'entité à supprimer
                const event = new CustomEvent('entityCollected', {
                    detail: { entity: entity }
                });
                document.dispatchEvent(event);
            }
  });
    }
}