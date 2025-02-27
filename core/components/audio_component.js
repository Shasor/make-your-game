// core/components/audio_component.js
import { Component } from './component.js';

export class Audio extends Component {
    constructor() {
        super();
        this.sounds = new Map(); // Store sound definitions
        this.activeAudio = new Map(); // Store currently playing audio objects
        this.lastAnimationState = null;

        // Volume categories with updated default values
        this.categories = {
            'sfx': 1.0,      // Augmenté de 0.8 à 1.0 pour les effets sonores
            'music': 0.4,    // Réduit de 0.5 à 0.2 pour la musique
            'ambient': 0.6   // Légèrement augmenté de 0.2 à 0.3 pour l'ambiance
        };

        // Global volume
        this.masterVolume = 1.0;

        // Cooldown for frequently triggered sounds
        this.soundCooldowns = new Map();

        // Flag pour la rotation des thèmes musicaux
        this.musicRotationEnabled = true;
        this.currentMusicIndex = 0;
        this.musicThemes = [];

        // Timer pour les sons d'ambiance aléatoires
        this.ambientTimer = 0;
        this.nextAmbientTime = this._getRandomAmbientTime();
    }

    update(deltaTime) {
        // Mettre à jour les cooldowns
        this.soundCooldowns.forEach((value, key) => {
            if (value > 0) {
                this.soundCooldowns.set(key, value - deltaTime);
            }
        });

        // Gérer le timer pour les sons d'ambiance
        this.ambientTimer += deltaTime;
        if (this.ambientTimer >= this.nextAmbientTime) {
            this.ambientTimer = 0;
            this.nextAmbientTime = this._getRandomAmbientTime();

            // Déclencher un événement pour jouer un son d'ambiance aléatoire
            if (window.game && window.game.eventBus) {
                window.game.eventBus.emit('playRandomAmbient', {});
            }
        }
    }

    // Nouvelle méthode pour obtenir un délai aléatoire pour les sons d'ambiance
    _getRandomAmbientTime() {
        // Entre 30 et 120 secondes
        return 30 + Math.random() * 90;
    }

    // Nouvelle méthode pour gérer la rotation des thèmes musicaux
    setMusicRotation(enabled) {
        this.musicRotationEnabled = enabled;
    }

    // Nouvelle méthode pour ajouter un thème musical à la rotation
    addMusicTheme(id, path, options = {}) {
        const theme = { id, path, options };
        this.musicThemes.push(theme);

        // Ajouter également comme un son normal
        return this.addSound(id, path, options);
    }

    // Méthode pour passer au thème musical suivant
    nextMusicTheme() {
        if (this.musicThemes.length === 0) return null;

        this.currentMusicIndex = (this.currentMusicIndex + 1) % this.musicThemes.length;
        const theme = this.musicThemes[this.currentMusicIndex];

        // Arrêter tous les thèmes musicaux en cours
        this.activeAudio.forEach((audioObj, id) => {
            if (audioObj.category === 'music' && id !== theme.id) {
                this.stopSound(id, { fadeOut: 1000 });
            }
        });

        // Jouer le nouveau thème après un court délai
        setTimeout(() => {
            this.playSound(theme.id, { fadeIn: 1000, ...theme.options });
        }, 1200);

        return theme;
    }

    /**
     * Set volume for a specific category
     */
    setCategoryVolume(category, volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.categories[category] = volume;

        // Update all playing sounds in this category
        this.activeAudio.forEach((audioObj, id) => {
            if (audioObj.category === category) {
                this._updateAudioVolume(audioObj);
            }
        });
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.masterVolume = volume;

        // Update all playing sounds
        this.activeAudio.forEach(audioObj => {
            this._updateAudioVolume(audioObj);
        });
    }

    /**
     * Calculate and apply the final volume to an audio object
     */
    _updateAudioVolume(audioObj) {
        const finalVolume = audioObj.baseVolume *
            this.categories[audioObj.category] *
            this.masterVolume;
        audioObj.element.volume = finalVolume;
    }

    /**
     * Add a sound to the collection
     */
    addSound(id, path, options = {}) {
        try {
            const sound = {
                id,
                path,
                loop: options.loop || false,
                volume: options.volume || 1.0,
                category: options.category || 'sfx',
                cooldown: options.cooldown || 0
            };

            this.sounds.set(id, sound);

            // For music or ambient sounds, preload them
            if (options.preload || options.category === 'music' || options.category === 'ambient') {
                this._preloadSound(sound);
            }

            return true;
        } catch (error) {
            console.error(`Error adding sound ${id}:`, error);
            return false;
        }
    }

