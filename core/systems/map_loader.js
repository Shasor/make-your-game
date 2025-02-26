// core/map_loader.js
import { createTile } from '../create/tile_create.js';
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
        // Charger d'abord les tiles normales
        if (mapData.tiles) {
            mapData.tiles.forEach(tile => {
                const tileEntity = createTile(
                    tile.x,        // X est maintenant un index direct
                    tile.y,        // Y est maintenant un index direct
                    Math.floor(tile.tx / TILE_CONSTANTS.BASE_SIZE),  // Conversion des coordonnées tileset
                    Math.floor(tile.ty / TILE_CONSTANTS.BASE_SIZE),
                    { solid: true }  // Par défaut les tiles sont solides
                );

                this.game.addEntity(tileEntity);
            });
        }

        // Ajouter d'autres types d'entités si nécessaire
        // Par exemple, les points de spawn, ennemis, etc.
        if (mapData.spawnpoint) {
            // Traitement des points de spawn
        }

        if (mapData.enemy1) {
            // Traitement des ennemis de type 1
        }

        // etc...
    }
}



