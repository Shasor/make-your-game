// core/systems/collectible_system.js
import { System } from './system.js';

export class Collectible extends System {
    constructor() {
        super();
        this.score = 0; // Pour suivre le score total
        this.collectedItems = new Set(); // Pour suivre les objets collectés
    }

    update() {
        const player = Array.from(this.entities).find(entity =>
            entity.getComponent('input') !== undefined
        );

        if (!player) return;

        const playerPos = player.getComponent('position');
        const playerVisual = player.getComponent('visual');

        if (!playerPos || !playerVisual) return;

        this.entities.forEach(entity => {
            const collectible = entity.getComponent('collectible');
            if (!collectible || collectible.isCollected) return;

            const entityPos = entity.getComponent('position');
            const entityVisual = entity.getComponent('visual');

            if (!entityPos || !entityVisual) return;

            // Vérifie la collision
            if (this.checkCollision(
                playerPos, playerVisual,
                entityPos, entityVisual
            )) {
                this.collect(entity, collectible);
            }
        });
    }

    checkCollision(pos1, visual1, pos2, visual2) {
        return pos1.x < pos2.x + visual2.width &&
            pos1.x + visual1.width > pos2.x &&
            pos1.y < pos2.y + visual2.height &&
            pos1.y + visual1.height > pos2.y;
    }

    collect(entity, collectible) {
        if (collectible.isCollected) return;

        // Marque l'objet comme collecté
        collectible.isCollected = true;
        this.collectedItems.add(entity);

        // Met à jour le score
        this.score += collectible.value;

        // Effet visuel de collecte
        if (entity.div) {
            // Animation de collecte
            entity.div.style.transition = 'all 0.3s';
            entity.div.style.transform = 'scale(0)';
            entity.div.style.opacity = '0';

            // Effet de points qui montent
            this.showFloatingPoints(entity, collectible.value);
        }

        // Applique les effets selon le type
        this.applyEffects(entity, collectible);

        // Mise à jour du score dans l'UI
        this.updateScoreDisplay();

        // Supprime l'entité après l'animation
        setTimeout(() => {
            if (entity.div) {
                entity.div.remove();
            }
            this.entities.delete(entity);
        }, 300);
    }

    showFloatingPoints(entity, points) {
        const pointsDiv = document.createElement('div');
        pointsDiv.textContent = `+${points}`;
        pointsDiv.style.position = 'absolute';
        pointsDiv.style.left = `${entity.getComponent('position').x}px`;
        pointsDiv.style.top = `${entity.getComponent('position').y}px`;
        pointsDiv.style.color = 'gold';
        pointsDiv.style.fontWeight = 'bold';
        pointsDiv.style.transition = 'all 0.5s';
        pointsDiv.style.zIndex = '1000';

        document.querySelector('.container').appendChild(pointsDiv);

        // Animation de montée
        setTimeout(() => {
            pointsDiv.style.transform = 'translateY(-20px)';
            pointsDiv.style.opacity = '0';
        }, 0);

        // Suppression après l'animation
        setTimeout(() => {
            pointsDiv.remove();
        }, 500);
    }

    applyEffects(entity, collectible) {
        // Trouve le joueur
        const player = Array.from(this.entities).find(e =>
            e.getComponent('input') !== undefined
        );

        if (!player) return;

        switch (collectible.type) {
            case 'coin':
                // Déjà géré par le score
                break;
            case 'health':
                const health = player.getComponent('health');
                if (health) {
                    health.heal(collectible.value);
                }
                break;
            case 'speed':
                const property = player.getComponent('property');
                if (property) {
                    const originalSpeed = property.speed;
                    property.speed *= collectible.value;
                    // Retour à la vitesse normale après 5 secondes
                    setTimeout(() => {
                        property.speed = originalSpeed;
                    }, 5000);
                }
                break;
            // Ajoutez d'autres types selon vos besoins
        }
    }

    updateScoreDisplay() {
        let scoreDisplay = document.querySelector('.score-display');
        if (!scoreDisplay) {
            scoreDisplay = document.createElement('div');
            scoreDisplay.className = 'score-display';
            scoreDisplay.style.position = 'fixed';
            scoreDisplay.style.top = '20px';
            scoreDisplay.style.right = '20px';
            scoreDisplay.style.fontSize = '24px';
            scoreDisplay.style.color = 'gold';
            scoreDisplay.style.fontWeight = 'bold';
            document.body.appendChild(scoreDisplay);
        }
        scoreDisplay.textContent = `Score: ${this.score}`;
    }
}