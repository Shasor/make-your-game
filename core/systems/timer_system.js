// core/systems/timer_system.js
import { System } from './system.js';

export class TimerSystem extends System {
    constructor() {
        super();
        this.timerDisplay = this.createTimerDisplay();
    }

    createTimerDisplay() {
        const display = document.createElement('div');
        display.style.position = 'fixed';
        display.style.top = '20px';
        display.style.left = '50%';
        display.style.transform = 'translateX(-50%)';
        display.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        display.style.color = '#FFF';
        display.style.padding = '10px 20px';
        display.style.borderRadius = '10px';
        display.style.fontSize = '24px';
        display.style.fontFamily = "'Press Start 2P', sans-serif";
        display.style.zIndex = '1000';
        document.body.appendChild(display);
        return display;
    }

    update(deltaTime) {
        // Trouver le joueur et son timer
        const player = Array.from(this.entities).find(entity => entity.getComponent('input'));
        if (!player) return;

        const timer = player.getComponent('timer');
        if (!timer) return;

        // Ne pas mettre à jour le timer si le jeu est en pause ou si le timer est inactif
        if (this.game.paused || !timer.isActive) return;

        // Mettre à jour le temps restant
        timer.currentTime = Math.max(0, timer.currentTime - deltaTime);

        // Formater le temps pour l'affichage (MM:SS)
        const minutes = Math.floor(timer.currentTime / 60);
        const seconds = Math.floor(timer.currentTime % 60);
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Changer la couleur en fonction du temps restant
        let color = '#FFF';
        if (timer.currentTime <= 60) { // Dernier minute
            color = '#FF0000';
            // Faire clignoter dans les 30 dernières secondes
            if (timer.currentTime <= 30) {
                const blink = Math.floor(timer.currentTime * 2) % 2 === 0;
                color = blink ? '#FF0000' : '#FF8C00';
            }
        } else if (timer.currentTime <= 120) { // 2 dernières minutes
            color = '#FF8C00';
        }

        // Mettre à jour l'affichage
        this.timerDisplay.textContent = `Temps: ${timeText}`;
        this.timerDisplay.style.color = color;

        // Vérifier si le temps est écoulé
        if (timer.currentTime <= 0) {
            this.handleTimeOver(player);
        }
    }

    handleTimeOver(player) {
        // Jouer un son d'alerte si disponible
        const audio = player.getComponent('audio');
        if (audio && audio.sounds.has('time_over')) {
            audio.playSound('time_over');
        }

        // Tuer le joueur
        const health = player.getComponent('health');
        if (health) {
            health.currentLives = 0;

            // Utiliser le système de gestion de mort du joueur
            if (this.game.handlePlayerDeath) {
                setTimeout(() => {
                    this.game.handlePlayerDeath();
                }, 1000);
            }
        }
    }
}