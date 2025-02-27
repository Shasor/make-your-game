// core/systems/cutscene_system.js
import { System } from './system.js';

export class CutsceneSystem extends System {
    constructor() {
        super();
        this.cutscenes = {};
        this.isPlaying = false;
        this.currentCutscene = null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.container = null;
        this.imageElement = null;
        this.textElement = null; // Nouvel élément pour afficher le texte
        this.skipButton = null;
    }

    setGame(game) {
        super.setGame(game);

        // Créer le conteneur principal pour les cutscenes
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'black';
        this.container.style.display = 'none';
        this.container.style.zIndex = '1000';
        this.container.style.flexDirection = 'column';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';

        // Créer l'élément image
        this.imageElement = document.createElement('img');
        this.imageElement.style.maxWidth = '90%';
        this.imageElement.style.maxHeight = '80%';
        this.imageElement.style.objectFit = 'contain';
        this.container.appendChild(this.imageElement);

        // Créer l'élément de texte
        this.textElement = document.createElement('div');
        this.textElement.style.color = 'white';
        this.textElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.textElement.style.padding = '15px';
        this.textElement.style.marginTop = '20px';
        this.textElement.style.width = '80%';
        this.textElement.style.textAlign = 'center';
        this.textElement.style.fontFamily = "'Press Start 2P', sans-serif";
        this.textElement.style.fontSize = '16px';
        this.textElement.style.borderRadius = '5px';
        this.textElement.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        this.container.appendChild(this.textElement);

        // Créer le bouton pour passer la cinématique
        this.skipButton = document.createElement('button');
        this.skipButton.textContent = 'Passer >';
        this.skipButton.style.position = 'absolute';
        this.skipButton.style.bottom = '20px';
        this.skipButton.style.right = '20px';
        this.skipButton.style.padding = '10px 20px';
        this.skipButton.style.backgroundColor = '#4CAF50';
        this.skipButton.style.color = 'white';
        this.skipButton.style.border = 'none';
        this.skipButton.style.borderRadius = '5px';
        this.skipButton.style.cursor = 'pointer';
        this.skipButton.style.fontFamily = "'Press Start 2P', sans-serif";
        this.skipButton.style.fontSize = '12px';
        this.skipButton.addEventListener('click', () => this.skipCutscene());
        this.container.appendChild(this.skipButton);

        // Ajouter le conteneur au document
        document.body.appendChild(this.container);

        // Configurer les cinématiques
        this.setupCutscenes();
    }

