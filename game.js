import { Gravity } from './core/systems/gravity_system.js';
import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { Collision } from './core/systems/collision_system.js';
import { Collectible } from './core/systems/collectible_system.js';
import { Animation } from './core/systems/animation_system.js';
import { CircleHitbox } from './core/systems/circle_hitbox_system.js';
import { Damage } from './core/systems/damage_system.js';
import { Health } from './core/systems/health_system.js';
import { Debug } from './core/systems/debug.js';
import { TileSystem } from './core/systems/tile_system.js';
import { MapLoader } from './core/map_loader.js';
import { PhysicsSystem } from './core/systems/physics_system.js';
import { Camera } from './core/systems/camera_system.js';
import { EnemyBehavior } from './core/systems/enemy_behavior_system.js';
import { createMenu, createMainMenu } from './utils/utils.js';
import { EventBus } from './core/event_bus.js';
import { Combat } from './core/systems/combat_system.js';
import { createPlayer } from './create/player_create.js';
import { AudioSystem } from './core/systems/audio_system.js';
import { CutsceneSystem } from './core/systems/cutscene_system.js';
import { KillCounterSystem } from './core/systems/kill_counter_system.js';
import { BoundarySystem } from './core/systems/boundary_system.js';
import { ScoreSystem } from './core/systems/score_system.js';

