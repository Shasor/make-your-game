// core/systems/kill_counter_system.js
import { System } from './system.js';
import { KillCounter } from '../components/kill_counter_component.js';

export class KillCounterSystem extends System {
    constructor() {
        super();
        this.killCounter = new KillCounter();
    }

    update() {
        // Mettre à jour l'affichage avec la valeur globale du compteur
        if (this.game && this.game.globalStats) {
            this.killCounter.updateDisplay(this.game.globalStats.enemiesKilled);
        }
    }
}