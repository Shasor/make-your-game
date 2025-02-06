import { Component } from './component.js';

export class Feature extends Component {
  constructor(movable = false, speed = 5) {
    super();
    this.movable = movable;
    this.speed = speed;
  }
}
