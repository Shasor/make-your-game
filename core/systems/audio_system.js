// core/systems/audio_system.js
import { System } from './system.js';
import { Entity } from '../entities/entity.js';
import { Audio } from '../components/audio_component.js';

export class AudioSystem extends System {
  constructor() {
    super();
    this.initialized = false;
    this.lastEnemyUpdate = new Map();
    this.lastMusicChange = 0;
    this.activatedEnemies = 0;
    this.coinsCollected = 0;
    this.currentMusicTrack = 'music_ambient_1';
    this.worldEntity = null;
    this.debug = true;
    this.ambientMusicStarted = false;
    this.soundsChecked = false;
  }

  setGame(game) {
    super.setGame(game);

    // Abonnement aux événements
    if (this.game.eventBus) {
      this.game.eventBus.on('entityDeath', this.handleEntityDeath.bind(this));
      this.game.eventBus.on('levelComplete', this.handleLevelComplete.bind(this));
      this.game.eventBus.on('coinCollected', this.handleCoinCollected.bind(this));
    }
  }

  init() {
    if (this.initialized) return;

    // Créer une entité pour les sons globaux
    this.createWorldEntity();

    // Initialiser les sons pour chaque entité
    this.entities.forEach((entity) => {
      // Ignorer l'entité world
      if (entity.getComponent('world_audio')) return;

      const audio = entity.getComponent('audio');
      if (!audio) return;

      // Initialiser les sons pour le joueur
      if (entity.getComponent('input')) {
        this.initializePlayerSounds(audio);
      }

      // Initialiser les sons pour les ennemis
      else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
        this.initializeEnemySounds(audio);
      }

      // Initialiser les sons pour les collectibles
      else if (entity.getComponent('collectible')) {
        this.initializeCollectibleSounds(audio);
      }
    });

    // Initialiser le son d'ambiance

    this.initializeAmbientSounds();

