// core/systems/camera_system.js
import { System } from './system.js';

export class Camera extends System {
  constructor() {
    super();
    this.container = document.querySelector('.container');
    this.gameWorld = document.createElement('div');
    this.gameWorld.className = 'game-world';
    this.container.appendChild(this.gameWorld);

    // Style the container as viewport
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'relative';

    // Style the game world
    this.gameWorld.style.position = 'absolute';
    this.gameWorld.style.left = '0';
    this.gameWorld.style.top = '0';
    this.gameWorld.style.willChange = 'transform'; // Optimisation des performances
  }

  // Méthode pour charger les métadonnées de la carte
  loadMapMetadata(metadata) {
    if (metadata) {
      this.mapWidth = metadata.width * (metadata.tileSize || this.tileSize);
      this.mapHeight = metadata.height * (metadata.tileSize || this.tileSize);
      this.tileSize = metadata.tileSize || this.tileSize;
    }
  }
  update() {
    const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
    if (!player) return;

    const camera = player.getComponent('camera');
    const position = player.getComponent('position');
    const visual = player.getComponent('visual');
    if (!camera || !position || !visual) return;

    // Récupérer les dimensions du viewport
    const viewportWidth = this.container.clientWidth;
    const viewportHeight = this.container.clientHeight;

    // Suivre le joueur mais respecter les limites de la carte
    camera.follow(position.x, position.y, visual.width, visual.height);

    // Appliquer les limites de la carte
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      // Limiter la caméra à gauche et en haut
      camera.x = Math.max(camera.x, viewportWidth / 2);
      camera.y = Math.max(camera.y, viewportHeight / 2);

      // Limiter la caméra à droite et en bas
      camera.x = Math.min(camera.x, this.mapWidth - viewportWidth / 2);
      camera.y = Math.min(camera.y, this.mapHeight - viewportHeight / 2);
    }

    // Mettre à jour la position du monde avec un nombre entier de pixels
    const transformX = Math.round(-camera.x + viewportWidth / 2);
    const transformY = Math.round(-camera.y + viewportHeight / 2);

    // Appliquer la transformation avec translate3d pour la performance
    this.gameWorld.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

    // Mettre à jour la position des hitboxes debug si elles existent
    document.querySelectorAll('.debug-circle').forEach((circle) => {
      // Appliquer la même transformation à chaque cercle de debug
      circle.style.transform = `translate3d(${-transformX}px, ${-transformY}px, 0)`;
    });
  }
}
