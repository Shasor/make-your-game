import { Component } from './component.js';

export class Health extends Component {
  constructor(maxHealth) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  takeDamage(amount) {
    this.currentHealth -= amount;
    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      return true; // Indique que l'entité est morte
    }
    return false;
  }

  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  reset() {
    this.currentHealth = this.maxHealth;
  }

  getHealthPercentage() {
    return (this.currentHealth / this.maxHealth) * 100;
  }
}
