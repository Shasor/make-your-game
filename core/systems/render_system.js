import { System } from './system.js';

export class Render extends System {
  constructor(container) {
    super();
    this.container = container;
  }

  update() {
    this.entities.forEach((entity) => {
      if (document.querySelector(`[uuid="${entity.uuid}"]`)) return;
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
      if (!visual.bgColor && !entity.components.has('animation')) {
        visual.div.style.backgroundImage = `url(${visual.bg})`;
        visual.div.style.backgroundSize = '1600%';
        visual.div.style.imageRendering = 'pixelated';
        visual.div.style.backgroundPosition = `-${visual.tx * 2}px -${visual.ty * 2}px`;
      } else visual.div.style.backgroundColor = visual.bgColor;
      // add entity div into container
      this.container.appendChild(visual.div);
    });
  }
}
