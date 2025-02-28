// core/systems/boundary_system.js
import { System } from './system.js';

export class BoundarySystem extends System {
    constructor() {
        super();
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.messageShown = false;
        this.deathMessage = "Tu vivras à jamais dans les ténèbres";
    }

    // Méthode pour définir les dimensions de la carte
    setMapBoundaries(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
        console.log(`Map boundaries set: ${width}x${height}`);
    }

    update() {
        // Trouver le joueur
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const position = player.getComponent('position');
        const visual = player.getComponent('visual');
        const health = player.getComponent('health');
        const animation = player.getComponent('animation');

        if (!position || !visual || !health || !animation) return;

        // Vérifier si le joueur est hors des limites de la carte
        const outOfBounds =
            position.x < -100 ||
            position.x > this.mapWidth + 100 ||
            position.y < -100 ||
            position.y > this.mapHeight + 100;

        if (outOfBounds && health.currentLives > 0) {
            console.log("Joueur hors limites, déclenchement de la mort");

            // Tuer le joueur
            health.currentLives = 0;

            // Définir l'animation de mort
            animation.setState('death');

            // Afficher le message de mort
            this.showDeathMessage();

            // Après un délai, gérer la mort du joueur
            setTimeout(() => {
                if (this.game.handlePlayerDeath) {
                    this.game.handlePlayerDeath();
                }
            }, 3000); // Attendre 3 secondes
        }
    }

    showDeathMessage() {
        if (this.messageShown) return;

        // Créer un élément pour afficher le message
        const messageEl = document.createElement('div');
        messageEl.textContent = this.deathMessage;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '50%';
        messageEl.style.left = '50%';
        messageEl.style.transform = 'translate(-50%, -50%)';
        messageEl.style.color = '#ff0000';
        messageEl.style.fontSize = '32px';
        messageEl.style.fontFamily = "'Press Start 2P', sans-serif";
        messageEl.style.textAlign = 'center';
        messageEl.style.textShadow = '2px 2px 4px #000';
        messageEl.style.zIndex = '9999';
        messageEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageEl.style.padding = '20px';
        messageEl.style.borderRadius = '10px';
        messageEl.style.animation = 'fadeIn 1s';

        // Ajouter le style d'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(messageEl);
        this.messageShown = true;

        // Supprimer le message après quelques secondes
        setTimeout(() => {
            document.body.removeChild(messageEl);
            document.head.removeChild(style);
            this.messageShown = false;
        }, 4000);
    }
}