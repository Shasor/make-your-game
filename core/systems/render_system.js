import { System } from './system.js';

export class Render extends System {
    constructor() {
        super();
        this.container = document.querySelector('.container');
        this.gameWorld = this.container.querySelector('.game-world');
    }

    update() {
        this.entities.forEach((entity) => {
            const visual = entity.getComponent('visual');
            if (!visual || visual.div.parentElement) return;

            const position = entity.getComponent('position');
            if (!position) return;

            // Create and style the entity's div
            visual.div.setAttribute('uuid', entity.uuid);
            visual.div.style.position = 'absolute';
            visual.div.style.left = `${position.x}px`;
            visual.div.style.top = `${position.y}px`;
            visual.div.style.width = `${visual.width}px`;
            visual.div.style.height = `${visual.height}px`;
            if (visual.bgColor) visual.div.style.backgroundColor = visual.bgColor;

            // Add to game world instead of container
            this.gameWorld.appendChild(visual.div);
        });
    }
}