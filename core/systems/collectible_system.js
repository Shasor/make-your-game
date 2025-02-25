// core/systems/collectible_system.js
import { System } from './system.js';

export class Collectible extends System {
    constructor() {
        super();
        this.score = 0;
        this.coinsCollected = 0;
        this.coinsTotal = 6; // Nombre total de pièces dans le niveau
        this.portalActivated = false;
        this.scoreForNextLevel = 60;
        this.coinsForNextLevel = 6;
        this.currentMap = 'map1';
        this.finalLevel = 'map4';

        // Créer le conteneur d'UI
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'fixed';
        this.uiContainer.style.top = '20px';
        this.uiContainer.style.right = '20px';
        this.uiContainer.style.display = 'flex';
        this.uiContainer.style.flexDirection = 'column';
        this.uiContainer.style.gap = '10px';
        this.uiContainer.style.padding = '15px';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.uiContainer.style.borderRadius = '10px';
        this.uiContainer.style.zIndex = '1000';

        // Affichage du score
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.style.color = '#FFD700'; // Couleur dorée
        this.scoreDisplay.style.fontSize = '24px';
        this.scoreDisplay.style.fontFamily = 'Arial, sans-serif';
        this.scoreDisplay.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';

        // Affichage des pièces
        this.coinsDisplay = document.createElement('div');
        this.coinsDisplay.style.color = '#FFA500'; // Couleur orange
        this.coinsDisplay.style.fontSize = '20px';
        this.coinsDisplay.style.fontFamily = 'Arial, sans-serif';
        this.coinsDisplay.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';

        // Barre de progression
        this.progressContainer = document.createElement('div');
        this.progressContainer.style.width = '150px';
        this.progressContainer.style.height = '20px';
        this.progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.progressContainer.style.borderRadius = '10px';
        this.progressContainer.style.overflow = 'hidden';

        this.progressBar = document.createElement('div');
        this.progressBar.style.width = '0%';
        this.progressBar.style.height = '100%';
        this.progressBar.style.backgroundColor = '#4CAF50';
        this.progressBar.style.transition = 'width 0.3s ease';

        // Assembler l'UI
        this.progressContainer.appendChild(this.progressBar);
        this.uiContainer.appendChild(this.scoreDisplay);
        this.uiContainer.appendChild(this.coinsDisplay);
        this.uiContainer.appendChild(this.progressContainer);
        document.body.appendChild(this.uiContainer);

        this.updateDisplay();
    }

    // méthode pour récupérer l'état sauvegardé si disponible
    setGame(game) {
        super.setGame(game);

        // Récupérer l'état sauvegardé si on est en mode facile
        if (game.difficulty === 'easy' && game.levelState) {
            this.score = game.levelState.score || 0;
            this.coinsCollected = game.levelState.coinsCollected || 0;
            this.updateDisplay();
        }
    }

    update() {
        const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
        if (!player) return;

        // Compter les pièces restantes
        let remainingCoins = Array.from(this.entities).filter(entity => {
            const collectible = entity.getComponent('collectible');
            return collectible && !collectible.isCollected;
        });

        // Si on a collecté 5 pièces et qu'on n'a pas encore activé le portail
        if (this.coinsCollected === 5 && !this.portalActivated && remainingCoins.length === 1) {
            // Transformer la dernière pièce en portail
            const lastCoin = remainingCoins[0];
            this.transformToPortal(lastCoin);
            this.portalActivated = true;
        }

        this.entities.forEach((entity) => {
            const collectible = entity.getComponent('collectible');
            const property = entity.getComponent('property');

            if (!collectible || collectible.isCollected) return;

            if (property && property.isCollided) {
                // Mettre à jour le score et le compteur de pièces
                this.score += collectible.collect();
                this.coinsCollected++;

                // Jouer le son de collecte
                const playerAudio = player.getComponent('audio');
                if (playerAudio) {
                    playerAudio.playSound('coin_collect');
                }

                // Émettre un événement pour le système audio
                this.game.eventBus.emit('coinCollected', entity);

                // Supprimer l'entité du jeu
                this.game.removeEntity(entity);

                // Mettre à jour l'affichage
                this.updateDisplay();

                // Vérifier les conditions de progression
                this.checkLevelProgression();
            }
        });
    }

    transformToPortal(entity) {
        // Changer l'animation
        const oldAnimation = entity.getComponent('animation');
        if (oldAnimation) {
            entity.components.delete('animation');
        }

        entity.addComponent('animation', new PortalAnimation());

        // Marquer comme portail dans le composant collectible
        const collectible = entity.getComponent('collectible');
        if (collectible) {
            collectible.isPortal = true;
            collectible.value = 1; // Valeur pour compléter le niveau
        }


        // Mettre à jour le visuel si nécessaire
        const visual = entity.getComponent('visual');
        if (visual) {
            visual.width = 64;  // Vous pouvez ajuster la taille si nécessaire
            visual.height = 64;
        }

        let portalAudio = entity.getComponent('audio');
        if (!portalAudio) {
            import('../create/audio_create.js').then(module => {
                portalAudio = module.addAudioToEntity(entity);
                portalAudio.addSound('portal_active', './assets/sounds/collectibles/portal.mp3', { volume: 0.7, loop: true, category: 'sfx' });
                portalAudio.playSound('portal_active', { fadeIn: 500 });
            });
        } else {
            portalAudio.playSound('portal_active', { fadeIn: 500 });
        }
    }

