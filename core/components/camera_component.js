// core/components/camera_component.js
import { Component } from './component.js';

export class Camera extends Component {
    constructor() {
        super('camera');
        this.x = 0;
        this.y = 0;
        this.smoothing = 0.1; // Facteur de lissage pour un suivi plus fluide
    }

    // Méthode pour suivre une cible
    follow(targetX, targetY, targetWidth, targetHeight) {
        // Calcul de la position cible au centre de l'entité
        const targetCenterX = targetX + targetWidth / 2;
        const targetCenterY = targetY + targetHeight / 2;

        // Suivi avec lissage pour un mouvement plus fluide
        this.x += (targetCenterX - this.x) * this.smoothing;
        this.y += (targetCenterY - this.y) * this.smoothing;
    }
}
