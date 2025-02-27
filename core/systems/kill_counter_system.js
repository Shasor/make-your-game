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

    showKillEffect() {
        // Créer un élément pour l'effet
        const effect = document.createElement('div');
        effect.textContent = '+1';
        effect.style.position = 'fixed';
        effect.style.top = '90px'; // Même hauteur que le compteur
        effect.style.right = '150px'; // À gauche du compteur
        effect.style.color = '#FF0000';
        effect.style.fontSize = '20px';
        effect.style.fontFamily = "'Press Start 2P', sans-serif";
        effect.style.zIndex = '1001';
        effect.style.opacity = '1';
        effect.style.transition = 'top 1s, opacity 1s';

        document.body.appendChild(effect);

        // Animation de l'effet
        setTimeout(() => {
            effect.style.top = '65px';
            effect.style.opacity = '0';

            // Supprimer l'effet après l'animation
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 1000);
        }, 50);
    }
}