    updateDisplay() {
        // Mettre à jour le texte
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.coinsDisplay.textContent = `Pièces: ${this.coinsCollected}/${this.coinsForNextLevel}`;

        // Calculer la progression
        const progressPercent = Math.min(
            (this.score / this.scoreForNextLevel) * 100,
            100
        );
        this.progressBar.style.width = `${progressPercent}%`;

        // Changer la couleur de la barre en fonction de la progression
        if (progressPercent < 50) {
            this.progressBar.style.backgroundColor = '#4CAF50';
        } else if (progressPercent < 75) {
            this.progressBar.style.backgroundColor = '#FFA500';
        } else {
            this.progressBar.style.backgroundColor = '#FF4500';
        }
    }

    checkLevelProgression() {
        if (this.score >= this.scoreForNextLevel && this.coinsCollected >= this.coinsForNextLevel) {
            this.showLevelComplete();
            setTimeout(() => {
                this.loadNextLevel();
            }, 2000);
        }
    }

    showLevelComplete() {
        const message = document.createElement('div');
        message.textContent = 'Niveau Complété!';
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#FFD700';
        message.style.fontSize = '48px';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.textShadow = '3px 3px 5px rgba(0,0,0,0.5)';
        message.style.zIndex = '2000';
        message.style.animation = 'fadeInOut 2s ease';

        // Ajouter le style d'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
            style.remove();
        }, 2000);
    }

    async loadNextLevel() {
        try {
            // Déterminer le prochain niveau
            let nextMap;
            let gameComplete = false;

            switch (this.currentMap) {
                case 'map1':
                    nextMap = 'map2';
                    break;
                case 'map2':
                    nextMap = 'map3';
                    break;
                case 'map3':
                    nextMap = 'map4';
                    break;
                case 'map4':
                    gameComplete = true;
                    break;
                default:
                    nextMap = 'map1';
            }

            if (gameComplete) {
                this.showGameComplete();
                return;
            }

            // Réinitialiser les compteurs pour le nouveau niveau
            this.score = 0;
            this.coinsCollected = 0;
            this.portalActivated = false;
            this.updateDisplay();

            // Supprimer toutes les entités existantes
            const entitiesToRemove = new Set(this.game.entities);
            entitiesToRemove.forEach(entity => {
                this.game.removeEntity(entity);
            });

            // Nettoyer le monde du jeu
            const gameWorld = document.querySelector('.game-world');
            if (gameWorld) {
                gameWorld.innerHTML = '';
            }

            // Mettre à jour la carte actuelle
            this.currentMap = nextMap;

            // Charger la nouvelle map
            await this.game.mapLoader.loadMap(`./assets/maps/${nextMap}.json`);
        } catch (error) {
            console.error('Erreur lors du chargement du niveau suivant:', error);
        }
    }

    showGameComplete() {
        const gameCompleteScreen = document.createElement('div');
        gameCompleteScreen.style.position = 'fixed';
        gameCompleteScreen.style.top = '0';
        gameCompleteScreen.style.left = '0';
        gameCompleteScreen.style.width = '100%';
        gameCompleteScreen.style.height = '100%';
        gameCompleteScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameCompleteScreen.style.display = 'flex';
        gameCompleteScreen.style.flexDirection = 'column';
        gameCompleteScreen.style.justifyContent = 'center';
        gameCompleteScreen.style.alignItems = 'center';
        gameCompleteScreen.style.zIndex = '3000';

        const title = document.createElement('h1');
        title.textContent = 'Félicitations !';
        title.style.color = '#FFD700';
        title.style.fontSize = '64px';
        title.style.marginBottom = '20px';
        title.style.fontFamily = 'Arial, sans-serif';
        title.style.textShadow = '3px 3px 5px rgba(0,0,0,0.5)';

        const message = document.createElement('p');
        message.textContent = 'Vous avez terminé le jeu !';
        message.style.color = '#FFFFFF';
        message.style.fontSize = '32px';
        message.style.fontFamily = 'Arial, sans-serif';

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Recommencer';
        restartButton.style.marginTop = '30px';
        restartButton.style.padding = '15px 30px';
        restartButton.style.fontSize = '24px';
        restartButton.style.backgroundColor = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.onclick = () => {
            document.body.removeChild(gameCompleteScreen);
            this.currentMap = 'map1';
            this.loadNextLevel();
        };

        gameCompleteScreen.appendChild(title);
        gameCompleteScreen.appendChild(message);
        gameCompleteScreen.appendChild(restartButton);
        document.body.appendChild(gameCompleteScreen);
    }

}