    this.initialized = true;
  }

  createWorldEntity() {
    this.worldEntity = new Entity();
    this.worldEntity.uuid = 'world_audio_entity';
    this.worldEntity.addComponent('world_audio', true);
    this.worldEntity.addComponent('audio', new Audio());
    this.game.addEntity(this.worldEntity);
  }

  initializePlayerSounds(audio) {
    // Sons associés aux animations du joueur
    audio.addSound('player_idle', './assets/sounds/player/idle.wav', { volume: 0.2, loop: true, category: 'sfx' });
    audio.addSound('player_run', './assets/sounds/player/run.wav', { volume: 0.4, loop: true, category: 'sfx' });
    audio.addSound('player_jump', './assets/sounds/player/jump.wav', { volume: 0.5, category: 'sfx' });
    audio.addSound('player_roulade', './assets/sounds/player/roll.wav', { volume: 0.6, category: 'sfx' });
    audio.addSound('player_attack1', './assets/sounds/player/attack1.wav', { volume: 0.7, category: 'sfx' });
    audio.addSound('player_attack2', './assets/sounds/player/attack2.wav', { volume: 0.7, category: 'sfx' });
    audio.addSound('player_attack3', './assets/sounds/player/attack3.wav', { volume: 0.7, category: 'sfx' });
    audio.addSound('player_magicAttack', './assets/sounds/player/magic.wav', { volume: 0.6, category: 'sfx' });
    audio.addSound('player_arrowShoot', './assets/sounds/player/arrow.wav', { volume: 0.5, category: 'sfx' });
    audio.addSound('player_hurt', './assets/sounds/player/hurt.wav', { volume: 0.7, category: 'sfx' });
    audio.addSound('player_death', './assets/sounds/player/death.wav', { volume: 0.8, category: 'sfx' });
  }

  initializeEnemySounds(audio) {
    // Sons associés aux ennemis
    audio.addSound('enemy_idle', './assets/sounds/enemy/idle.wav', { volume: 0.3, loop: true, category: 'sfx' });
    audio.addSound('enemy_magic', './assets/sounds/enemy/magic.wav', { volume: 0.6, loop: true, category: 'sfx' });
    audio.addSound('enemy_hurt', './assets/sounds/enemy/hurt.wav', { volume: 0.7, category: 'sfx' });
    audio.addSound('enemy_death', './assets/sounds/enemy/death.mp3', { volume: 0.8, category: 'sfx' });
    audio.addSound('enemy_detection', './assets/sounds/enemy/detection.wav', { volume: 0.5, category: 'sfx' });
  }

  initializeCollectibleSounds(audio) {
    // Sons associés aux collectibles
    audio.addSound('coin_collect', './assets/sounds/collectibles/coin.wav', { volume: 0.6, category: 'sfx' });
    audio.addSound('portal_active', './assets/sounds/collectibles/portal.wav', { volume: 0.7, loop: true, category: 'sfx' });
  }

  initializeAmbientSounds() {
    // Ambiance sonore - utiliser l'entité world créée
    if (this.worldEntity) {
      const worldAudio = this.worldEntity.getComponent('audio');
      if (worldAudio) {
        // Précharger ces sons avec un volume plus élevé
        worldAudio.addSound('music_ambient_1', './assets/sounds/music/ambient_1.wav', { volume: 0.2, loop: true, category: 'music', preload: true });
        worldAudio.addSound('music_ambient_2', './assets/sounds/music/ambient_2.wav', { volume: 0.7, loop: true, category: 'music', preload: true });

        // Ajouter un bouton pour activer la musique d'ambiance
        this.createAmbientMusicButton();
      } else {
        console.error("Composant audio manquant dans l'entité world");
      }
    } else {
      console.error('Entité world non créée');
    }
  }

  createAmbientMusicButton() {
    // Créer un bouton pour activer la musique d'ambiance
    const button = document.createElement('button');
    button.textContent = 'Activer la musique';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    button.onclick = () => {
      if (this.worldEntity) {
        const worldAudio = this.worldEntity.getComponent('audio');
        if (worldAudio) {
          // Démarrer la musique d'ambiance
          try {
            const audio = worldAudio.playSound('music_ambient_1', { volume: 0.7 });
            if (audio) {
              this.ambientMusicStarted = true;

              document.body.removeChild(button);
            } else {
              console.error("Échec du démarrage de la musique d'ambiance");
            }
          } catch (error) {
            console.error("Erreur lors du démarrage de la musique d'ambiance:", error);
          }
        }
      }
    };

    document.body.appendChild(button);
  }

  update(deltaTime) {
    if (!this.initialized) {
      this.init();
      return;
    }

    // Vérifier et mettre à jour les sons
    if (!this.soundsChecked) {
      this.checkSounds();
      this.soundsChecked = true;
    }

    // Mise à jour des entités audio
    this.entities.forEach((entity) => {
      // Ignorer l'entité world
      if (entity.getComponent('world_audio')) return;

      const audio = entity.getComponent('audio');
      if (!audio) return;

      // Mettre à jour les timers audio
      if (typeof audio.update === 'function') {
        audio.update(deltaTime);
      }

      // Gestion des sons du joueur
      if (entity.getComponent('input')) {
        this.updatePlayerSounds(entity, audio, deltaTime);
      }

      // Gestion des sons des ennemis
      else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
        this.updateEnemySounds(entity, audio, deltaTime);
      }
    });

    // Gestion des sons collectibles
    this.updateCollectibleSounds(deltaTime);
  }

  checkSounds() {
    // Vérifier les sons ambiants
    if (this.worldEntity) {
      const worldAudio = this.worldEntity.getComponent('audio');
      if (worldAudio && worldAudio.sounds) {
      }
    }

    // Vérifier les sons du joueur
    const player = this.findPlayer();
    if (player) {
      const playerAudio = player.getComponent('audio');
      if (playerAudio && playerAudio.sounds) {
      }
    }
  }

  updateCollectibleSounds(deltaTime) {
    const collectibleSystem = this.findCollectibleSystem();
    if (!collectibleSystem) return;

    // Si une pièce a été collectée récemment
    if (collectibleSystem.coinCollectedTime && Date.now() - collectibleSystem.coinCollectedTime < 100) {
      const player = this.findPlayer();
      if (player) {
        const playerAudio = player.getComponent('audio');
        if (playerAudio && playerAudio.sounds.has('coin_collect')) {
          playerAudio.playSound('coin_collect', { volume: 0.6 });
        }
      }
    }
  }

  findCollectibleSystem() {
    return Array.from(this.game.systems).find((system) => system.constructor.name === 'Collectible');
  }

  updatePlayerSounds(entity, audio, deltaTime) {
    const animation = entity.getComponent('animation');
    const input = entity.getComponent('input');
    const property = entity.getComponent('property');

    if (!animation || !input) return;

    const currentState = animation.currentState;

    // Si l'état de l'animation a changé
    if (currentState !== audio.lastAnimationState) {
      // Arrêter le son de l'animation précédente si nécessaire
      if (audio.lastAnimationState && audio.sounds.has(`player_${audio.lastAnimationState}`)) {
        audio.stopSound(`player_${audio.lastAnimationState}`);
      }

      // Jouer le son correspondant à la nouvelle animation si disponible
      if (audio.sounds.has(`player_${currentState}`)) {
        try {
          audio.playSound(`player_${currentState}`);
        } catch (error) {
          console.warn(`Erreur de lecture du son player_${currentState}:`, error);
        }
      }

      audio.lastAnimationState = currentState;
    }
  }

  updateEnemySounds(entity, audio, deltaTime) {
    const animation = entity.getComponent('animation');
    if (!animation) return;

    const currentState = animation.currentState;

    // Si l'état de l'animation a changé
    if (currentState !== audio.lastAnimationState) {
      // Arrêter le son de l'animation précédente si nécessaire
      if (audio.lastAnimationState && audio.sounds.has(`enemy_${audio.lastAnimationState}`)) {
        audio.stopSound(`enemy_${audio.lastAnimationState}`);
      }

      // Jouer le son correspondant à la nouvelle animation si disponible
      let soundKey = '';
      switch (currentState) {
        case 'idle':
        case 'idle2':
          soundKey = 'enemy_idle';
          break;
        case 'magic':
          soundKey = 'enemy_magic';
          break;
        case 'hurt':
        case 'hurt1':
          soundKey = 'enemy_hurt';
          break;
        case 'death':
          soundKey = 'enemy_death';
          break;
      }

      if (soundKey && audio.sounds.has(soundKey)) {
        try {
          audio.playSound(soundKey);
        } catch (error) {
          console.warn(`Erreur de lecture du son ${soundKey}:`, error);
        }
      }

      audio.lastAnimationState = currentState;
    }
  }

  updateAmbientMusic(deltaTime) {
    // Pour l'instant, ne rien faire pour éviter les erreurs
  }

  handleEntityDeath(entity) {
    // Pour l'instant, ne rien faire pour éviter les erreurs
  }

  handleLevelComplete() {
    // Pour l'instant, ne rien faire pour éviter les erreurs
  }

  handleCoinCollected() {
    // Pour l'instant, ne rien faire pour éviter les erreurs
  }

  findPlayer() {
    return Array.from(this.entities).find((entity) => entity.getComponent('input'));
  }
}