    /**
     * Définir les cinématiques disponibles
     */
    setupCutscenes() {
        // Définir la cinématique d'introduction (13 frames)
        this.cutscenes = {
            intro: {
                frames: 14, // Nombre de frames selon le dossier
                duration: 5000, // Durée par frame en ms
                path: './assets/cutscenes/intro/frame_',
                extension: '.webp',
                audio: './assets/sounds/cutscenes/intro.wav',
                nextAction: 'startMap1',
                // Textes pour chaque frame
                text1: "L'archéologue Rodrigo Jack chine dans une brocante comme à son habitude.",
                text2: "Lorsqu'il est foudroyé en posant son regard sur ce qui semble être un talisman.",
                text3: "Il se souvient d'en avoir vu de similair via son grand père lorsqu'il était enfant.",
                text4: "Il retourne dans le manoir familliale et fouille partout",
                text5: "Dans ses derniers écrits son aïeul, semblait se dire qu'il ne fallait pas 5, mais 6 talismans.",
                text6: "Rodrigo posa le 6ème talismans au milieu des autres et ils s'illuminèrent.",
                text7: "Un portail se forma et Rodrigo resta devant pendant un moment.",
                text8: "Prenant son courage à deux mains, il se lança dans cette aventure.",
                text9: "Il se retrouva dans un monde remplit de spectre étrange ou les murs sont parfois spectrale eux aussi",
                text10: "Pour les combatre, tu peux utiliser W, X, ou C. une petite roulade avec N et les fleche pour se diriger",
                text11: "Il est difficile de tuer ses créatures spectral",
                text12: "même si elles sont en train de mourrir, si elles vous touchent...",
                text13: "Vous perdrez de la vie, si vous ne pouvez faire autrement combattez les.",
                text14: "Sinon on vous conseille de les éviter, trouver les talisman s'il y en a pour sortir de cette galère"
            },

            // Transition map1 vers map2 (3 frames)
            map1_to_map2: {
                frames: 3,
                duration: 3000,
                path: './assets/cutscenes/map1_to_map2/frame_',
                extension: '.webp',
                audio: './assets/sounds/cutscenes/intro.wav',
                nextAction: 'startMap2',
                text1: "Après avoir récupéré les talismans, un autre vortex, peut être y aura t il un tresor ?",
                text2: "",
                text3: "Un autre monde s'offre à lui.'"
            },

            // Transition map2 vers map3 (4 frames)
            map2_to_map3: {
                frames: 3,
                duration: 3000,
                path: './assets/cutscenes/map2_to_map3/frame_',
                extension: '.webp',
                audio: './assets/sounds/cutscenes/intro.wav',
                nextAction: 'startMap3',
                text1: "Rodrigo commence a en avoir marre : pas de trèsor",
                text2: "Peut être dans le prochain ?",
                text3: "Ca a l'air plus jolie, ici ?",
                text4: ""
            },

            // Transition map3 vers map4 (3 frames)
            map3_to_map4: {
                frames: 3,
                duration: 3000,
                path: './assets/cutscenes/map3_to_map4/frame_',
                extension: '.webp',
                audio: './assets/sounds/cutscenes/intro.wav',
                nextAction: 'startMap4',
                text1: "un autre vortex... esperons...",
                text2: "un palais ?",
                text3: "PEut être que le tresor est là ?"
            },

            // Outro (4 frames)
            outro: {
                frames: 4,
                duration: 3500, // Un peu plus long pour la fin
                path: './assets/cutscenes/outro/frame_',
                extension: '.webp',
                audio: './assets/sounds/cutscenes/intro.wav',
                nextAction: 'endGame',
                text1: "Encore une fois il passa aux travers d'un portail espérant pouvoir un jour rentrer chez lui.",
                text2: "De nombreux portail en nombreux portails sont periple était sans fin",
                text3: "quoique ces portail n'était qu'un rêve éveillé, une fuite dans leqeul il consuma sa jeunesse.",
                text4: "et vieilli ne sachant pas qu'il fuillait le monde, le noyant dans ce qu'il pouvait... ouais, la flemme de faire une fin"
            }
        };
    }

    /**
     * Jouer une cinématique
     * @param {string} name - Nom de la cinématique à jouer
     */
    playCutscene(name) {
        if (!this.cutscenes[name]) {
            console.error(`Cinématique '${name}' non trouvée`);
            return;
        }

        console.log(`Démarrage de la cinématique: ${name}`);

        // S'assurer que le système audio est initialisé
        if (this.game) {
            const audioSystem = Array.from(this.game.systems).find(
                system => system.constructor.name === 'AudioSystem');

            if (audioSystem && !audioSystem.initialized) {
                console.log("Initialisation forcée du système audio");
                audioSystem.init();
            }
        }

        // Mettre le jeu en pause pendant la cinématique
        if (this.game) {
            this.game.paused = true;
        }

        this.isPlaying = true;
        this.currentCutscene = name;
        this.currentFrame = 0;
        this.frameTime = 0;

        // Afficher le conteneur
        this.container.style.display = 'flex';

        // Afficher la première frame
        this.showFrame(0);

        // Jouer la musique de la cinématique si disponible
        this.playMusic();
    }

