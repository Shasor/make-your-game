// core/map_loader.js
import { createTile } from '../create/tile_create.js';
import { createPlayer } from '../create/player_create.js';
import { createEnemy } from '../create/enemy_create.js';
import { createCollectable } from '../create/collectable_create.js';
import { TILE_CONSTANTS } from '../constants/tile_constants.js';

export class MapLoader {
    constructor(game) {
        this.game = game;
    }

    async loadMap(mapPath) {
        try {
            // Nettoyer d'abord le niveau existant
            this.game.cleanupLevel();

            const response = await fetch(mapPath);
            const mapData = await response.json();

            // Créer les éléments de la map
            this.createMapFromData(mapData);

            // Vérifier si c'est le premier chargement (map1) au démarrage du jeu
            const isInitialLoad = mapPath.includes('map1.json') && this.game.firstMapLoad === undefined;

            // Marquer que le premier chargement a été effectué
            if (isInitialLoad) {
                this.game.firstMapLoad = true;
            }

            // Déclencher la musique uniquement si ce n'est pas le chargement initial
            if (!isInitialLoad && mapData.music && mapData.music.path) {
                console.log(`Chargement de la musique: ${mapData.music.path}`);
                this.game.eventBus.emit('mapMusicChange', {
                    path: mapData.music.path,
                    volume: mapData.music.volume || 0.5,
                    fadeIn: mapData.music.fadeIn || 1000,
                    fadeOut: mapData.music.fadeOut || 1000,
                    mapNumber: this.extractMapNumber(mapPath) // Ajout du numéro de map pour le système audio
                });
            }

            // Réinitialiser l'audio après le chargement de la map
            // même si on ne charge pas de musique
            const audioSystem = Array.from(this.game.systems).find(
                system => system.constructor.name === 'AudioSystem');

            if (audioSystem) {
                const mapNumber = this.extractMapNumber(mapPath);
                console.log(`Réinitialisation audio pour map ${mapNumber}`);
                audioSystem.reinitializeAudio(mapNumber);
            }

            return true;
        } catch (error) {
            console.error('Error loading map:', error);
            return false;
        }
    }

    // Nouvelle méthode utilitaire pour extraire le numéro de map du chemin
    extractMapNumber(mapPath) {
        const mapNumberMatch = mapPath.match(/map(\d+)/);
        return mapNumberMatch ? parseInt(mapNumberMatch[1]) : 1;
    }

    // Convertit les indices de grille en pixels
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * TILE_CONSTANTS.SCALED_SIZE,
            y: gridY * TILE_CONSTANTS.SCALED_SIZE
        };
    }

    createMapFromData(mapData) {
        // Calcul des dimensions en pixels
        const mapWidth = mapData.metadata.width * TILE_CONSTANTS.SCALED_SIZE;
        const mapHeight = mapData.metadata.height * TILE_CONSTANTS.SCALED_SIZE;

        // Définir les limites pour le système de limite
        const boundarySystem = Array.from(this.game.systems).find(
            system => system.constructor.name === 'BoundarySystem'
        );

        if (boundarySystem) {
            boundarySystem.setMapBoundaries(mapWidth, mapHeight);
        }
        // Charger le background si spécifié
        if (mapData.background && mapData.background.path) {
            const gameWorld = document.querySelector('.game-world');
            if (gameWorld) {
                const mapWidth = mapData.metadata.width * TILE_CONSTANTS.SCALED_SIZE;
                const mapHeight = mapData.metadata.height * TILE_CONSTANTS.SCALED_SIZE;

                gameWorld.style.backgroundImage = `url(assets/${mapData.background.path})`;
                gameWorld.style.backgroundSize = `${mapWidth}px ${mapHeight}px`;
                gameWorld.style.backgroundPosition = '0 0';
                gameWorld.style.backgroundRepeat = 'no-repeat';
                gameWorld.style.width = `${mapWidth}px`;
                gameWorld.style.height = `${mapHeight}px`;
            }
        }
        // Charger les tiles
        if (mapData.tiles) {
            mapData.tiles.forEach(tile => {
                const tileEntity = createTile(
                    tile.x,
                    tile.y,
                    Math.floor(tile.tx / TILE_CONSTANTS.BASE_SIZE),
                    Math.floor(tile.ty / TILE_CONSTANTS.BASE_SIZE),
                    { solid: true }
                );
                this.game.addEntity(tileEntity);
            });
        }

        // Créer le joueur au spawn point (maintenant en indices)
        if (mapData.spawnpoint && mapData.spawnpoint.length > 0) {
            const spawn = mapData.spawnpoint[0];
            const pixelPos = this.gridToPixel(spawn.x, spawn.y);
            const player = createPlayer(pixelPos.x, pixelPos.y);
            this.game.addEntity(player);
        }

        // Charger les différents types d'ennemis (maintenant en indices)
        ['enemy1', 'enemy2', 'enemy3'].forEach(enemyType => {
            if (mapData[enemyType]) {
                mapData[enemyType].forEach(enemyData => {
                    const pixelPos = this.gridToPixel(enemyData.x, enemyData.y);
                    const enemy = createEnemy(pixelPos.x, pixelPos.y);
                    this.game.addEntity(enemy);
                });
            }
        });

        // Charger les collectibles (déjà en indices)
        if (mapData.collectible) {
            mapData.collectible.forEach(collectible => {
                const pixelPos = this.gridToPixel(collectible.x, collectible.y);
                const collectibleEntity = createCollectable(
                    pixelPos.x,
                    pixelPos.y,
                    collectible.type || 'coin',
                    collectible.valeur || 1
                );
                this.game.addEntity(collectibleEntity);
            });
        }
        // Charger la musique de la map si elle existe
        if (mapData.music && mapData.music.path) {
            console.log(`Chargement du thème de la map: ${mapData.music.path}`);
            this.game.eventBus.emit('mapMusicChange', {
                path: mapData.music.path,
                volume: mapData.music.volume || 0.5,
                fadeIn: mapData.music.fadeIn || 1000,
                fadeOut: mapData.music.fadeOut || 1000
            });
        }
    }
}
