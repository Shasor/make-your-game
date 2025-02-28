// core/components/timer_component.js
import { Component } from './component.js';

export class Timer extends Component {
    constructor(duration = 300) {  // 300 secondes = 5 minutes
        super();
        this.maxDuration = duration;
        this.currentTime = duration;
        this.isActive = true;
    }

    reset() {
        this.currentTime = this.maxDuration;
    }

    pause() {
        this.isActive = false;
    }

    resume() {
        this.isActive = true;
    }
}