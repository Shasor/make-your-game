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
      visual.div.setAttribute('uuid', entity.uuid);
      // position style
      visual.div.style.position = 'absolute';
      visual.div.style.left = `${position.x}px`;
      visual.div.style.top = `${position.y}px`;
      // visual style
      visual.div.style.width = `${visual.width}px`;
      visual.div.style.height = `${visual.height}px`;
      visual.div.style.backgroundColor = visual.bgColor;
      // add entity div into container
      this.container.appendChild(visual.div);
    });
  }
}