    /**
     * Afficher une frame spécifique
     * @param {number} index - Index de la frame à afficher (0-based)
     */
    showFrame(index) {
        const cutscene = this.cutscenes[this.currentCutscene];
        if (!cutscene || index < 0 || index >= cutscene.frames) return;

        // Construire le chemin de l'image
        const imagePath = `${cutscene.path}${index}${cutscene.extension}`;

        // Mettre à jour l'image
        this.imageElement.src = imagePath;

        // Mettre à jour le texte - utiliser la propriété correspondante (text1, text2, etc.)
        // Les propriétés de texte sont indexées à partir de 1, donc on ajoute 1 à l'index
        const textProperty = `text${index + 1}`;
        this.textElement.textContent = cutscene[textProperty] || '';
    }

    /**
     * Jouer la musique de la cinématique
     */
    playMusic() {
        const cutscene = this.cutscenes[this.currentCutscene];
        if (!cutscene || !cutscene.audio) return;

        // Jouer l'audio via le système d'événements
        if (this.game && this.game.eventBus) {
            this.game.eventBus.emit('cutsceneMusic', {
                path: cutscene.audio,
                volume: 0.5
            });
        }
    }

    /**
     * Passer la cinématique en cours
     */
    skipCutscene() {
        this.endCutscene();
    }

    /**
     * Terminer la cinématique en cours
     */
    endCutscene() {
        this.isPlaying = false;
        this.container.style.display = 'none';

        // Arrêter la musique de la cinématique
        if (this.game && this.game.eventBus) {
            this.game.eventBus.emit('stopCutsceneMusic', {});
        }

        // Exécuter l'action suivante en fonction de nextAction
        const cutscene = this.cutscenes[this.currentCutscene];
        if (cutscene && cutscene.nextAction) {
            this.executeNextAction(cutscene.nextAction);
        }
    }

