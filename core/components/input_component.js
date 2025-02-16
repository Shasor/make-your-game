//core/components/input_component.js
import { Component } from './component.js';

export class Input extends Component {
    constructor() {
        super();
        this.keys = new Set();
        this.vector = { h: 0, v: 0 };
        this.jump = 0;
        this.jumpPressed = false;
        this.isRolling = false;
        this.rollDirection = 0;
        this.rollStartTime = 0;
        this.rollDuration = 400; // durée de la roulade en ms

        document.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
            if (this.keys.has('ArrowUp') && this.jump < 2 && !this.jumpPressed) {
                this.jump++;
                this.jumpPressed = true;
                this.vector.v = 1;
            }

            // Initier la roulade
            if (e.key === 'n' && !this.isRolling) {
                this.startRoll();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
            if (e.key === 'ArrowUp') {
                this.jumpPressed = false;
            }
        });
    }

    startRoll() {
        this.isRolling = true;
        this.rollStartTime = Date.now();
        // Utiliser la direction actuelle ou la dernière direction
        this.rollDirection = this.vector.h || this.lastNonZeroDirection || 1;
        this.lastNonZeroDirection = this.rollDirection;
    }

    update() {
        // Mettre à jour le vecteur de direction uniquement si on ne roule pas
        if (!this.isRolling) {
            this.vector.h = 0;
            if (this.keys.has('ArrowLeft')) {
                this.vector.h = -1;
                this.lastNonZeroDirection = -1;
            }
            if (this.keys.has('ArrowRight')) {
                this.vector.h = 1;
                this.lastNonZeroDirection = 1;
            }
        } else {
            // Pendant la roulade, forcer la direction
            this.vector.h = this.rollDirection;

            // Vérifier si la roulade est terminée
            if (Date.now() - this.rollStartTime >= this.rollDuration) {
                this.isRolling = false;
            }
        }

        // Actions spéciales
        this.attack1 = this.keys.has('w');
        this.attack2 = this.keys.has('x');
        this.attack3 = this.keys.has('c');
        this.magicAttack = this.keys.has('v');
        this.arrowShoot = this.keys.has(' ');
        this.roll = this.isRolling;
    }
}