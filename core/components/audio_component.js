// core/components/audio_component.js
import { Component } from './component.js';

export class Audio extends Component {
  constructor() {
    super();
    this.sounds = new Map(); // Map pour stocker les sons
    this.currentSounds = new Map(); // Sons actuellement en lecture
    this.lastAnimationState = null; // Pour suivre les changements d'animations
    this.enemyDetectionTime = 0; // Temps de détection pour les ennemis
    this.isMoving = false; // Suivi du mouvement
    this.volume = 1.0; // Volume de base
    this.jumpSoundCooldown = 0; // Cooldown pour le son de saut
    this.jumpSoundTimer = 0; // Timer actuel
  }

  update(deltaTime) {
    // Mettre à jour le timer pour le son de saut
    if (this.jumpSoundTimer > 0) {
      this.jumpSoundTimer -= deltaTime;
    }
  }

  /**
   * Ajoute un son à la collection
   * @param {string} id - Identifiant du son
   * @param {string} path - Chemin du fichier audio
   * @param {Object} options - Options (loop, volume, etc.)
   */
  addSound(id, path, options = {}) {
    try {
      // Vérifier que le fichier existe
      fetch(path, { method: 'HEAD' })
        .then((response) => {
          if (!response.ok) {
            console.warn(`Le fichier audio ${path} n'existe pas ou n'est pas accessible.`);
          }
        })
        .catch((error) => {
          console.warn(`Erreur lors de la vérification du fichier ${path}:`, error);
        });

      const sound = {
        path,
        audio: null,
        loop: options.loop || false,
        volume: options.volume || 1.0,
        fadeTime: options.fadeTime || 0,
        category: options.category || 'sfx',
        // Créer l'élément audio immédiatement pour les sons d'ambiance
        preload: options.preload || options.category === 'music',
      };

      // Précharger les sons d'ambiance
      if (sound.preload) {
        sound.audio = new window.Audio(path);
        sound.audio.preload = 'auto';
        sound.audio.loop = sound.loop;
        sound.audio.volume = sound.volume;

        // Forcer le préchargement
        sound.audio.load();
      }

      this.sounds.set(id, sound);
    } catch (error) {
      console.error(`Erreur lors de l'ajout du son ${id}:`, error);
    }
  }