    /**
     * Exécuter l'action suivante après la cinématique
     * @param {string} action - Action à exécuter
     */
    executeNextAction(action) {
        switch (action) {
            case 'startMap1':
                if (this.game) {
                    this.game.mapLoader.loadMap('./assets/maps/map1.json').then(() => {
                        this.game.paused = false;
                    });
                }
                break;

            case 'startMap2':
                if (this.game) {
                    this.game.mapLoader.loadMap('./assets/maps/map2.json').then(() => {
                        this.game.paused = false;
                    });
                }
                break;

            case 'startMap3':
                if (this.game) {
                    this.game.mapLoader.loadMap('./assets/maps/map3.json').then(() => {
                        this.game.paused = false;
                    });
                }
                break;

            case 'startMap4':
                if (this.game) {
                    this.game.mapLoader.loadMap('./assets/maps/map4.json').then(() => {
                        this.game.paused = false;
                    });
                }
                break;

            case 'endGame':
                // Afficher l'écran de crédits au lieu du menu principal
                console.log("Fin du jeu, affichage des crédits!");
                this.showCredits(); // Appel de la méthode showCredits
                // Le menu principal sera affiché lorsque l'utilisateur cliquera sur "Retour au menu principal"
                break;

            default:
                console.warn(`Action non reconnue: ${action}`);
                if (this.game) {
                    this.game.paused = false;
                }
        }
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        const cutscene = this.cutscenes[this.currentCutscene];
        if (!cutscene) return;

        // Mettre à jour le temps de la frame actuelle
        this.frameTime += deltaTime * 1000; // Convertir en ms

        // Vérifier si c'est le moment de passer à la frame suivante
        if (this.frameTime >= cutscene.duration) {
            this.frameTime = 0;
            this.currentFrame++;

            // Si on a atteint la dernière frame, terminer la cinématique
            if (this.currentFrame >= cutscene.frames) {
                this.endCutscene();
                return;
            }

            // Sinon, afficher la frame suivante
            this.showFrame(this.currentFrame);
        }
    }
    showCredits() {
        // Créer l'écran de crédits
        const creditsScreen = document.createElement('div');
        creditsScreen.className = 'credits-screen';
        creditsScreen.style.position = 'fixed';
        creditsScreen.style.top = '0';
        creditsScreen.style.left = '0';
        creditsScreen.style.width = '100%';
        creditsScreen.style.height = '100%';
        creditsScreen.style.backgroundColor = 'black';
        creditsScreen.style.color = 'white';
        creditsScreen.style.display = 'flex';
        creditsScreen.style.flexDirection = 'column';
        creditsScreen.style.justifyContent = 'center';
        creditsScreen.style.alignItems = 'center';
        creditsScreen.style.zIndex = '3000';
        creditsScreen.style.fontFamily = 'Press Start 2P, sans-serif';
        creditsScreen.style.textAlign = 'center';
        creditsScreen.style.transition = 'opacity 2s';
        creditsScreen.style.fontFamily = "'Press Start 2P', monospace, sans-serif";

        // Titre
        const title = document.createElement('h1');
        title.textContent = 'Rodrigo Jack et les 5 (non, 6) talismans';
        title.style.fontSize = '36px';
        title.style.margin = '20px 0';
        // Ajout de !important pour forcer l'application de la police
        title.style.fontFamily = "'Press Start 2P', monospace, sans-serif !important";
        creditsScreen.appendChild(title);

        // Contenu des crédits
        const creditsContent = document.createElement('div');
        creditsContent.className = 'credits-content';
        creditsContent.style.fontSize = '18px';
        creditsContent.style.lineHeight = '1.6';
        creditsContent.style.overflow = 'hidden';
        creditsContent.style.width = '80%';
        creditsContent.style.maxWidth = '800px';
        creditsContent.style.animation = 'scroll-credits 30s linear forwards';
        creditsContent.style.fontFamily = 'Press Start 2P, sans-serif';

        // Ajouter le style de l'animation
        const style = document.createElement('style');
        style.textContent = `
        @keyframes scroll-credits {
            0% { transform: translateY(100vh); }
            100% { transform: translateY(-100vh); }
        }
    `;
        document.head.appendChild(style);

        // Ajouter le contenu des crédits
        creditsContent.innerHTML = `
        <h2 style="font-family: 'Press Start 2P', sans-serif;">Développement</h2>
        <p style="font-family: 'Press Start 2P', sans-serif;">Développeur principal</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">Programmeur de gameplay</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">Développeur d'IA</p>

        <h2 style="font-family: 'Press Start 2P', sans-serif;">Art et conception</h2>
        <p style="font-family: 'Press Start 2P', sans-serif;">Directeur artistique</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">Artiste de personnages</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">Artiste d'environnement</p>

        <h2 style="font-family: 'Press Start 2P', sans-serif;">Conception sonore</h2>
        <p style="font-family: 'Press Start 2P', sans-serif;">Compositeur de musique</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">Concepteur sonore</p>

        <h2 style="font-family: 'Press Start 2P', sans-serif;">Remerciements spéciaux</h2>
        <p style="font-family: 'Press Start 2P', sans-serif;">À tous ceux qui ont soutenu ce projet</p>
        <p style="font-family: 'Press Start 2P', sans-serif;">À tous les joueurs</p>

        <h2 style="font-family: 'Press Start 2P', sans-serif;">Merci d'avoir joué!</h2>
    `;

        creditsScreen.appendChild(creditsContent);

        // Bouton pour retourner au menu principal
        const backButton = document.createElement('button');
        backButton.textContent = 'Retour au menu principal';
        backButton.style.position = 'absolute';
        backButton.style.bottom = '20px';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#4CAF50';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.style.fontSize = '16px';
        backButton.style.fontFamily = 'Press Start 2P, sans-serif'; // Appliquer la police
        backButton.onclick = () => {
            document.body.removeChild(creditsScreen);
            this.game.restart();
            this.game.paused = true;
            this.game.mainMenu.style.display = 'flex';
        };

        creditsScreen.appendChild(backButton);
        document.body.appendChild(creditsScreen);
    }


    // Méthode appelée lors de la suppression du système
    cleanup() {
        if (this.cutsceneContainer && this.cutsceneContainer.parentNode) {
            this.cutsceneContainer.parentNode.removeChild(this.cutsceneContainer);
        }
    }
}