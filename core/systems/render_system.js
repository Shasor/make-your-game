import { System } from './system.js';

export class Render extends System {
  constructor() {
    super();
    this.container = document.querySelector('.container');
  }

  update() {
    this.entities.forEach((entity) => {
      if (entity.div) return;
      // get all components
      const position = entity.getComponent('position');
      const visual = entity.getComponent('visual');
      // create the div
      entity.div = document.createElement('div');
      entity.div.setAttribute('uuid', entity.uuid);
      // position style
      entity.div.style.position = 'absolute';
      entity.div.style.left = `${position.x}px`;
      entity.div.style.top = `${position.y}px`;
      // visual style
      entity.div.style.width = `${visual.width}px`;
      entity.div.style.height = `${visual.height}px`;
      entity.div.style.backgroundColor = visual.bgColor;
      // add entity div into container
      this.container.appendChild(entity.div);
    });
  }
}
