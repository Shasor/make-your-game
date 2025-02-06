import { Component } from './component.js';

export class Collectible extends Component {
    constructor(type = 'coin', value = 1, isCollected = false) {
        super();
        this.type = type;         // Type de collect (coin, power-up, etc.)
        this.value = value;       // Value ou points awarded when collected
        this.isCollected = isCollected; // Etat de collection
    }

    collect() {
        if (!this.isCollected) {
            this.isCollected = true;
            return this.value;
        }
        return 0;
    }

    reset() {
        this.isCollected = false;
    }
}