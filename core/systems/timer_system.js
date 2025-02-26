import { System } from './system.js';

export class Timer extends System {
  constructor() {
    super();
    this.div = document.createElement('div');
    this.time = 0;
    this.init();
  }

  init() {
    this.div.style.display = 'flex';
    this.div.style.alignItems = 'center';
    this.div.style.justifyContent = 'center';
    this.div.style.width = '150px';
    this.div.style.height = '50px';
    this.div.style.position = 'fixed';
    this.div.style.left = '120px';
    this.div.style.top = ' 20px';
    this.div.style.backgroundColor = 'white';
    this.div.style.borderRadius = '2em';
    this.div.style.zIndex = '1000';
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.div.innerText = `Elapsed time: ${Math.floor(this.time)}s`;
    if (!document.body.contains(this.div)) this.game.container.appendChild(this.div);
  }
}
