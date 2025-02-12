// core/components/visual_component.js
import { Component } from './component.js';

export class Visual extends Component {
  constructor(color, height, width) {
    super();
    this.div = document.createElement('div');
    this.height = height;
    this.width = width;
    this.bgColor = color;
  }

  updateSprite(frameX, frameY, isFlipped, spritePath, frameWidth, frameHeight, columns, rows) {
    // Initialisation du sprite une seule fois
    if (!this.div.style.backgroundImage) {
      this.div.style.backgroundImage = `url(${spritePath})`;
      this.div.style.imageRendering = 'pixelated';
      this.div.style.backgroundRepeat = 'no-repeat';

      // Calcul de l'échelle basé sur les dimensions souhaitées
      const scaleX = this.width / frameWidth;
      const scaleY = this.height / frameHeight;

      // Utilisation des colonnes et lignes spécifiques au sprite
      const totalWidth = frameWidth * columns * scaleX;
      const totalHeight = frameHeight * rows * scaleY;

      this.div.style.backgroundSize = `${totalWidth}px ${totalHeight}px`;
      this.div.style.overflow = 'hidden';
    }

    // Mise à jour de la position du sprite
    const x = -(frameX * this.width);
    const y = -(frameY * this.height);

    this.div.style.backgroundPosition = `${x}px ${y}px`;
    this.div.style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
  }
}
