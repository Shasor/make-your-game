import { Component } from './component.js';

export class Health extends Component {
    constructor(maxHealth = 100) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        return this.currentHealth <= 0;
    }

    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    reset() {
        this.currentHealth = this.maxHealth;
    }

    get healthPercentage() {
        return (this.currentHealth / this.maxHealth) * 100;
    }
}