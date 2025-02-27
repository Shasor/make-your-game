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
        display.style.top = '30px'; // Position plus basse pour éviter la superposition
        display.style.right = '950px';
        display.style.backgroundColor = 'rgba(34, 34, 34, 0.8)'; // Fond plus foncé pour meilleure lisibilité
        display.style.color = '#FF5555';
        display.style.padding = '10px 15px';
        display.style.borderRadius = '10px';
        display.style.fontSize = '18px';
        display.style.fontFamily = "'Press Start 2P', sans-serif";
        display.style.zIndex = '1000';
        display.style.minWidth = '250px'; // Largeur minimale fixe
        display.style.textAlign = 'right'; // Alignement à droite
        document.body.appendChild(display);
        return display;
    }

    updateDisplay(count) {
        this.countDisplay.textContent = `Ennemis vaincus: ${count}`;
    }
}