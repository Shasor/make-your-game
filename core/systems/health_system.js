import { System } from './system.js';

export class Health extends System {
    update() {
        this.entities.forEach((entity) => {
            const health = entity.getComponent('health');
            const visual = entity.getComponent('visual');

            if (!health) return;

            // Mise à jour visuelle de la barre de vie si elle existe
            this.updateHealthBar(visual, health);
        });
    }

    updateHealthBar(visual, health) {
        if (!visual || !visual.div) return;

        // Crée ou récupère la barre de vie
        let healthBar = visual.div.querySelector('.health-bar');

        if (!healthBar) {
            // Création du conteneur de la barre de vie
            healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            healthBar.style.position = 'absolute';
            healthBar.style.top = '-10px';
            healthBar.style.left = '0';
            healthBar.style.width = '100%';
            healthBar.style.height = '5px';
            healthBar.style.backgroundColor = '#333';

            // Création de la barre de progression
            const healthFill = document.createElement('div');
            healthFill.className = 'health-fill';
            healthFill.style.width = '100%';
            healthFill.style.height = '100%';
            healthFill.style.backgroundColor = '#00ff00';
            healthFill.style.transition = 'width 0.3s ease-in-out';

            healthBar.appendChild(healthFill);
            visual.div.appendChild(healthBar);
        }

        // Mise à jour de la barre de vie
        const healthFill = healthBar.querySelector('.health-fill');
        const percentage = health.getHealthPercentage();
        healthFill.style.width = `${percentage}%`;

        // Change la couleur en fonction du niveau de vie
        if (percentage > 60) {
            healthFill.style.backgroundColor = '#00ff00'; // Vert
        } else if (percentage > 30) {
            healthFill.style.backgroundColor = '#ffff00'; // Jaune
        } else {
            healthFill.style.backgroundColor = '#ff0000'; // Rouge
        }
    }
}