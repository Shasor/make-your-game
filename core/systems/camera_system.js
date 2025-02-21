// core/systems/camera_system.js
import { System } from './system.js';

export class Camera extends System {
    constructor() {
        super();
        this.container = document.querySelector('.container');
        this.gameWorld = document.createElement('div');
        this.gameWorld.className = 'game-world';
        this.container.appendChild(this.gameWorld);

        // Style the container as viewport
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';

        // Style the game world
        this.gameWorld.style.position = 'absolute';
        this.gameWorld.style.left = '0';
        this.gameWorld.style.top = '0';
        this.gameWorld.style.willChange = 'transform'; // Optimisation des performances
    }

    update() {
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const camera = player.getComponent('camera');
        const position = player.getComponent('position');
        const visual = player.getComponent('visual');

        if (!camera || !position || !visual) return;

        // Update camera position
        camera.follow(position.x, position.y, visual.width, visual.height);

        // Mettre à jour la position du monde avec un nombre entier de pixels
        const transformX = Math.round(-camera.x);
        const transformY = Math.round(-camera.y);

        // Appliquer la transformation avec translate3d pour la performance
        this.gameWorld.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

        // Mettre à jour la position des hitboxes debug si elles existent
        document.querySelectorAll('.debug-circle').forEach(circle => {
            // Appliquer la même transformation à chaque cercle de debug
            circle.style.transform = `translate3d(${-transformX}px, ${-transformY}px, 0)`;
        });
    }
}