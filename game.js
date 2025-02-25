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
import { Timer } from './core/systems/timer_system.js';

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
      coinsCollected: 0,
    };
    this.collectibleSystem = null;

    // Créer le menu principal
    this.mainMenu = createMainMenu(this, this.container);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.paused = !this.paused;
        this.mainMenu.style.display = this.paused ? 'flex' : 'none';
      }
    });

    this.initAsync().then(() => {
      requestAnimationFrame((currentTime) => this.loop(currentTime));
    });
  }

  async initAsync() {
    console.log('Game initialization started');

    // Créer le menu original (pour compatibilité)
    createMenu(this, this.menu);
    this.container.appendChild(this.menu);
    this.menu.style.display = 'none'; // Cacher l'ancien menu

    // important order of systems !!
    this.addSystem(new Timer());
    this.addSystem(new Input());
    this.addSystem(new EnemyBehavior());
    this.addSystem(new Combat()); // Avant le Movement
    this.addSystem(new Camera()); // système de caméra après l'input mais avant le rendu
    this.addSystem(new Movement());
    this.addSystem(new Collision());
    this.addSystem(new CircleHitbox());
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

    // Charger la map
    await this.mapLoader.loadMap('./assets/maps/map1.json');
    console.log('Game initialization completed');
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

  // Respawn le joueur à la position de départ sans réinitialiser le reste
  async respawnPlayer() {
    // Supprimer l'ancien joueur
    const oldPlayer = Array.from(this.entities).find((entity) => entity.getComponent('input'));
    if (oldPlayer) {
      this.removeEntity(oldPlayer);
    }

    // // Créer un nouveau joueur à une position par défaut
    const player = createPlayer(190, 150);
    this.addEntity(player);
  }

  // Réinitialiser uniquement le niveau actuel
  async resetCurrentLevel() {
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
    const collectibleSystem = Array.from(this.systems).find((system) => system instanceof Collectible);
    if (collectibleSystem) {
      collectibleSystem.score = 0;
      collectibleSystem.coinsCollected = 0;
      collectibleSystem.portalActivated = false;
      collectibleSystem.updateDisplay();
    }
  }

  // Réinitialiser complètement le jeu
  async resetGame() {
    // Nettoyer le niveau

    // Réinitialiser tous les états
    this.levelState.deadEnemies.clear();
    this.levelState.collectedItems.clear();
    this.levelState.score = 0;
    this.levelState.coinsCollected = 0;

    // Recharger le premier niveau
    await this.mapLoader.loadMap('./assets/maps/map1.json');

    // Réinitialiser les compteurs dans le système de collectibles
    const collectibleSystem = Array.from(this.systems).find((system) => system instanceof Collectible);
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
    this.entities.forEach((entity) => {
      // Ne pas supprimer les entités d'UI ou de scores
      if (!entity.getComponent('ui')) {
        entitiesToRemove.add(entity);
      }
    });

    entitiesToRemove.forEach((entity) => {
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
    entitiesToRemove.forEach((entity) => {
      this.removeEntity(entity);
    });

    // Vider le monde du jeu
    const gameWorld = document.querySelector('.game-world');
    if (gameWorld) {
      gameWorld.innerHTML = '';
    }

    // Réinitialiser les systèmes si nécessaire
    this.systems.forEach((system) => {
      if (system.reset) {
        system.reset();
      }
    });
  }

  async restart() {
    this.cleanupLevel();
    await this.mapLoader.loadMap('./assets/maps/map1.json');
  }

  loop(currentTime) {
    requestAnimationFrame((nextTime) => this.loop(nextTime));

    if (this.paused) {
      return;
    }

    let deltaTime = (currentTime - this.lastTime) / 1000;
    if (deltaTime > 0.1) deltaTime = 0.1;
    this.lastTime = currentTime;

    // Mettre à jour tous les systèmes
    this.systems.forEach((system) => {
      system.update(deltaTime);
    });
  }
}
