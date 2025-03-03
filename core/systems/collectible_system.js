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
        this.scoreDisplay.style.fontFamily = 'Press Start 2P, sans-serif';
        this.scoreDisplay.style.textShadow = '2px 2px 2px rgba(0,0,0,0.5)';

        // Affichage des pièces
        this.coinsDisplay = document.createElement('div');
        this.coinsDisplay.style.color = '#FFA500'; // Couleur orange
        this.coinsDisplay.style.fontSize = '20px';
        this.coinsDisplay.style.fontFamily = 'Press Start 2P, sans-serif';
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
        // Trouver le joueur
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
            const position = entity.getComponent('position');

            if (!collectible || collectible.isCollected) return;

            if (property && property.isCollided) {
                // Vérifier si l'entité qui entre en collision est le joueur
                const collidingEntities = Array.from(property.collidingWith);
                const isPlayerColliding = collidingEntities.some(collidingEntity =>
                    collidingEntity === player
                );

                // Ne collecter que si c'est le joueur qui entre en collision
                if (isPlayerColliding) {
                    // Mettre à jour le score et le compteur de pièces
                    this.score += collectible.collect();
                    this.coinsCollected++;

                    // Jouer le son de collecte
                    const entityAudio = entity.getComponent('audio');
                    if (entityAudio && entityAudio.sounds.has('coin_collect')) {
                        entityAudio.playSound('coin_collect');
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
            }
        });
    }

    transformToPortal(entity) {
        // Ne pas changer l'animation pour le moment, on attend toujours le dernier talisman

        // Marquer comme "en attente" dans le composant collectible
        const collectible = entity.getComponent('collectible');
        if (collectible) {
            collectible.isPortalInactive = true; // Pas encore un portail actif
            collectible.needsTalisman = true;
        }

        // Ajouter un texte indiquant qu'il faut trouver le dernier talisman
        const gameUI = document.getElementById('game-ui-messages') || document.body;
        const message = document.createElement('div');
        message.className = 'talisman-message';
        message.textContent = "Il ne reste plus qu'à trouver le dernier talisman pour ouvrir le portail";
        message.style.cssText = `
    position: absolute;
    bottom: 20%;
    width: 100%;
    text-align: center;
    color: #f8d942;
    font-size: 24px;
    text-shadow: 2px 2px 4px #000;
    z-index: 9999;
    pointer-events: none;
    font-family: 'Press Start 2P', sans-serif;
`;
        gameUI.appendChild(message);

        // Faire disparaître le message après 5 secondes
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 1s';
            setTimeout(() => message.remove(), 1000);
        }, 5000);

        // Jouer le son portal.wav
        let portalAudio = entity.getComponent('audio');
        if (!portalAudio) {
            import('../create/audio_create.js').then(module => {
                portalAudio = module.addAudioToEntity(entity);
                portalAudio.addSound('portal_inactive', './assets/sounds/collectibles/portal.wav', { volume: 0.5, category: 'sfx' });
                portalAudio.playSound('portal_inactive');
            });
        } else {
            // Si l'audio existe déjà, ajouter juste le son et le jouer
            portalAudio.addSound('portal_inactive', './assets/sounds/collectibles/portal.wav', { volume: 0.5, category: 'sfx' });
            portalAudio.playSound('portal_inactive');
        }
    }

    updateDisplay() {
        // Mettre à jour le texte
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.scoreDisplay.style.fontFamily = "'Press Start 2P', sans-serif";
        this.coinsDisplay.textContent = `Pièces: ${this.coinsCollected}/${this.coinsForNextLevel}`;
        this.coinsDisplay.style.fontFamily = "'Press Start 2P', sans-serif";

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
            // Émettre un événement pour indiquer que le portail a été collecté
            this.game.eventBus.emit('portalCollected');

            // Afficher le message de niveau terminé
            this.showLevelComplete();

            // Charger le niveau suivant après un délai
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
        message.style.fontFamily = 'Press Start 2P, sans-serif';
        message.style.textShadow = '3px 3px 5px rgba(0,0,0,0.5)';
        message.style.zIndex = '2000';
        message.style.animation = 'fadeInOut 2s ease';
        message.style.fontFamily = "'Press Start 2P', sans-serif";

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
            console.log(`Chargement du niveau suivant. Niveau actuel: ${this.currentMap}`);

            // Déterminer le prochain niveau
            let nextMap;
            let gameComplete = false;

            switch (this.currentMap) {
                case 'map1':
                    nextMap = 'map2';
                    break;
                case 'map2':
                    nextMap = 'map3';
                    console.log("Passage de map2 à map3");
                    break;
                case 'map3':
                    nextMap = 'map4';
                    break;
                case 'map4':
                    gameComplete = true;
                    console.log("Jeu terminé!");
                    break;
                default:
                    nextMap = 'map1';
            }

            // Mise à jour de la carte actuelle
            const oldMap = this.currentMap;
            this.currentMap = nextMap;

            // Si le jeu est terminé, calculer le score final et demander le nom
            if (gameComplete) {
                // Calculer le score final
                const finalScore = this.calculateFinalScore();

                // Trouver le système de score
                const scoreSystem = Array.from(this.game.systems).find(
                    system => system.constructor.name === 'ScoreSystem'
                );

                if (scoreSystem) {
                    // Demander le nom et afficher le classement
                    scoreSystem.showFinalScoreAndRanking(finalScore, () => {
                        // Après avoir fermé le classement, lancer la cinématique de fin
                        this.playOutroCutscene();
                    });
                } else {
                    // Si pas de système de score, lancer directement la cinématique
                    this.playOutroCutscene();
                }

                return; // Arrêter l'exécution ici
            }

            // Pour les niveaux intermédiaires, réinitialiser le score et passer au niveau suivant
            this.score = 0;
            this.coinsCollected = 0;
            this.portalActivated = false;
            this.updateDisplay();

            // Jouer la cinématique de transition
            this.playTransitionCutscene(oldMap, nextMap);

        } catch (error) {
            console.error('Erreur lors du chargement du niveau suivant:', error);
        }
    }

    // Méthode pour jouer la cinématique de fin
    playOutroCutscene() {
        const cutsceneSystem = Array.from(this.game.systems).find(
            system => system.constructor.name === 'CutsceneSystem'
        );

        if (cutsceneSystem && cutsceneSystem.playCutscene) {
            cutsceneSystem.playCutscene('outro');
        } else {
            this.showGameComplete();
        }
    }

    // Méthode pour jouer la cinématique de transition
    playTransitionCutscene(oldMap, nextMap) {
        const cutsceneSystem = Array.from(this.game.systems).find(
            system => system.constructor.name === 'CutsceneSystem'
        );

        if (cutsceneSystem && cutsceneSystem.playCutscene) {
            const transitionId = `${oldMap}_to_${nextMap}`;
            console.log(`Tentative de jouer la cinématique: ${transitionId}`);

            if (cutsceneSystem.cutscenes[transitionId]) {
                cutsceneSystem.playCutscene(transitionId);
            } else {
                console.warn(`Cinématique ${transitionId} non trouvée, chargement direct du niveau.`);
                this.game.mapLoader.loadMap(`./assets/maps/${nextMap}.json`);
                this.game.paused = false;
            }
        } else {
            this.game.mapLoader.loadMap(`./assets/maps/${nextMap}.json`);
        }
    }

    // Méthode pour calculer le score final
    calculateFinalScore() {
        // Trouver le joueur
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return 0;

        // Récupérer le temps restant
        const timer = player.getComponent('timer');
        const timeRemaining = timer ? timer.currentTime : 0;

        // Calculer le score basé sur le temps et les ennemis tués
        const timeBonus = Math.floor(timeRemaining * 10); // 10 points par seconde restante
        const enemyBonus = this.game.globalStats.enemiesKilled * 100; // 100 points par ennemi tué
        const collectibleScore = this.score; // Score actuel des collectibles

        // Score final
        const finalScore = collectibleScore + timeBonus + enemyBonus;

        console.log(`Score final: ${finalScore} (Base: ${collectibleScore}, Temps: ${timeBonus}, Ennemis: ${enemyBonus})`);

        return finalScore;
    }

    // Calcule et sauvegarde le score du niveau
    calculateAndSaveLevelScore() {
        // Trouver le joueur
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return 0;

        // Récupérer le temps restant
        const timer = player.getComponent('timer');
        const timeRemaining = timer ? timer.currentTime : 0;

        // Calculer le score basé sur le temps et les ennemis tués
        const timeBonus = Math.floor(timeRemaining * 10); // 10 points par seconde restante
        const enemyBonus = this.game.globalStats.enemiesKilled * 100; // 100 points par ennemi tué
        const collectibleScore = this.score; // Score actuel des collectibles

        // Score final du niveau
        const finalScore = collectibleScore + timeBonus + enemyBonus;

        console.log(`Score final du niveau: ${finalScore} (Base: ${collectibleScore}, Temps: ${timeBonus}, Ennemis: ${enemyBonus})`);

        // Sauvegarder le score dans le composant Score du joueur
        const scoreComponent = player.getComponent('score');
        if (scoreComponent) {
            scoreComponent.baseScore = collectibleScore;
            scoreComponent.timeBonus = timeBonus;
            scoreComponent.enemyBonus = enemyBonus;
            scoreComponent.totalScore = finalScore;

            // Si le nom est déjà défini, on peut soumettre le score
            if (this.game.tempPlayerData && this.game.tempPlayerData.name) {
                scoreComponent.playerName = this.game.tempPlayerData.name;
            }

            // Soumettre le score au serveur
            const scoreSystem = Array.from(this.game.systems).find(system => system instanceof ScoreSystem);
            if (scoreSystem) {
                scoreSystem.submitScore(scoreComponent);
            }
        }

        return finalScore;
    }

    // Affiche les scores avant de passer au niveau suivant
    showScoresBeforeNextLevel(oldMap, nextMap) {
        // Trouver le système de score
        const scoreSystem = Array.from(this.game.systems).find(system => system instanceof ScoreSystem);
        if (!scoreSystem) {
            // Si pas de système de score, passer directement à la cinématique
            this.transitionToNextLevel(oldMap, nextMap);
            return;
        }

        // Afficher le tableau des scores avec un callback pour continuer
        scoreSystem.showScoreboard(() => {
            this.transitionToNextLevel(oldMap, nextMap);
        });
    }

    // Affiche les scores avant la fin du jeu
    showScoresBeforeEndgame() {
        // Trouver le système de score
        const scoreSystem = Array.from(this.game.systems).find(system => system instanceof ScoreSystem);
        if (!scoreSystem) {
            // Si pas de système de score, passer directement à la cinématique de fin
            this.showGameComplete();
            return;
        }

        // Afficher le tableau des scores avec un callback pour la fin
        scoreSystem.showScoreboard(() => {
            // Jouer la cinématique de fin
            const cutsceneSystem = Array.from(this.game.systems).find(
                system => system.constructor.name === 'CutsceneSystem'
            );

            if (cutsceneSystem && cutsceneSystem.playCutscene) {
                cutsceneSystem.playCutscene('outro');
            } else {
                this.showGameComplete();
            }
        });
    }

    // Fait la transition vers le niveau suivant
    transitionToNextLevel(oldMap, nextMap) {
        // Réinitialiser le score pour le prochain niveau
        this.score = 0;
        this.coinsCollected = 0;
        this.portalActivated = false;
        this.updateDisplay();

        // Jouer la cinématique de transition
        const cutsceneSystem = Array.from(this.game.systems).find(
            system => system.constructor.name === 'CutsceneSystem'
        );

        if (cutsceneSystem && cutsceneSystem.playCutscene) {
            const transitionId = `${oldMap}_to_${nextMap}`;
            console.log(`Tentative de jouer la cinématique: ${transitionId}`);

            if (cutsceneSystem.cutscenes[transitionId]) {
                cutsceneSystem.playCutscene(transitionId);
            } else {
                console.warn(`Cinématique ${transitionId} non trouvée, chargement direct du niveau.`);
                this.game.mapLoader.loadMap(`./assets/maps/${nextMap}.json`);
                this.game.paused = false;
            }
        } else {
            this.game.mapLoader.loadMap(`./assets/maps/${nextMap}.json`);
        }
    }

    calculateAndSubmitFinalScore() {
        // Trouver le joueur
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        // Récupérer le temps restant
        const timer = player.getComponent('timer');
        const timeRemaining = timer ? timer.currentTime : 0;

        // Calculer le score total
        const timeBonus = Math.floor(timeRemaining * 10); // 10 points par seconde restante
        const enemyBonus = this.game.globalStats.enemiesKilled * 100; // 100 points par ennemi tué
        const collectibleScore = this.score; // Score actuel des collectibles

        // Score final
        const finalScore = collectibleScore + timeBonus + enemyBonus;

        console.log(`Score final du jeu: ${finalScore} (Base: ${collectibleScore}, Temps: ${timeBonus}, Ennemis: ${enemyBonus})`);

        // Obtenir ou créer le composant Score du joueur
        let scoreComponent = player.getComponent('score');
        if (!scoreComponent) {
            // Import dynamique du composant Score si nécessaire
            import('../components/score_component.js').then(module => {
                scoreComponent = new module.Score();
                player.addComponent('score', scoreComponent);
                this.updateAndSubmitScore(scoreComponent, collectibleScore, timeBonus, enemyBonus, finalScore);
            });
        } else {
            this.updateAndSubmitScore(scoreComponent, collectibleScore, timeBonus, enemyBonus, finalScore);
        }
    }

    updateAndSubmitScore(scoreComponent, baseScore, timeBonus, enemyBonus, finalScore) {
        // Mettre à jour les valeurs du score
        scoreComponent.baseScore = baseScore;
        scoreComponent.timeBonus = timeBonus;
        scoreComponent.enemyBonus = enemyBonus;
        scoreComponent.totalScore = finalScore;

        // Récupérer le nom du joueur (défini au début du jeu)
        if (this.game.tempPlayerData && this.game.tempPlayerData.name) {
            scoreComponent.playerName = this.game.tempPlayerData.name;
        }

        // Soumettre le score au serveur
        const scoreSystem = Array.from(this.game.systems).find(
            system => system.constructor.name === 'ScoreSystem');

        if (scoreSystem && scoreSystem.submitScore) {
            scoreSystem.submitScore(scoreComponent);
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
        gameCompleteScreen.style.fontFamily = "'Press Start 2P', sans-serif";

        const title = document.createElement('h1');
        title.textContent = 'Félicitations !';
        title.style.color = '#FFD700';
        title.style.fontSize = '64px';
        title.style.marginBottom = '20px';
        title.style.fontFamily = 'Press Start 2P, sans-serif';
        title.style.textShadow = '3px 3px 5px rgba(0,0,0,0.5)';
        title.style.fontFamily = "'Press Start 2P', sans-serif";

        const message = document.createElement('p');
        message.textContent = 'Vous avez terminé le jeu !';
        message.style.color = '#FFFFFF';
        message.style.fontSize = '32px';
        message.style.fontFamily = 'Press Start 2P, sans-serif';

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
        restartButton.style.fontFamily = "'Press Start 2P', sans-serif";
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
