// core/components/kill_counter_component.js
import { Component } from './component.js';

export class KillCounter extends Component {
    constructor() {
        super();
        this.countDisplay = this.createKillCountDisplay();
    }

    createKillCountDisplay() {
        const display = document.createElement('div');
        display.style.position = 'fixed';
        display.style.top = '35px'; // Sous le compteur de temps
        display.style.right = '40px';
        display.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        display.style.color = '#FF5555'; // Rouge pour représenter les ennemis tués
        display.style.padding = '10px 15px';
        display.style.borderRadius = '10px';
        display.style.fontSize = '18px';
        display.style.fontFamily = "'Press Start 2P', sans-serif";
        display.style.zIndex = '1000';
        document.body.appendChild(display);
        return display;
    }

    updateDisplay(count) {
        this.countDisplay.textContent = `Ennemis vaincus: ${count}`;
    }
}