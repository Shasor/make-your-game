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
            return this.createMapFromData(mapData);
        } catch (error) {
            console.error('Error loading map:', error);
        }
    }

    // Convertit les indices de grille en pixels
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * TILE_CONSTANTS.SCALED_SIZE,
            y: gridY * TILE_CONSTANTS.SCALED_SIZE
        };
    }

    createMapFromData(mapData) {
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
    }
}
