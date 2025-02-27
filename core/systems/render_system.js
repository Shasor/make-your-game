import { System } from './system.js';

export class Render extends System {
    constructor(container) {
        super();
        this.container = container;
        this.gameWorld = this.container.querySelector('.game-world');
    }

    update() {
        // OPTIMISATION 1: Regrouper les modifications DOM
        const fragment = document.createDocumentFragment();
        const newEntities = [];

        this.entities.forEach((entity) => {
            const visual = entity.getComponent('visual');
            const position = entity.getComponent('position');

            if (!position || !visual) return;

            // Si le div existe déjà et est attaché au DOM, mettre à jour la position
            if (visual.div.parentElement) {
                visual.div.style.left = `${position.x}px`;
                visual.div.style.top = `${position.y}px`;
                return;
            }

            // Ne pas créer de div en double
            if (document.querySelector(`[uuid="${entity.uuid}"]`)) {
                console.warn(`Element already in DOM for entity ${entity.uuid}`);
                return;
            }

            // Création et style du div de l'entité
            visual.div.setAttribute('uuid', entity.uuid);
            visual.div.style.position = 'absolute';
            visual.div.style.left = `${position.x}px`;
            visual.div.style.top = `${position.y}px`;
            visual.div.style.width = `${visual.width}px`;
            visual.div.style.height = `${visual.height}px`;
            if (visual.bgColor) visual.div.style.backgroundColor = visual.bgColor;

            // Ajout au monde de jeu
            this.gameWorld.appendChild(visual.div);
        });

        // Ajouter le fragment au gameWorld en une seule opération
        if (newEntities.length > 0) {
            this.gameWorld.appendChild(fragment);
        }
    }
}