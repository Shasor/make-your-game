//core/components/input_component.js
import { Component } from './component.js';

export class Input extends Component {
    constructor() {
        super();
        this.keys = new Set();
        this.vector = { h: 0, v: 0 };

        document.addEventListener('keydown', (e) => this.keys.add(e.key));
        document.addEventListener('keyup', (e) => this.keys.delete(e.key));
    }

    update() {
        this.vector.h = 0;
        this.vector.v = 0;
        if (this.keys.has('ArrowLeft')) this.vector.h = -1;
        if (this.keys.has('ArrowRight')) this.vector.h = 1;
        if (this.keys.has('ArrowUp')) this.vector.v = 1;
        if (this.keys.has('ArrowDown')) this.vector.v = -1;
    }
}