/* The above code is a JavaScript class `AudioSystem` that is responsible for managing audio in a game.
Here is a summary of what the code does: */

// // core/systems/audio_system.js
// import { System } from './system.js';

// export class AudioSystem extends System {
//     constructor() {
//         super();
//         this.initialized = false;
//         this.lastEnemyUpdate = new Map(); // Pour suivre l'état des ennemis
//         this.lastMusicChange = 0;
//         this.activatedEnemies = 0;
//         this.coinsCollected = 0;
//         this.currentMusicTrack = 'music_ambient_1';
//     }

//     setGame(game) {
//         super.setGame(game);

//         // Abonnement aux événements
//         if (this.game.eventBus) {
//             this.game.eventBus.on('entityDeath', this.handleEntityDeath.bind(this));
//             this.game.eventBus.on('levelComplete', this.handleLevelComplete.bind(this));
//             this.game.eventBus.on('coinCollected', this.handleCoinCollected.bind(this));
//         }
//     }

//     init() {
//         if (this.initialized) return;

//         this.entities.forEach(entity => {
//             const audio = entity.getComponent('audio');
//             if (!audio) return;

//             // Initialiser les sons pour le joueur
//             if (entity.getComponent('input')) {
//                 this.initializePlayerSounds(audio);
//             }

//             // Initialiser les sons pour les ennemis
//             else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
//                 this.initializeEnemySounds(audio);
//             }

//             // Initialiser les sons pour les collectibles
//             else if (entity.getComponent('collectible')) {
//                 this.initializeCollectibleSounds(audio);
//             }
//         });

//         // Initialiser le son d'ambiance
//         this.initializeAmbientSounds();