    /**
     * Preload a sound to improve responsiveness
     */
    _preloadSound(sound) {
        try {
            const audio = new window.Audio(sound.path);
            audio.preload = 'auto';
            audio.load();
        } catch (error) {
            console.warn(`Failed to preload sound ${sound.id}:`, error);
        }
    }

    /**
     * Play a sound
     */
    playSound(id, options = {}) {
        // Check if sound exists
        if (!this.sounds.has(id)) {
            console.warn(`Sound not found: ${id}`);
            return null;
        }

        const soundData = this.sounds.get(id);

        // Check cooldown (useful for jump, footsteps, etc.)
        if (soundData.cooldown > 0) {
            const currentCooldown = this.soundCooldowns.get(id) || 0;
            if (currentCooldown > 0) {
                return null;
            }
            this.soundCooldowns.set(id, soundData.cooldown);
        }

        // Stop existing instance of the same sound (except for ambient/music that can fade)
        if (this.activeAudio.has(id) && soundData.category === 'sfx') {
            this.stopSound(id);
        }

        try {
            // Create a fresh audio element
            const audioElement = new window.Audio(soundData.path);
            audioElement.loop = options.loop !== undefined ? options.loop : soundData.loop;

            // Set volume
            const baseVolume = options.volume !== undefined ? options.volume : soundData.volume;

            // Create audio object
            const audioObj = {
                element: audioElement,
                id,
                category: soundData.category,
                baseVolume,
                timestamp: Date.now()
            };

            // Set initial volume
            this._updateAudioVolume(audioObj);

            // Handle fade-in
            if (options.fadeIn && options.fadeIn > 0) {
                this._fadeIn(audioObj, options.fadeIn);
            }

            // Play the sound
            const playPromise = audioElement.play();

            // Handle play promise
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Add to active sounds
                    this.activeAudio.set(id, audioObj);
                }).catch(error => {
                    console.error(`Error playing sound ${id}:`, error);

                    // Handle autoplay restrictions
                    if (error.name === 'NotAllowedError') {
                        // Only add the interaction handler for important sounds like music
                        if (soundData.category === 'music' || soundData.category === 'ambient') {
                            this._addInteractionHandler(audioObj);
                        }
                    }
                });
            }

            return audioObj;
        } catch (error) {
            console.error(`Failed to play sound ${id}:`, error);
            return null;
        }
    }

    /**
     * Stop a sound
     */
    stopSound(id, options = {}) {
        if (!this.activeAudio.has(id)) return false;

        const audioObj = this.activeAudio.get(id);

        if (options.fadeOut && options.fadeOut > 0) {
            this._fadeOut(audioObj, options.fadeOut);
        } else {
            audioObj.element.pause();
            audioObj.element.currentTime = 0;
            this.activeAudio.delete(id);
        }

        return true;
    }

    /**
     * Fade in audio
     */
    _fadeIn(audioObj, duration) {
        const element = audioObj.element;
        const finalVolume = element.volume;

        // Start from silent
        element.volume = 0;

        const startTime = Date.now();
        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const ratio = Math.min(elapsed / duration, 1);

            element.volume = finalVolume * ratio;

            if (ratio >= 1) {
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    /**
     * Fade out audio
     */
    _fadeOut(audioObj, duration) {
        const element = audioObj.element;
        const startVolume = element.volume;
        const startTime = Date.now();
        const audioId = audioObj.id;

        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const ratio = Math.min(elapsed / duration, 1);

            element.volume = startVolume * (1 - ratio);

            if (ratio >= 1) {
                element.pause();
                element.currentTime = 0;
                this.activeAudio.delete(audioId);
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    /**
     * Add user interaction handler for autoplay-blocked sounds
     */
    _addInteractionHandler(audioObj) {
        const id = audioObj.id;

        // Create a button to enable audio
        const button = document.createElement('button');
        button.textContent = 'Enable Sound';
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
            try {
                const newElement = new window.Audio(audioObj.element.src);
                newElement.loop = audioObj.element.loop;
                newElement.volume = audioObj.element.volume;

                const newObj = {
                    ...audioObj,
                    element: newElement
                };

                newElement.play().then(() => {
                    this.activeAudio.set(id, newObj);
                    document.body.removeChild(button);
                }).catch(error => {
                    console.error('Failed to enable audio:', error);
                });
            } catch (error) {
                console.error('Error creating new audio element:', error);
            }
        };

        document.body.appendChild(button);
    }
}