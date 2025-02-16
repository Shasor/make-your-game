import { System } from './system.js';

export class Debug extends System {
  constructor() {
    super();
    this.lastTime = 0;
    this.frequency = 30;
  }

  update(deltaTime) {
    this.lastTime += deltaTime;
    if (this.lastTime >= this.frequency / 60) {
      this.lastTime = 0;
      this.entities.forEach((entity) => {
        // do what you want here
        if (entity.components.has('input')) {
          //   console.log('test');
        }
      });
    }
  }
}