//         this.initialized = true;
//     }

//     initializePlayerSounds(audio) {
//         // Sons associés aux animations du joueur
//         // audio.addSound('player_idle', './assets/sounds/player/idle.mp3', { volume: 0.2, loop: true, category: 'sfx' });
//         audio.addSound('player_run', './assets/sounds/player/run.wav', { volume: 0.4, loop: true, category: 'sfx' });
//         // audio.addSound('player_jump', './assets/sounds/player/jump.mp3', { volume: 0.5, category: 'sfx' });
//         // audio.addSound('player_roulade', './assets/sounds/player/roll.mp3', { volume: 0.6, category: 'sfx' });
//         // audio.addSound('player_attack1', './assets/sounds/player/attack1.mp3', { volume: 0.7, category: 'sfx' });
//         // audio.addSound('player_attack2', './assets/sounds/player/attack2.mp3', { volume: 0.7, category: 'sfx' });
//         // audio.addSound('player_attack3', './assets/sounds/player/attack3.mp3', { volume: 0.7, category: 'sfx' });
//         // audio.addSound('player_magicAttack', './assets/sounds/player/magic.mp3', { volume: 0.6, category: 'sfx' });
//         // audio.addSound('player_arrowShoot', './assets/sounds/player/arrow.mp3', { volume: 0.5, category: 'sfx' });
//         // audio.addSound('player_hurt', './assets/sounds/player/hurt.mp3', { volume: 0.7, category: 'sfx' });
//         // audio.addSound('player_death', './assets/sounds/player/death.mp3', { volume: 0.8, category: 'sfx' });
//     }

//     initializeEnemySounds(audio) {
//         // Sons associés aux ennemis
//         audio.addSound('enemy_idle', './assets/sounds/enemy/idle.mp3', { volume: 0.3, loop: true, category: 'sfx' });
//         audio.addSound('enemy_magic', './assets/sounds/enemy/magic.mp3', { volume: 0.6, loop: true, category: 'sfx' });
//         audio.addSound('enemy_hurt', './assets/sounds/enemy/hurt.mp3', { volume: 0.7, category: 'sfx' });
//         audio.addSound('enemy_death', './assets/sounds/enemy/death.mp3', { volume: 0.8, category: 'sfx' });
//         audio.addSound('enemy_detection', './assets/sounds/enemy/detection.mp3', { volume: 0.5, category: 'sfx' });
//     }

//     initializeCollectibleSounds(audio) {
//         // Sons associés aux collectibles
//         audio.addSound('coin_collect', './assets/sounds/collectibles/coin.mp3', { volume: 0.6, category: 'sfx' });
//         audio.addSound('portal_active', './assets/sounds/collectibles/portal.mp3', { volume: 0.7, loop: true, category: 'sfx' });
//     }

//     initializeAmbientSounds() {
//         // Ambiance sonore
//         const worldAudio = this.getOrCreateWorldAudio();
//         worldAudio.addSound('music_ambient_1', './assets/sounds/music/ambient_1.mp3', { volume: 0.4, loop: true, category: 'music' });
//         worldAudio.addSound('music_ambient_2', './assets/sounds/music/ambient_2.mp3', { volume: 0.4, loop: true, category: 'music' });
//         worldAudio.addSound('music_ambient_3', './assets/sounds/music/ambient_3.mp3', { volume: 0.5, loop: true, category: 'music' });
//         worldAudio.addSound('music_intense', './assets/sounds/music/intense.mp3', { volume: 0.6, loop: true, category: 'music' });
//         worldAudio.addSound('level_complete', './assets/sounds/music/level_complete.mp3', { volume: 0.7, category: 'music' });

//         // Démarrer la musique d'ambiance
//         worldAudio.playSound('music_ambient_1', { fadeIn: 2000 });
//     }

//     getOrCreateWorldAudio() {
//         // Trouver ou créer une entité pour les sons globaux
//         let worldEntity = Array.from(this.entities).find(entity => entity.getComponent('world_audio'));

//         if (!worldEntity) {
//             const { Entity } = require('../entities/entity.js');
//             worldEntity = new Entity();
//             worldEntity.addComponent('world_audio', true);
//             worldEntity.addComponent('audio', new Audio());
//             this.game.addEntity(worldEntity);
//         }

//         return worldEntity.getComponent('audio');
//     }

