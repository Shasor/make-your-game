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
            const response = await fetch(mapPath);
            const mapData = await response.json();
            return this.createMapFromData(mapData);
        } catch (error) {
            console.error('Error loading map:', error);
        }
    }

    createMapFromData(mapData) {
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

        // Créer le joueur au spawn point
        if (mapData.spawnpoint && mapData.spawnpoint.length > 0) {
            const spawn = mapData.spawnpoint[0];
            const player = createPlayer(spawn.x, spawn.y);
            this.game.addEntity(player);
        }

        // Charger les ennemis de type 1
        if (mapData.enemy1) {
            mapData.enemy1.forEach(enemyData => {
                const enemy = createEnemy(enemyData.x, enemyData.y);
                this.game.addEntity(enemy);
            });
        }

        // Charger les collectibles
        if (mapData.collectible) {
            mapData.collectible.forEach(collectible => {
                // Convertir les coordonnées de la grille en pixels
                const x = collectible.x * TILE_CONSTANTS.SCALED_SIZE;
                const y = collectible.y * TILE_CONSTANTS.SCALED_SIZE;

                const collectibleEntity = createCollectable(
                    x,          // position X en pixels
                    y,          // position Y en pixels
                    'coin',     // type
                    1           // valeur
                );
                this.game.addEntity(collectibleEntity);
            });
        }
    }
}
