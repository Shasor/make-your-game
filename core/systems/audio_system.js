// core/systems/audio_system.js
import { System } from './system.js';
import { Entity } from '../entities/entity.js';
import { Audio } from '../components/audio_component.js';

export class AudioSystem extends System {
    constructor() {
        super();
        this.initialized = false;
        this.worldEntity = null;

        // Track current music/ambient state
        this.currentMapThemeId = null;
        this.ambientTrackId = 'ambient_track';
        this.ambientMusicStarted = false;

        // Nouvelles propriétés pour la rotation de thèmes et sons d'ambiance aléatoires
        this.mapThemes = [];
        this.musicRotationTimer = 0;
        this.musicRotationInterval = 60; // 1 minutes par défaut
        this.ambientSounds = [];

        // Vérification pour le son detection.wav
        this.detectionSoundChecked = false;

        // Debug flag
        this.debug = false;
    }

    setGame(game) {
        super.setGame(game);

        // Subscribe to events
        if (this.game.eventBus) {
            this.game.eventBus.on('levelComplete', this.handleLevelComplete.bind(this));
            this.game.eventBus.on('mapMusicChange', this.handleMapMusicChange.bind(this));
            this.game.eventBus.on('portalCollected', this.handlePortalCollected.bind(this));
            this.game.eventBus.on('coinCollected', this.handleCoinCollected.bind(this));
            this.game.eventBus.on('entityDeath', this.handleEntityDeath.bind(this));

            // Nouveaux événements
            this.game.eventBus.on('playRandomAmbient', this.playRandomAmbientSound.bind(this));
            this.game.eventBus.on('toggleMusicRotation', this.toggleMusicRotation.bind(this));
            this.game.eventBus.on('enemyDetection', this.handleEnemyDetection.bind(this));
            this.game.eventBus.on('cutsceneMusic', this.handleCutsceneMusic.bind(this));
            this.game.eventBus.on('stopCutsceneMusic', this.handleStopCutsceneMusic.bind(this));

        }
        // Rendre le système audio disponible globalement pour le menu d'options
        if (window) {
            window.audioSystem = this;
        }
    }

    init() {
        if (this.initialized) return;

        console.log("Initializing audio system");

        // Create world entity for global sounds (music, ambient)
        this.createWorldEntity();

        // Initialize sounds for entities
        this.initEntitySounds();

        // Initialize ambient sounds
        this.initializeAmbientSounds();

        // Create debug controls if needed
        if (this.debug) {
            this.createVolumeControls();
        }

        this.initialized = true;
    }

    /**
     * Create world entity to handle global sounds like music
     */
    createWorldEntity() {
        this.worldEntity = new Entity();
        this.worldEntity.uuid = "world_audio_entity";
        this.worldEntity.addComponent('world_audio', true);
        this.worldEntity.addComponent('audio', new Audio());
        this.game.addEntity(this.worldEntity);
    }