//     update(deltaTime) {
//         if (!this.initialized) {
//             this.init();
//         }

//         this.entities.forEach(entity => {
//             const audio = entity.getComponent('audio');
//             if (!audio) return;

//             // Gestion des sons du joueur
//             if (entity.getComponent('input')) {
//                 this.updatePlayerSounds(entity, audio, deltaTime);
//             }

//             // Gestion des sons des ennemis
//             else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
//                 this.updateEnemySounds(entity, audio, deltaTime);
//             }
//         });

//         // Mettre à jour la musique d'ambiance
//         this.updateAmbientMusic(deltaTime);
//     }

//     updatePlayerSounds(entity, audio, deltaTime) {
//         const animation = entity.getComponent('animation');
//         const input = entity.getComponent('input');
//         const property = entity.getComponent('property');

//         if (!animation || !input) return;

//         const currentState = animation.currentState;

//         // Si l'état de l'animation a changé
//         if (currentState !== audio.lastAnimationState) {
//             // Arrêter le son de l'animation précédente
//             if (audio.lastAnimationState) {
//                 audio.stopSound(`player_${audio.lastAnimationState}`, { fadeOut: 200 });
//             }

//             // Jouer le son correspondant à la nouvelle animation
//             switch (currentState) {
//                 case 'idle':
//                     audio.playSound('player_idle', { fadeIn: 300 });
//                     break;
//                 case 'run':
//                     audio.playSound('player_run', { fadeIn: 200 });
//                     break;
//                 case 'jump':
//                     audio.playSound('player_jump');
//                     break;
//                 case 'roulade':
//                     audio.playSound('player_roulade');
//                     break;
//                 case 'attack1':
//                     audio.playSound('player_attack1');
//                     break;
//                 case 'attack2':
//                     audio.playSound('player_attack2');
//                     break;
//                 case 'attack3':
//                     audio.playSound('player_attack3');
//                     break;
//                 case 'magicAttack':
//                     audio.playSound('player_magicAttack');
//                     break;
//                 case 'arrowShoot':
//                     audio.playSound('player_arrowShoot');
//                     break;
//                 case 'hurt':
//                     audio.playSound('player_hurt');
//                     break;
//                 case 'death':
//                     audio.playSound('player_death');
//                     // Arrêter les autres sons
//                     audio.currentSounds.forEach((soundInfo, id) => {
//                         if (id !== 'player_death') {
//                             audio.stopSound(id, { fadeOut: 500 });
//                         }
//                     });
//                     break;
//             }

//             audio.lastAnimationState = currentState;
//         }

//         // Suivre le mouvement pour les sons continus
//         const isMoving = input.vector.h !== 0 || !property.isOnGround;
//         if (isMoving !== audio.isMoving) {
//             audio.isMoving = isMoving;

//             // Ajuster le volume des pas en fonction du mouvement
//             if (audio.currentSounds.has('player_run')) {
//                 const runSound = audio.currentSounds.get('player_run').audio;
//                 if (isMoving) {
//                     audio.fadeIn(runSound, 0.4, 300);
//                 } else {
//                     audio.fadeOut(runSound, 300);
//                 }
//             }
//         }
//     }

//     updateEnemySounds(entity, audio, deltaTime) {
//         const animation = entity.getComponent('animation');
//         const property = entity.getComponent('property');
//         const player = this.findPlayer();

//         if (!animation || !player) return;

//         const currentState = animation.currentState;
//         const playerInRange = this.isPlayerInRange(entity, player);

//         // Si l'état de l'animation a changé
//         if (currentState !== audio.lastAnimationState) {
//             // Arrêter le son de l'animation précédente
//             if (audio.lastAnimationState) {
//                 audio.stopSound(`enemy_${audio.lastAnimationState}`, { fadeOut: 200 });
//             }

//             // Jouer le son correspondant à la nouvelle animation
//             switch (currentState) {
//                 case 'idle':
//                 case 'idle2':
//                     audio.playSound('enemy_idle', { fadeIn: 300 });
//                     break;
//                 case 'magic':
//                     audio.playSound('enemy_magic', { volume: playerInRange ? 0.8 : 0.3 });
//                     break;
//                 case 'hurt':
//                 case 'hurt1':
//                     audio.playSound('enemy_hurt');
//                     break;
//                 case 'death':
//                     audio.playSound('enemy_death');
//                     // Arrêter les autres sons
//                     audio.currentSounds.forEach((soundInfo, id) => {
//                         if (id !== 'enemy_death') {
//                             audio.stopSound(id, { fadeOut: 300 });
//                         }
//                     });
//                     break;
//             }

