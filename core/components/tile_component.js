// core/components/tile_component.js
import { Component } from './component.js';

export class Tile extends Component {
    constructor() {
        super();
        this.tilesetImage = null;
        this.tileSize = 32;          // Taille fixe dans le tileset
        this.tileX = 0;
        this.tileY = 0;
        this.initialized = false;
    }

    init(tilesetPath) {
        this.tilesetImage = new Image();
        this.tilesetImage.onload = () => {
            this.initialized = true;
        };
        this.tilesetImage.src = tilesetPath;
    }

    setTilePosition(tx, ty) {
        // tx et ty sont déjà en indices (à multiplier par la taille de la tile)
        this.tileX = tx;
        this.tileY = ty;
    }

    updateVisual(visualComponent) {
        if (!visualComponent || !visualComponent.div || !this.initialized) return;

        const style = visualComponent.div.style;

        // On calcule le ratio d'échelle basé sur la taille visuelle voulue
        const scale = visualComponent.width / this.tileSize;

        style.backgroundImage = `url(${this.tilesetImage.src})`;
        style.backgroundPosition = `-${this.tileX * this.tileSize * scale}px -${this.tileY * this.tileSize * scale}px`;
        style.backgroundSize = `${this.tilesetImage.width * scale}px ${this.tilesetImage.height * scale}px`;
        style.backgroundRepeat = 'no-repeat';
        style.imageRendering = 'pixelated';
    }
}