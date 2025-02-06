import { System } from './system.js';

export class Render extends System {
  constructor() {
    super();
    this.container = document.querySelector('.container');
  }

  update() {
    this.entities.forEach((entity) => {
      // get all components
      const position = entity.getComponent('position');
      const visual = entity.getComponent('visual');
      const velocity = entity.getComponent('velocity');
      const feature = entity.getComponent('feature');
      if (!entity.div) {
        // create the div
        entity.div = document.createElement('div');
        entity.div.setAttribute('uuid', entity.uuid);
        // position style
        entity.div.style.position = 'absolute';
        entity.div.style.left = `${position.x}px`;
        entity.div.style.bottom = `${position.y}px`;
        // visual style
        entity.div.style.width = `${visual.width}px`;
        entity.div.style.height = `${visual.height}px`;
        entity.div.style.backgroundColor = visual.bgColor;
        // add entity div into container
        this.container.appendChild(entity.div);
      } else if (feature.movable) {
        position.x += velocity.vx;
        position.y += velocity.vy;

        entity.div.style.left = `${position.x}px`;
        entity.div.style.bottom = `${position.y}px`;
      }
    });
  }
}
