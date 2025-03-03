// core/components/score_component.js
import { Component } from './component.js';

export class Score extends Component {
    constructor() {
        super();
        this.baseScore = 0;        // Score de base (collectibles)
        this.timeBonus = 0;        // Bonus de temps
        this.enemyBonus = 0;       // Bonus d'ennemis tués
        this.totalScore = 0;       // Score total calculé
        this.playerName = "";      // Nom du joueur
        this.isSubmitted = false;  // Si le score a été soumis au serveur
    }

    calculateTotal() {
        this.totalScore = this.baseScore + this.timeBonus + this.enemyBonus;
        return this.totalScore;
    }
}