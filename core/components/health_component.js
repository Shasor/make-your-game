import { Component } from './component.js';

export class Health extends Component {
    constructor(maxLives = 3) {
        super();
        this.maxLives = maxLives;
        this.currentLives = maxLives;
        this.isBeingKnockedBack = false;
        this.knockbackStartTime = 0;
        this.knockbackDuration = 400; // Même durée que la roulade
    }

    takeDamage(amount, knockbackDirection = { x: 0, y: 0 }) {
        if (this.isBeingKnockedBack) return false;

        this.currentLives = Math.max(0, this.currentLives - amount);
        this.isBeingKnockedBack = true;
        this.knockbackStartTime = Date.now();

        return this.currentLives <= 0;
    }

    updateKnockback() {
        if (this.isBeingKnockedBack &&
            Date.now() - this.knockbackStartTime >= this.knockbackDuration) {
            this.isBeingKnockedBack = false;
        }
    }

    reset() {
        this.currentLives = this.maxLives;
        this.isBeingKnockedBack = false;
        this.knockbackStartTime = 0;
    }
}