//             audio.lastAnimationState = currentState;
//         }

//         // Gestion du son de magie en fonction de la proximité du joueur
//         if (currentState === 'magic' && audio.currentSounds.has('enemy_magic')) {
//             const now = Date.now();
//             const magicSound = audio.currentSounds.get('enemy_magic').audio;

//             if (playerInRange) {
//                 // Joueur dans la zone de détection: volume élevé
//                 audio.enemyDetectionTime = now;
//                 magicSound.volume = 0.8;
//             } else if (now - audio.enemyDetectionTime > 2000) {
//                 // Plus de 2 secondes sans joueur dans la zone: volume réduit
//                 magicSound.volume = 0.3;

//                 // Légère augmentation si l'ennemi est en mouvement
//                 if (property.isMoving) {
//                     magicSound.volume = 0.45;
//                 }
//             }
//         }

//         // Détection du joueur
//         if (playerInRange && !this.lastEnemyUpdate.has(entity.uuid)) {
//             audio.playSound('enemy_detection');
//             this.lastEnemyUpdate.set(entity.uuid, Date.now());
//             this.activatedEnemies++;
//         } else if (!playerInRange && this.lastEnemyUpdate.has(entity.uuid)) {
//             // Réinitialisation si le joueur n'est plus dans la zone
//             this.lastEnemyUpdate.delete(entity.uuid);
//         }
//     }

//     updateAmbientMusic(deltaTime) {
//         // Obtenir le nombre de pièces collectées et d'ennemis activés
//         const collectibleSystem = this.findCollectibleSystem();
//         if (!collectibleSystem) return;

//         const coins = collectibleSystem.coinsCollected || 0;
//         const worldAudio = this.getOrCreateWorldAudio();

//         // Si le nombre de coins a changé
//         if (coins !== this.coinsCollected) {
//             this.coinsCollected = coins;

//             // Choisir la piste en fonction du nombre de pièces et d'ennemis
//             let nextTrack = 'music_ambient_1';

//             if (coins >= 5) {
//                 nextTrack = 'music_ambient_3';
//             } else if (coins >= 3 || this.activatedEnemies >= 3) {
//                 nextTrack = 'music_ambient_2';
//             } else if (this.activatedEnemies >= 1) {
//                 nextTrack = 'music_intense';
//             }

//             // Changer la musique si nécessaire
//             if (nextTrack !== this.currentMusicTrack) {
//                 worldAudio.stopSound(this.currentMusicTrack, { fadeOut: 1000 });
//                 worldAudio.playSound(nextTrack, { fadeIn: 1000 });
//                 this.currentMusicTrack = nextTrack;
//             }
//         }
//     }

//     // Gestion des événements
//     handleEntityDeath(entity) {
//         // if (!entity.getComponent('input')) {
//         //     // C'est un ennemi qui est mort
//         //     this.activatedEnemies = Math.max(0, this.activatedEnemies - 1);
//         // }
//     }

//     handleLevelComplete() {
//         // const worldAudio = this.getOrCreateWorldAudio();
//         // worldAudio.stopSound(this.currentMusicTrack, { fadeOut: 500 });
//         // worldAudio.playSound('level_complete');
//     }

//     handleCoinCollected() {
//         // Appelé quand une pièce est collectée (déjà géré via le compteur)
//     }

//     // Méthodes utilitaires
//     findPlayer() {
//         return Array.from(this.entities).find(entity => entity.getComponent('input'));
//     }

//     findCollectibleSystem() {
//         return Array.from(this.game.systems).find(system => system.constructor.name === 'Collectible');
//     }

//     isPlayerInRange(entity, player) {
//         const entityPos = entity.getComponent('position');
//         const entityHitbox = entity.getComponent('circle_hitbox');
//         const playerPos = player.getComponent('position');

//         if (!entityPos || !entityHitbox || !playerPos) return false;

//         const dx = entityPos.x - playerPos.x;
//         const dy = entityPos.y - playerPos.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);

//         return distance <= entityHitbox.rangedRadius;
//     }
// }
