import { System } from './system.js';

export class Health extends System {
  update() {
    this.entities.forEach((entity) => {
      const health = entity.getComponent('health');
      const visual = entity.getComponent('visual');
      const property = entity.getComponent('property');

      if (!health) return;

      // Vérifie si l'entité est morte (santé à 0)
      if (health.currentHealth <= 0) {
        this.handleDeath(visual, property);
      }

      // Mise à jour visuelle de la barre de vie si elle existe
      this.updateHealthBar(visual, health);
    });
  }

  handleDeath(visual, property) {
    // Si l'entité a un élément visuel, on peut l'animer ou le faire disparaître
    if (visual.div) {
      // Ajout d'une classe pour l'animation de mort
      visual.div.style.opacity = '0.5';
      visual.div.style.transition = 'all 0.3s';

      // On pourrait aussi le faire disparaître complètement
      // visual.div.style.display = 'none';
    }

    // Désactive les composants de l'entité
    if (property) property.movable = false;

    // On pourrait aussi retirer l'entité du jeu plus tard
    // this.entities.delete(entity);
  }

  updateHealthBar(visual, health) {
    if (!visual.div) return;

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