// core/components/circle_hitbox_component.js
import { Component } from './component.js';

export class CircleHitbox extends Component {
    constructor(offsetX = 0, offsetY = 0, terrainRadius = 20, meleeRadius = 100, rangedRadius = 200) {
        super();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.terrainRadius = terrainRadius;
        this.meleeRadius = meleeRadius;
        this.rangedRadius = rangedRadius;
    }

    getCenter(position, visual) {
        // Calculer le centre en prenant en compte la taille réelle du sprite
        return {
            x: position.x + (visual.width / 2) + this.offsetX,
            y: position.y + (visual.height / 2) + this.offsetY + (visual.height / 4) // Ajustement vertical pour mieux correspondre au centre du sprite
        };
    }
}