export class Game {
    constructor(container) {
        this.entities = new Set();
        this.systems = new Set();
        this.lastTime = performance.now();
        this.paused = true;
        this.container = document.querySelector(container);
        this.menu = document.createElement('div');
        this.mapLoader = new MapLoader(this);
        this.eventBus = new EventBus();
        this.difficulty = 'easy'; // Mode par défaut
        this.levelState = {
            deadEnemies: new Set(), // UUID des ennemis morts
            collectedItems: new Set(), // UUID des collectibles ramassés
            score: 0,
            coinsCollected: 0
        };
        this.globalStats = {// Compteur d'ennemis tués qui persiste entre les niveaux
            enemiesKilled: 0,
            startTime: Date.now() // Optionnel: pour calculer le temps total de jeu
        };
        this.collectibleSystem = null;
        this.firstMapLoad = undefined; // Pour détecter le premier chargement
        this.cutsceneSystem = null; // Référence au système de cinématiques
        this.skipIntro = false; // Option pour sauter l'intro (à des fins de test)

        // Créer le menu principal
        this.mainMenu = createMainMenu(this, this.container);

        // Ajouter un bouton pour sauter l'intro
        this.addSkipIntroButton();

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Ne pas montrer le menu si une cinématique est en cours
                if (this.cutsceneSystem && this.cutsceneSystem.isPlaying) {
                    return;
                }

                this.paused = !this.paused;

                // Afficher le menu de pause (this.menu) et non le menu principal (this.mainMenu)
                this.menu.style.visibility = this.paused ? 'visible' : 'hidden';

                // Centrer le menu de pause
                if (this.paused) {
                    this.menu.style.display = 'flex';
                    this.menu.style.top = `${window.innerHeight / 2 - this.menu.offsetHeight / 2}px`;
                    this.menu.style.left = `${window.innerWidth / 2 - this.menu.offsetWidth / 2}px`;
                } else {
                    this.menu.style.display = 'none';
                }
            }
        });

        this.initAsync().then(() => {
            // Utiliser bind pour préserver le contexte de this
            const boundLoop = this.loop.bind(this);
            requestAnimationFrame(boundLoop);
        });
    }

    addSkipIntroButton() {
        // Ajouter un bouton dans le menu principal pour activer/désactiver l'intro
        const skipIntroCheckbox = document.createElement('div');
        skipIntroCheckbox.style.display = 'flex';
        skipIntroCheckbox.style.alignItems = 'center';
        skipIntroCheckbox.style.marginTop = '10px';
        skipIntroCheckbox.style.fontFamily = "'Press Start 2P', sans-serif";

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'skip-intro';
        checkbox.style.marginRight = '10px';
        checkbox.checked = this.skipIntro;
        checkbox.onchange = (e) => {
            this.skipIntro = e.target.checked;
        };

        const label = document.createElement('label');
        label.htmlFor = 'skip-intro';
        label.textContent = 'Sauter l\'introduction';
        label.style.color = 'black';
        label.style.fontFamily = "'Press Start 2P', sans-serif";

        skipIntroCheckbox.appendChild(checkbox);
        skipIntroCheckbox.appendChild(label);

        // Ajouter au menu juste avant le bouton démarrer
        const menu = this.mainMenu.querySelector('div'); // Obtenir le div du menu à l'intérieur du container
        const startBtn = menu.querySelector('button'); // Le premier bouton est "Start Game"
        menu.insertBefore(skipIntroCheckbox, startBtn);
    }

    async initAsync() {
        console.log("Game initialization started");

        // Créer le menu de pause et le rendre accessible via this.pauseMenu
        this.pauseMenu = document.createElement('div');
        createMenu(this, this.pauseMenu);
        this.container.appendChild(this.pauseMenu);
        this.pauseMenu.style.visibility = 'hidden'; // Cacher le menu de pause par défaut
        this.pauseMenu.style.display = 'none';

        // Stocker une référence dans this.menu pour la compatibilité
        this.menu = this.pauseMenu;

        // important order of systems !!
        this.addSystem(new Input());
        this.addSystem(new EnemyBehavior());
        this.addSystem(new Combat()); // Avant le Movement
        this.addSystem(new Camera()); // système de caméra après l'input mais avant le rendu
        this.addSystem(new Movement());
        this.addSystem(new Collision());
        this.addSystem(new CircleHitbox());
        this.boundarySystem = new BoundarySystem();
        this.addSystem(this.boundarySystem);
        this.scoreSystem = new ScoreSystem();
        this.addSystem(this.scoreSystem);
        this.addSystem(new Gravity());
        this.addSystem(new AudioSystem());
        this.addSystem(new Collectible());
        this.addSystem(new Animation());
        this.addSystem(new Damage());
        this.addSystem(new Health());
        this.addSystem(new TileSystem());
        this.addSystem(new Render(this.container));
        this.addSystem(new PhysicsSystem());
        this.addSystem(new Debug());
        this.addSystem(new KillCounterSystem());

        // Ajouter le système de cinématiques
        this.cutsceneSystem = new CutsceneSystem();
        this.addSystem(this.cutsceneSystem);

        // Modifier le comportement du bouton Start dans le menu principal
        this.setupStartButton();

        // Charger la map mais ne pas la démarrer (la cinématique d'intro le fera)
        await this.preloadMap('./assets/maps/map1.json');

        console.log("Game initialization completed");
    }

    // Précharge la map mais sans en faire la map active
    async preloadMap(mapPath) {
        try {
            // Charger les données de la map, mais ne pas créer les entités
            const response = await fetch(mapPath);
            const mapData = await response.json();

            // Stocker les données pour une utilisation ultérieure
            this.preloadedMapData = mapData;
            console.log("Map preloaded:", mapPath);
        } catch (error) {
            console.error('Error preloading map:', error);
        }
    }

    setupStartButton() {
        // Trouver le bouton de démarrage dans le menu principal
        const startBtn = this.mainMenu.querySelector('button');
        if (!startBtn) return;

        // Remplacer l'action onclick par notre nouvelle logique
        startBtn.onclick = () => {
            // Cacher le menu principal
            this.mainMenu.style.display = 'none';

            // Demander le nom du joueur
            this.showNamePrompt(() => {
                // Callback après saisie du nom
                if (this.skipIntro) {
                    // Sauter directement à la map1 si on choisit de sauter l'intro
                    this.mapLoader.loadMap('./assets/maps/map1.json').then(() => {
                        this.paused = false;
                    });
                } else {
                    // Sinon, lancer la cinématique d'introduction
                    if (this.cutsceneSystem) {
                        this.cutsceneSystem.playCutscene('intro');
                    } else {
                        // Fallback si le système de cinématique n'est pas disponible
                        this.mapLoader.loadMap('./assets/maps/map1.json').then(() => {
                            this.paused = false;
                        });
                    }
                }
            });
        };
    }

    // Ajoutons une méthode pour demander le nom du joueur
    showNamePrompt(callback) {
        // Créer le conteneur du formulaire
        const formContainer = document.createElement('div');
        formContainer.style.position = 'fixed';
        formContainer.style.top = '0';
        formContainer.style.left = '0';
        formContainer.style.width = '100%';
        formContainer.style.height = '100%';
        formContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.justifyContent = 'center';
        formContainer.style.alignItems = 'center';
        formContainer.style.zIndex = '3000';

        // Titre
        const title = document.createElement('h2');
        title.textContent = 'Entrez votre nom pour commencer';
        title.style.color = '#FFD700';
        title.style.fontSize = '28px';
        title.style.fontFamily = "'Press Start 2P', sans-serif";
        title.style.marginBottom = '30px';
        title.style.textAlign = 'center';

        // Créer le formulaire
        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'center';
        form.style.gap = '20px';

        // Input pour le nom
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Votre nom';
        nameInput.style.padding = '10px';
        nameInput.style.fontSize = '18px';
        nameInput.style.width = '300px';
        nameInput.style.borderRadius = '5px';
        nameInput.style.fontFamily = "'Press Start 2P', sans-serif";

        // Bouton de soumission
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Commencer l\'aventure';
        submitButton.style.padding = '10px 20px';
        submitButton.style.fontSize = '18px';
        submitButton.style.backgroundColor = '#4CAF50';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.fontFamily = "'Press Start 2P', sans-serif";

        submitButton.onclick = () => {
            const playerName = nameInput.value.trim();
            if (playerName) {
                // Sauvegarder le nom du joueur
                if (!this.tempPlayerData) {
                    this.tempPlayerData = { name: playerName };
                } else {
                    this.tempPlayerData.name = playerName;
                }

                // Retirer le formulaire
                document.body.removeChild(formContainer);

                // Exécuter le callback
                if (callback) callback();
            } else {
                // Alerte si le nom est vide
                alert("Veuillez entrer votre nom!");
            }
        };

        // Assembler le formulaire
        form.appendChild(nameInput);
        form.appendChild(submitButton);

        formContainer.appendChild(title);
        formContainer.appendChild(form);

        document.body.appendChild(formContainer);

        // Focus sur l'input
        nameInput.focus();
    }

    addEntity(entity) {
        this.entities.add(entity);
        this.systems.forEach((system) => system.addEntity(entity));
    }

    addSystem(system) {
        system.setGame(this);
        this.systems.add(system);
        this.entities.forEach((entity) => system.addEntity(entity));

        // Garder une référence au système de collectibles
        if (system instanceof Collectible) {
            this.collectibleSystem = system;
        }
    }

    removeEntity(entity) {
        // Vérifier si l'entité est un ennemi ou un collectible avant de la supprimer
        if (entity.getComponent('health') && !entity.getComponent('input')) {
            // C'est un ennemi
            this.levelState.deadEnemies.add(entity.uuid);
        } else if (entity.getComponent('collectible')) {
            // C'est un collectible
            this.levelState.collectedItems.add(entity.uuid);
        }

        const divs = document.querySelectorAll(`[uuid="${entity.uuid}"]`);
        divs.forEach((div) => div.remove());
        this.entities.delete(entity);
        this.systems.forEach((system) => system.removeEntity(entity));
    }

    handlePlayerDeath() {
        console.log(`Gestion de la mort du joueur en mode ${this.difficulty}`);

        // Réinitialiser le compteur d'ennemis tués
        this.globalStats.enemiesKilled = 0;

        switch (this.difficulty) {
            case 'easy':
                // Mode facile : Juste respawn le joueur et conserver l'état
                this.respawnPlayer();
                break;

            case 'medium':
                // Mode moyen : Recommencer le niveau actuel
                this.resetCurrentLevel();
                break;

            case 'hard':
            default:
                // Mode difficile : Recommencer au niveau 1
                this.resetGame();
                break;
        }
    }

    // Dans game.js, ajoutons une méthode dédiée
    incrementEnemyKillCount(entity) {
        // Vérifier que l'entité n'a pas déjà été comptée comme tuée
        if (entity && !this.levelState.deadEnemies.has(entity.uuid)) {
            // Ajouter l'UUID à la liste des ennemis tués
            this.levelState.deadEnemies.add(entity.uuid);

            // Incrémenter le compteur global
            this.globalStats.enemiesKilled++;

            // Émettre un événement pour le système de score
            this.eventBus.emit('enemyKilled', entity);

            // Afficher l'effet +1 si le système est disponible
            const killSystem = Array.from(this.systems).find(system =>
                system.constructor.name === 'KillCounterSystem');
            if (killSystem && killSystem.showKillEffect) {
                killSystem.showKillEffect();
            }

            console.log(`Ennemi tué! Total: ${this.globalStats.enemiesKilled}`);
        }
    }

    // Respawn le joueur à la position de départ sans réinitialiser le reste
    async respawnPlayer() {
        console.log("Respawn du joueur en mode facile");

        // Supprimer l'ancien joueur
        const oldPlayer = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (oldPlayer) {
            this.removeEntity(oldPlayer);
        }

        // Créer un nouveau joueur à une position par défaut
        const player = createPlayer(190, 150);
        this.addEntity(player);
    }



    // Réinitialiser uniquement le niveau actuel
    async resetCurrentLevel() {
        console.log("Réinitialisation du niveau actuel (mode moyen)");

        // Sauvegarder le niveau actuel
        const currentMap = this.collectibleSystem?.currentMap || 'map1';

        // Nettoyer le niveau mais ne pas réinitialiser le niveau de progression
        this.cleanupLevelOnly();

        // Réinitialiser le score et les compteurs pour ce niveau
        this.levelState.deadEnemies.clear();
        this.levelState.collectedItems.clear();
        this.levelState.score = 0;
        this.levelState.coinsCollected = 0;

        // Recharger le niveau actuel
        await this.mapLoader.loadMap(`./assets/maps/${currentMap}.json`);

        // Réinitialiser les compteurs dans le système de collectibles
        const collectibleSystem = Array.from(this.systems).find(system => system instanceof Collectible);
        if (collectibleSystem) {
            collectibleSystem.score = 0;
            collectibleSystem.coinsCollected = 0;
            collectibleSystem.portalActivated = false;
            collectibleSystem.updateDisplay();
        }
    }

    // Réinitialiser complètement le jeu
    async resetGame() {
        console.log("Réinitialisation complète du jeu (mode difficile)");

        // Nettoyer le niveau
        this.cleanupLevel();

        // Réinitialiser tous les états
        this.levelState.deadEnemies.clear();
        this.levelState.collectedItems.clear();
        this.levelState.score = 0;
        this.levelState.coinsCollected = 0;

        // Recharger le premier niveau
        await this.mapLoader.loadMap('./assets/maps/map1.json');

        // Réinitialiser les compteurs dans le système de collectibles
        const collectibleSystem = Array.from(this.systems).find(system => system instanceof Collectible);
        if (collectibleSystem) {
            collectibleSystem.score = 0;
            collectibleSystem.coinsCollected = 0;
            collectibleSystem.currentMap = 'map1';
            collectibleSystem.portalActivated = false;
            collectibleSystem.updateDisplay();
        }
    }

    // Nettoyer uniquement les entités du niveau sans réinitialiser les systèmes de progression
    cleanupLevelOnly() {
        // Supprimer toutes les entités sauf les UI
        const entitiesToRemove = new Set();
        this.entities.forEach(entity => {
            // Ne pas supprimer les entités d'UI ou de scores
            if (!entity.getComponent('ui')) {
                entitiesToRemove.add(entity);
            }
        });

        entitiesToRemove.forEach(entity => {
            this.removeEntity(entity);
        });

        // Vider le monde du jeu
        const gameWorld = document.querySelector('.game-world');
        if (gameWorld) {
            gameWorld.innerHTML = '';
        }
    }

    cleanupLevel() {
        // Supprimer toutes les entités
        const entitiesToRemove = new Set(this.entities);
        entitiesToRemove.forEach(entity => {
            this.removeEntity(entity);
        });

        // Vider le monde du jeu
        const gameWorld = document.querySelector('.game-world');
        if (gameWorld) {
            gameWorld.innerHTML = '';
        }

        // Réinitialiser les systèmes si nécessaire
        this.systems.forEach(system => {
            if (system.reset) {
                system.reset();
            }
        });
    }

    async restart() {
        this.cleanupLevel();

        // Si le système de cinématiques est disponible et qu'on ne saute pas l'intro
        if (this.cutsceneSystem && !this.skipIntro) {
            this.cutsceneSystem.playCutscene('intro');
        } else {
            // Sinon, charger directement la map1
            await this.mapLoader.loadMap('./assets/maps/map1.json');
        }
    }

    loop(currentTime) {
        // Utiliser bind pour préserver le contexte
        requestAnimationFrame(this.loop.bind(this));

        let deltaTime = (currentTime - this.lastTime) / 1000;
        if (deltaTime > 0.1) deltaTime = 0.1;
        this.lastTime = currentTime;

        // Si on est en pause mais qu'une cinématique est en cours,
        // on doit quand même mettre à jour le système de cinématique
        if (this.paused) {
            // Vérifier si une cinématique est en cours
            if (this.cutsceneSystem && this.cutsceneSystem.isPlaying) {
                this.cutsceneSystem.update(deltaTime);
            }
            return;
        }

        // Mettre à jour tous les systèmes
        this.systems.forEach((system) => {
            system.update(deltaTime);
        });
    }
}