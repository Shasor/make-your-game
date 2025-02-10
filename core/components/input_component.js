//core/components/input_component.js
import { Component } from './component.js';

export class Input extends Component {
  constructor() {
    super();
    this.keys = new Set();
    this.vector = { h: 0, v: 0 };
    this.jump = 0;
    this.jumpPressed = false;

    document.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (this.keys.has('ArrowUp') && this.jump < 2 && !this.jumpPressed) {
        this.jump++;
        this.jumpPressed = true;
        this.vector.v = 1;
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
      this.jumpPressed = false;
    });
  }

  update() {
    this.vector.h = 0;
    if (this.keys.has('ArrowLeft')) this.vector.h = -1;
    if (this.keys.has('ArrowRight')) this.vector.h = 1;
  }
}
