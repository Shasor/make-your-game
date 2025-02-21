// core/components/camera_component.js
import { Component } from './component.js';

export class Camera extends Component {
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
        super();
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.x = 0;
        this.y = 0;
    }

    // Calculate camera position based on target position
    follow(targetX, targetY, targetWidth, targetHeight) {
        // Center the camera on the target
        this.x = targetX + (targetWidth / 2) - (this.viewportWidth / 2);
        this.y = targetY + (targetHeight / 2) - (this.viewportHeight / 2);

        // Clamp camera position to world bounds
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.viewportWidth));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.viewportHeight));
    }
}
