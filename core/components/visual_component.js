//core/components/visual_component.js
import { Component } from './component.js';

export class Visual extends Component {
  constructor(bgColor = 'purple', height = 50, width = 50) {
    super();
    this.div = document.createElement('div');
    this.bgColor = bgColor;
    this.height = height;
    this.width = width;
  }
}
