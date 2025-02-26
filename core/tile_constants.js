// constants/tile_constants.js
export const TILE_CONSTANTS = {
    BASE_SIZE: 32,      // Taille de base des tuiles dans le tileset
    GRID_SIZE: 16,     // Taille de la grille dans l'éditeur (metadata.tileSize)
    SCALE: 4,          // Facteur d'échelle

    get SCALED_SIZE() {
        return this.GRID_SIZE * this.SCALE;  // Taille finale d'une case dans le jeu
    },

    // Convertit la position de grille en position monde
    getWorldPosition(gridX, gridY) {
        return {
            x: gridX * this.SCALED_SIZE,
            y: gridY * this.SCALED_SIZE
        };
    }
};