  /**
   * Joue un son avec gestion spéciale pour certains sons
   */
  playSound(id, options = {}) {
    try {
      // Vérifier si le son existe
      if (!this.sounds.has(id)) {
        console.warn(`Son non trouvé: ${id}`);
        return null;
      }

      // Gestion spéciale du son de saut avec cooldown
      if (id === 'player_jump') {
        if (this.jumpSoundTimer > 0) {
          return null;
        }
        // Définir le cooldown pour éviter les répétitions trop fréquentes
        this.jumpSoundTimer = this.jumpSoundCooldown || 0.3; // 300ms par défaut
      }

      const soundData = this.sounds.get(id);

      // Créer l'objet Audio s'il n'existe pas encore
      if (!soundData.audio) {
        try {
          soundData.audio = new window.Audio(soundData.path);
          soundData.audio.preload = 'auto';
          soundData.audio.loop = soundData.loop;
          // Forcer le préchargement
          soundData.audio.load();
        } catch (audioError) {
          console.error(`Erreur de création audio pour ${id}:`, audioError);
          return null;
        }
      }

      const audio = soundData.audio;
      if (!audio) {
        console.error(`Objet audio non initialisé pour ${id}`);
        return null;
      }

      // Solution pour les problèmes de lecture multiple
      if (id.includes('player_run') || id.includes('idle') || id === 'music_ambient_1') {
        // Pour ces sons en boucle, utiliser un nouvel objet audio à chaque fois
        // pour éviter les problèmes de lecture simultanée
        try {
          const freshAudio = new window.Audio(soundData.path);
          freshAudio.preload = 'auto';
          freshAudio.loop = soundData.loop;
          freshAudio.volume = options.volume !== undefined ? options.volume : soundData.volume;

          // Pour les sons ambiants, augmenter significativement le volume
          if (id.startsWith('music_ambient')) {
            freshAudio.volume = Math.min(1.0, freshAudio.volume * 3);
          }

          // Tenter de lire immédiatement
          const playPromise = freshAudio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.currentSounds.set(id, {
                  audio: freshAudio,
                  timestamp: Date.now(),
                });
              })
              .catch((error) => {
                console.error(`Erreur de lecture du son ${id} (objet frais):`, error);

                // Si l'erreur est liée à l'interaction utilisateur, ajouter un gestionnaire de clic
                if (error.name === 'NotAllowedError') {
                  this.addUserInteractionHandler(freshAudio, id);
                }
              });
          }

          return freshAudio;
        } catch (error) {
          console.error(`Erreur avec l'objet audio frais pour ${id}:`, error);
        }
      }

      // Pour les autres sons
      audio.volume = options.volume !== undefined ? options.volume : soundData.volume;

      // Arrêter le son s'il est déjà en cours de lecture
      if (this.currentSounds.has(id)) {
        this.stopSound(id);
      }
      // Démarrer la lecture avec gestion d'erreur
      try {
        // Use a promise to handle potential errors
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Gérer les fade-in si nécessaire
              if (options.fadeIn) {
                audio.volume = 0;
                this.fadeIn(audio, options.volume || soundData.volume, options.fadeIn);
              }

              // Stocker le son en cours de lecture
              this.currentSounds.set(id, {
                audio,
                timestamp: Date.now(),
              });
            })
            .catch((error) => {
              console.error(`Erreur de lecture du son ${id}:`, error);

              // Si l'erreur est liée à l'interaction utilisateur, ajouter un gestionnaire de clic
              if (error.name === 'NotAllowedError') {
                this.addUserInteractionHandler(audio, id);
              }
            });
        }

        return audio;
      } catch (playError) {
        console.error(`Erreur lors de la lecture du son ${id}:`, playError);
        return null;
      }
    } catch (error) {
      console.error(`Erreur globale dans playSound pour ${id}:`, error);
      return null;
    }
  }

  // Ajoute un gestionnaire pour activer l'audio après une interaction utilisateur
  addUserInteractionHandler(audio, id) {
    console.warn(`Audio bloqué pour ${id} - Attente d'interaction utilisateur`);

    // Créer un bouton temporaire pour activer l'audio
    const button = document.createElement('button');
    button.textContent = 'Activer le son';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    button.onclick = () => {
      audio
        .play()
        .then(() => {
          document.body.removeChild(button);
        })
        .catch((error) => {
          console.error(`Échec de l'activation audio:`, error);
        });
    };

    document.body.appendChild(button);
  }

  /**
   * Arrête un son
   * @param {string} id - Identifiant du son à arrêter
   * @param {Object} options - Options d'arrêt (fadeOut, etc.)
   */
  stopSound(id, options = {}) {
    try {
      if (!this.currentSounds.has(id)) return;

      const soundInfo = this.currentSounds.get(id);
      const audio = soundInfo.audio;

      if (!audio) return;

      if (options.fadeOut) {
        this.fadeOut(audio, options.fadeOut);
      } else {
        if (typeof audio.pause === 'function') {
          audio.pause();
          if (audio.currentTime !== undefined) {
            audio.currentTime = 0;
          }
        }
      }

      this.currentSounds.delete(id);
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du son ${id}:`, error);
    }
  }

  /**
   * Animation de fade-in (augmentation progressive du volume)
   */
  fadeIn(audio, targetVolume, duration) {
    try {
      const startVolume = 0;
      const volumeStep = targetVolume / (duration / 50);
      let currentVolume = startVolume;

      const fadeInterval = setInterval(() => {
        currentVolume += volumeStep;
        if (currentVolume >= targetVolume) {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
        } else {
          audio.volume = currentVolume;
        }
      }, 50);
    } catch (error) {
      console.error('Erreur dans fadeIn:', error);
    }
  }

  /**
   * Animation de fade-out (diminution progressive du volume)
   */
  fadeOut(audio, duration) {
    try {
      const startVolume = audio.volume;
      const volumeStep = startVolume / (duration / 50);
      let currentVolume = startVolume;

      const fadeInterval = setInterval(() => {
        currentVolume -= volumeStep;
        if (currentVolume <= 0) {
          audio.volume = 0;
          if (typeof audio.pause === 'function') {
            audio.pause();
            if (audio.currentTime !== undefined) {
              audio.currentTime = 0;
            }
          }
          clearInterval(fadeInterval);
        } else {
          audio.volume = currentVolume;
        }
      }, 50);
    } catch (error) {
      console.error('Erreur dans fadeOut:', error);
    }
  }

  /**
   * Ajuste le volume global d'une catégorie de sons
   * @param {string} category - Catégorie ('sfx', 'music', etc.)
   * @param {number} volume - Nouveau volume (0.0 à 1.0)
   */
  setVolume(category, volume) {
    try {
      this.sounds.forEach((sound, id) => {
        if (sound.category === category && sound.audio) {
          sound.audio.volume = volume;
        }
      });
    } catch (error) {
      console.error('Erreur dans setVolume:', error);
    }
  }
}