    /**
     * Initialize sounds for all entities
     */
    initEntitySounds() {
        this.entities.forEach(entity => {
            // Skip world entity
            if (entity.getComponent('world_audio')) return;

            const audio = entity.getComponent('audio');
            if (!audio) return;

            // Player sounds
            if (entity.getComponent('input')) {
                this.initializePlayerSounds(audio);
            }
            // Enemy sounds
            else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
                this.initializeEnemySounds(audio);
            }
            // Collectible sounds
            else if (entity.getComponent('collectible')) {
                this.initializeCollectibleSounds(audio);
            }
        });
    }

    /**
     * Initialize player sounds
     */
    initializePlayerSounds(audio) {
        // Movement sounds
        audio.addSound('player_idle', './assets/sounds/player/idle.wav',
            { volume: 0.2, loop: true, category: 'sfx' });
        audio.addSound('player_run', './assets/sounds/player/run.wav',
            { volume: 0.9, loop: true, category: 'sfx' });
        audio.addSound('player_jump', './assets/sounds/player/jump.wav',
            { volume: 0.9, category: 'sfx', cooldown: 0.3 });

        // Action sounds
        audio.addSound('player_roulade', './assets/sounds/player/roll.wav',
            { volume: 0.8, category: 'sfx' });
        audio.addSound('player_attack1', './assets/sounds/player/attack1.wav',
            { volume: 0.8, category: 'sfx' });
        audio.addSound('player_attack2', './assets/sounds/player/attack2.wav',
            { volume: 0.8, category: 'sfx' });
        audio.addSound('player_attack3', './assets/sounds/player/attack3.wav',
            { volume: 0.8, category: 'sfx' });
        audio.addSound('player_magicAttack', './assets/sounds/player/magic.wav',
            { volume: 0.6, category: 'sfx' });
        audio.addSound('player_arrowShoot', './assets/sounds/player/arrow.wav',
            { volume: 0.5, category: 'sfx' });

        // Damage sounds
        audio.addSound('player_hurt', './assets/sounds/player/hurt.wav',
            { volume: 0.9, category: 'sfx' });
        audio.addSound('player_death', './assets/sounds/player/death.wav',
            { volume: 0.9, category: 'sfx' });
    }

    /**
     * Initialize enemy sounds
     */
    initializeEnemySounds(audio) {
        audio.addSound('enemy_idle', './assets/sounds/enemy/idle.wav',
            { volume: 0.3, loop: true, category: 'sfx' });
        audio.addSound('enemy_magic', './assets/sounds/enemy/magic.wav',
            { volume: 0.9, category: 'sfx' });
        audio.addSound('enemy_hurt', './assets/sounds/enemy/hurt.wav',
            { volume: 0.9, category: 'sfx' });
        audio.addSound('enemy_death', './assets/sounds/enemy/death1.wav',
            { volume: 0.9, category: 'sfx' });
        audio.addSound('enemy_detection', './assets/sounds/enemy/detection.wav',
            { volume: 0.9, category: 'sfx', cooldown: 2.0 });
    }

    /**
     * Initialize collectible sounds
     */
    initializeCollectibleSounds(audio) {
        audio.addSound('coin_collect', './assets/sounds/collectibles/coin.wav',
            { volume: 0.6, category: 'sfx' });
        audio.addSound('portal_active', './assets/sounds/collectibles/portal.wav',
            { volume: 0.8, loop: true, category: 'sfx' });
    }

    /**
     * Initialize ambient sounds
     */
    initializeAmbientSounds() {
        if (!this.worldEntity) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Add main ambient track with reduced volume
        worldAudio.addSound(this.ambientTrackId, './assets/sounds/music/ambient_1.wav',
            { volume: 0.1, loop: true, category: 'ambient', preload: true });

        // Ajouter des sons d'ambiance supplémentaires qui seront joués aléatoirement
        // Note: On utilise les sons existants mais dans un contexte d'ambiance aléatoire
        const ambientSounds = [
            { id: 'ambient_wind', path: './assets/sounds/environment/wind.wav', volume: 0.15 },
            { id: 'ambient_creak', path: './assets/sounds/environment/creak.wav', volume: 0.2 },
            { id: 'ambient_distant', path: './assets/sounds/environment/distant.wav', volume: 0.25 }
        ];

        // Si les fichiers spécifiques n'existent pas, nous pouvons créer des placeholders
        if (!this.fileExists('./assets/sounds/environment/wind.wav')) {
            console.log("Sons d'ambiance non trouvés, utilisation des sons existants comme placeholders");

            // Utiliser d'autres sons comme placeholders
            ambientSounds[0].path = './assets/sounds/player/idle.wav';
            ambientSounds[1].path = './assets/sounds/enemy/idle.wav';
            ambientSounds[2].path = './assets/sounds/collectibles/portal.wav';
        }

        // Ajouter ces sons au composant audio
        ambientSounds.forEach(sound => {
            worldAudio.addSound(sound.id, sound.path,
                { volume: sound.volume, loop: false, category: 'ambient', preload: true });
            this.ambientSounds.push(sound.id);
        });

        // Démarrer avec l'ambiance principale, mais à un volume réduit
        setTimeout(() => this.startAmbientMusic(), 300);
    }

    // méthode pour vérifier si un fichier existe
    fileExists(path) {
        // Dans un contexte de navigateur, c'est difficile à vérifier
        // Pour l'implémentation, nous supposons que le fichier existe
        // Une implémentation réelle pourrait utiliser une requête HEAD ou un cache
        return true;
    }

    /**
     * Start ambient background music
     */
    startAmbientMusic() {
        if (!this.worldEntity) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        try {
            const audio = worldAudio.playSound(this.ambientTrackId, {
                fadeIn: 1500
            });

            if (audio) {
                this.ambientMusicStarted = true;
                console.log("Ambient music started successfully");
            }
        } catch (error) {
            console.error("Error starting ambient music:", error);
        }
    }

    /**
     * Start map music
     */
    startMapMusic(mapNumber = 1) {
        if (!this.worldEntity) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Arrêter tous les thèmes musicaux en cours
        if (this.currentMapThemeId) {
            worldAudio.stopSound(this.currentMapThemeId, { fadeOut: 1000 });
        }

        // Nettoyer les anciens thèmes
        this.mapThemes = [];

        // Ajouter les thèmes disponibles pour cette map
        const themes = [
            { id: `map${mapNumber}_theme_main`, path: `./assets/sounds/music/map${mapNumber}_theme.wav`, volume: 0.2 }
        ];

        // Tenter d'ajouter d'autres variations si elles existent
        if (mapNumber > 1) {
            // Ajouter aussi le thème de la map précédente comme variation
            themes.push({
                id: `map${mapNumber - 1}_theme_var`,
                path: `./assets/sounds/music/map${mapNumber - 1}_theme.wav`,
                volume: 0.15
            });
        }

        // Enregistrer les thèmes dans le composant audio et dans notre liste
        themes.forEach(theme => {
            worldAudio.addSound(theme.id, theme.path, {
                volume: theme.volume,
                loop: true,
                category: 'music',
                preload: true
            });

            this.mapThemes.push(theme.id);
        });

        // Activer la rotation des thèmes
        worldAudio.setMusicRotation(true);

        // Démarrer avec le premier thème
        this.currentMapThemeId = themes[0].id;
        setTimeout(() => {
            worldAudio.playSound(this.currentMapThemeId, { fadeIn: 1000 });
        }, 200);
    }

    // méthode pour jouer un son d'ambiance aléatoire
    playRandomAmbientSound() {
        if (!this.worldEntity || this.ambientSounds.length === 0) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Choisir un son aléatoire
        const randomIndex = Math.floor(Math.random() * this.ambientSounds.length);
        const soundId = this.ambientSounds[randomIndex];

        // Jouer le son avec un fade-in et fade-out
        worldAudio.playSound(soundId, { fadeIn: 500 });

        // Arrêter le son après une durée aléatoire (entre 3 et 8 secondes)
        const duration = 3000 + Math.random() * 5000;
        setTimeout(() => {
            worldAudio.stopSound(soundId, { fadeOut: 1000 });
        }, duration);
    }

    /**
     * Create volume control UI for debugging
     */
    createVolumeControls() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.left = '10px';
        container.style.backgroundColor = 'rgba(0,0,0,0.7)';
        container.style.color = 'white';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.zIndex = '9999';
        container.style.fontFamily = 'Press Start 2P, sans-serif';

        const title = document.createElement('div');
        title.textContent = 'Audio Volume';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        container.appendChild(title);

        // Create volume controls
        this.addVolumeSlider(container, 'Master', 'master');
        this.addVolumeSlider(container, 'Music', 'music');
        this.addVolumeSlider(container, 'SFX', 'sfx');
        this.addVolumeSlider(container, 'Ambient', 'ambient');

        document.body.appendChild(container);
    }

    /**
     * Helper to create a volume slider
     */
    addVolumeSlider(container, label, category) {
        const div = document.createElement('div');
        div.style.margin = '5px 0';
        div.style.display = 'flex';
        div.style.alignItems = 'center';

        const text = document.createElement('span');
        text.textContent = `${label}: `;
        text.style.width = '70px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = category === 'master' ? 100 :
            (category === 'music' ? 50 :
                (category === 'ambient' ? 20 : 80));
        slider.style.width = '100px';

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = (parseInt(slider.value) / 100).toFixed(2);
        valueDisplay.style.marginLeft = '10px';
        valueDisplay.style.width = '40px';

        slider.oninput = () => {
            const value = parseInt(slider.value) / 100;
            valueDisplay.textContent = value.toFixed(2);
            this.setVolumeForAllEntities(category, value);
        };

        div.appendChild(text);
        div.appendChild(slider);
        div.appendChild(valueDisplay);
        container.appendChild(div);
    }

    /**
     * Set volume for all entities
     */
    setVolumeForAllEntities(category, level) {
        this.entities.forEach(entity => {
            const audio = entity.getComponent('audio');
            if (!audio) return;

            if (category === 'master') {
                audio.setMasterVolume(level);
            } else {
                audio.setCategoryVolume(category, level);
            }
        });
    }

    /**
     * Update loop
     */
    update(deltaTime) {
        if (!this.initialized) {
            this.init();
            return;
        }

        // Update audio components
        this.entities.forEach(entity => {
            const audio = entity.getComponent('audio');
            if (!audio) return;

            // Update timers
            audio.update(deltaTime);

            // Update player sounds
            if (entity.getComponent('input')) {
                this.updatePlayerSounds(entity, audio, deltaTime);
            }
            // Update enemy sounds
            else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
                this.updateEnemySounds(entity, audio, deltaTime);
            }
        });

        // Gérer la rotation de thèmes musicaux
        if (this.worldEntity) {
            const worldAudio = this.worldEntity.getComponent('audio');
            if (worldAudio && worldAudio.musicRotationEnabled && this.mapThemes.length > 1) {
                this.musicRotationTimer += deltaTime;

                if (this.musicRotationTimer >= this.musicRotationInterval) {
                    this.musicRotationTimer = 0;

                    // Choisir le prochain thème de façon aléatoire, différent du thème actuel
                    let nextThemeIndex;
                    do {
                        nextThemeIndex = Math.floor(Math.random() * this.mapThemes.length);
                    } while (this.mapThemes[nextThemeIndex] === this.currentMapThemeId && this.mapThemes.length > 1);

                    const nextThemeId = this.mapThemes[nextThemeIndex];

                    // Arrêter le thème actuel
                    worldAudio.stopSound(this.currentMapThemeId, { fadeOut: 2000 });

                    // Attendre que le fade-out soit terminé avant de jouer le nouveau thème
                    setTimeout(() => {
                        this.currentMapThemeId = nextThemeId;
                        worldAudio.playSound(nextThemeId, { fadeIn: 2000 });
                    }, 2200);
                }
            }
        }

        // Vérifier une seule fois si detection.wav fonctionne
        if (!this.detectionSoundChecked) {
            this.checkDetectionSound();
            this.detectionSoundChecked = true;
        }
    }

    /**
     * Update player sounds based on animation state
     */
    updatePlayerSounds(entity, audio, deltaTime) {
        const animation = entity.getComponent('animation');
        if (!animation) return;

        const currentState = animation.currentState;

        // If animation state changed
        if (currentState !== audio.lastAnimationState) {
            // Handle movement sounds
            if (['idle', 'run', 'jump'].includes(currentState)) {
                // Stop previous movement sound
                if (audio.lastAnimationState &&
                    ['idle', 'run', 'jump'].includes(audio.lastAnimationState)) {
                    audio.stopSound(`player_${audio.lastAnimationState}`);
                }

                // Play new movement sound
                if (audio.sounds.has(`player_${currentState}`)) {
                    audio.playSound(`player_${currentState}`);
                }
            }
            // Handle action sounds
            else if (['attack1', 'attack2', 'attack3', 'magicAttack', 'arrowShoot', 'roulade'].includes(currentState)) {
                const soundKey = `player_${currentState}`;
                if (audio.sounds.has(soundKey)) {
                    audio.playSound(soundKey);
                }
            }
            // Handle damage sounds
            else if (['hurt', 'death'].includes(currentState)) {
                const soundKey = `player_${currentState}`;
                if (audio.sounds.has(soundKey)) {
                    audio.playSound(soundKey);
                }
            }

            audio.lastAnimationState = currentState;
        }
    }

    /**
     * Update enemy sounds based on animation state
     */
    updateEnemySounds(entity, audio, deltaTime) {
        const animation = entity.getComponent('animation');
        if (!animation) return;

        const currentState = animation.currentState;

        // If animation state changed
        if (currentState !== audio.lastAnimationState) {
            // Map animation states to sound keys
            let soundKey = null;

            if (['idle', 'idle2'].includes(currentState)) {
                soundKey = 'enemy_idle';
            } else if (currentState === 'magic') {
                soundKey = 'enemy_magic';
            } else if (['hurt', 'hurt1'].includes(currentState)) {
                soundKey = 'enemy_hurt';
            } else if (currentState === 'death') {
                soundKey = 'enemy_death';
            }

            // Stop previous sound if looping
            if (audio.lastAnimationState) {
                const prevSoundKey = ['idle', 'idle2'].includes(audio.lastAnimationState)
                    ? 'enemy_idle'
                    : `enemy_${audio.lastAnimationState}`;

                if (audio.sounds.has(prevSoundKey)) {
                    audio.stopSound(prevSoundKey);
                }
            }

            // Play new sound
            if (soundKey && audio.sounds.has(soundKey)) {
                audio.playSound(soundKey);
            }

            audio.lastAnimationState = currentState;
        }
    }

    /**
     * Handle map music change event
     */
    reinitializeAudio(mapNumber) {
        console.log(`Réinitialisation de l'audio pour le niveau ${mapNumber}`);

        // Vérifier si le niveau précédent a nettoyé les entités audio
        if (!this.initialized) {
            this.init();
        }

        // S'assurer que le son d'ambiance continue
        if (this.worldEntity) {
            const worldAudio = this.worldEntity.getComponent('audio');
            if (worldAudio && !this.ambientMusicStarted) {
                this.startAmbientMusic();
            }
        }

        // Réinitialiser tous les sons pour les entités existantes
        this.entities.forEach(entity => {
            const audio = entity.getComponent('audio');
            if (!audio) return;

            if (entity.getComponent('input')) {
                // Joueur
                this.initializePlayerSounds(audio);
                console.log("Sons du joueur réinitialisés");
            } else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
                // Ennemi
                this.initializeEnemySounds(audio);
                console.log("Sons d'ennemi réinitialisés");
            } else if (entity.getComponent('collectible')) {
                // Collectible
                this.initializeCollectibleSounds(audio);
                console.log("Sons de collectible réinitialisés");
            }
        });

        // Vérifier une fois de plus le son de détection
        this.checkDetectionSound();

        console.log("Réinitialisation audio terminée");
    }

    // Modification de la méthode handleMapMusicChange pour qu'elle appelle reinitializeAudio
    handleMapMusicChange(musicData) {
        console.log("Changement de musique demandé, thèmes désactivés");

        // Vérifier si nous sommes en train de changer de map
        if (musicData && musicData.mapNumber) {
            // Assurez-vous que les sons du nouveau niveau sont chargés
            this.reinitializeAudio(musicData.mapNumber);
        }

        return;
    }


    // Méthode pour gérer la musique des cutscenes
    handleCutsceneMusic(data) {
        if (!this.worldEntity) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Arrêter d'abord toute musique en cours
        this.stopAllMusic(true);

        // Définir un ID unique pour cette musique de cutscene
        const cutsceneMusicId = 'cutscene_music_' + Date.now();

        // Ajouter et jouer la musique de la cutscene
        worldAudio.addSound(cutsceneMusicId, data.path, {
            volume: data.volume || 0.5,
            loop: true,
            category: 'music',
            preload: true
        });

        // Garder une référence à l'ID de cette musique
        this.currentCutsceneMusicId = cutsceneMusicId;

        // Jouer la musique
        setTimeout(() => {
            worldAudio.playSound(cutsceneMusicId, { fadeIn: 1000 });
        }, 200);
    }

    // Méthode pour arrêter la musique des cutscenes
    handleStopCutsceneMusic() {
        if (!this.worldEntity || !this.currentCutsceneMusicId) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Arrêter la musique de la cutscene
        worldAudio.stopSound(this.currentCutsceneMusicId, { fadeOut: 1000 });
        this.currentCutsceneMusicId = null;
    }

    //  méthode pour vérifier si detection.wav fonctionne
    checkDetectionSound() {
        // Recherche d'un ennemi
        const enemy = Array.from(this.entities).find(entity =>
            entity.getComponent('circle_hitbox') &&
            !entity.getComponent('collectible') &&
            !entity.getComponent('input'));

        if (enemy) {
            const audio = enemy.getComponent('audio');
            if (audio) {
                // Vérifier si le son est correctement enregistré
                if (audio.sounds.has('enemy_detection')) {
                    console.log("Le son de détection est correctement enregistré");
                } else {
                    console.warn("Le son de détection n'est pas enregistré");
                    // Tentative de l'ajouter
                    audio.addSound('enemy_detection', './assets/sounds/enemy/detection.wav',
                        { volume: 1.0, category: 'sfx', cooldown: 2.0 });
                }
            }
        }
    }

    //  méthode pour gérer l'événement de détection d'ennemi
    handleEnemyDetection(enemy) {
        if (!enemy) return;

        const audio = enemy.getComponent('audio');
        if (audio && audio.sounds.has('enemy_detection')) {
            audio.playSound('enemy_detection');
        }
    }

    //  méthode pour activer/désactiver la rotation des thèmes
    toggleMusicRotation(enabled) {
        if (this.worldEntity) {
            const worldAudio = this.worldEntity.getComponent('audio');
            if (worldAudio) {
                worldAudio.setMusicRotation(enabled);
            }
        }
    }

    //  méthode pour obtenir les catégories et volumes actuels (pour le menu d'options)
    getAudioSettings() {
        if (!this.worldEntity) return null;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return null;

        return {
            masterVolume: worldAudio.masterVolume,
            categories: { ...worldAudio.categories }
        };
    }

    //  méthode pour définir les volumes depuis le menu d'options
    setAudioSettings(settings) {
        if (!settings || !this.worldEntity) return false;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return false;

        // Appliquer les réglages à toutes les entités
        if (settings.masterVolume !== undefined) {
            this.setVolumeForAllEntities('master', settings.masterVolume);
        }

        if (settings.categories) {
            for (const [category, volume] of Object.entries(settings.categories)) {
                this.setVolumeForAllEntities(category, volume);
            }
        }

        return true;
    }

    /**
     * Handle level completion
     */
    handleLevelComplete() {
        this.stopAllMusic(true);
    }

    /**
     * Handle portal collection
     */
    handlePortalCollected() {
        this.stopAllMusic(true);
    }

    /**
     * Handle entity death
     */
    handleEntityDeath(entity) {
        // Handle entity-specific sounds here
        if (entity.getComponent('input')) {
            // Player death
            const audio = entity.getComponent('audio');
            if (audio && audio.sounds.has('player_death')) {
                audio.playSound('player_death');
            }
        } else if (entity.getComponent('circle_hitbox') && !entity.getComponent('collectible')) {
            // Enemy death
            const audio = entity.getComponent('audio');
            if (audio && audio.sounds.has('enemy_death')) {
                audio.playSound('enemy_death');
            }
        }
    }

    /**
     * Handle coin collection
     */
    handleCoinCollected() {
        const player = this.findPlayer();
        if (player) {
            const audio = player.getComponent('audio');
            if (audio && audio.sounds.has('coin_collect')) {
                audio.playSound('coin_collect');
            }
        }
    }

    /**
     * Stop all music and ambient sounds
     */
    stopAllMusic(fadeOut = true) {
        if (!this.worldEntity) return;

        const worldAudio = this.worldEntity.getComponent('audio');
        if (!worldAudio) return;

        // Stop map theme
        if (this.currentMapThemeId) {
            worldAudio.stopSound(this.currentMapThemeId, {
                fadeOut: fadeOut ? 1000 : 0
            });
            this.currentMapThemeId = null;
        }

        // Stop ambient track
        if (this.ambientMusicStarted) {
            worldAudio.stopSound(this.ambientTrackId, {
                fadeOut: fadeOut ? 1000 : 0
            });
            this.ambientMusicStarted = false;
        }
    }

    /**
     * Find player entity
     */
    findPlayer() {
        return Array.from(this.entities).find(entity => entity.getComponent('input'));
    }
}