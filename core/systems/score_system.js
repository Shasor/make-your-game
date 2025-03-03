// core/systems/score_system.js
import { System } from './system.js';

export class ScoreSystem extends System {
    constructor() {
        super();
        this.apiBaseUrl = 'http://localhost:8080/api/scores'; // URL du serveur Go
        this.scoresPerPage = 10;
        this.currentPage = 1;
        this.totalPages = 1;
        this.scoreData = [];
        this.onCloseCallback = null;
    }

    showFinalScoreAndRanking(finalScore, onCloseCallback) {
        this.finalScore = finalScore;
        this.onCloseCallback = onCloseCallback;

        // Afficher l'écran de saisie du nom
        this.showNameEntryScreen();
    }

    // Afficher l'écran de saisie du nom
    showNameEntryScreen() {
        // Pause du jeu pendant la saisie
        this.game.paused = true;

        // Créer le conteneur
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.zIndex = '3000';
        container.style.padding = '20px';

        // Titre et score
        const title = document.createElement('h2');
        title.textContent = 'Félicitations !';
        title.style.color = '#FFD700';
        title.style.fontSize = '32px';
        title.style.fontFamily = "'Press Start 2P', sans-serif";
        title.style.marginBottom = '20px';
        title.style.textAlign = 'center';

        const scoreDisplay = document.createElement('div');
        scoreDisplay.textContent = `Votre score final: ${this.finalScore}`;
        scoreDisplay.style.color = 'white';
        scoreDisplay.style.fontSize = '24px';
        scoreDisplay.style.fontFamily = "'Press Start 2P', sans-serif";
        scoreDisplay.style.marginBottom = '40px';
        scoreDisplay.style.textAlign = 'center';

        // Formulaire de saisie du nom
        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.alignItems = 'center';
        form.style.gap = '20px';
        form.style.width = '100%';
        form.style.maxWidth = '500px';

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Entrez votre nom pour le classement:';
        nameLabel.style.color = 'white';
        nameLabel.style.fontSize = '18px';
        nameLabel.style.fontFamily = "'Press Start 2P', sans-serif";
        nameLabel.style.textAlign = 'center';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.style.padding = '10px 15px';
        nameInput.style.fontSize = '18px';
        nameInput.style.width = '100%';
        nameInput.style.maxWidth = '300px';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = 'none';
        nameInput.style.textAlign = 'center';
        nameInput.style.fontFamily = "'Press Start 2P', sans-serif";

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Voir le classement';
        submitButton.style.padding = '12px 20px';
        submitButton.style.fontSize = '18px';
        submitButton.style.backgroundColor = '#4CAF50';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.fontFamily = "'Press Start 2P', sans-serif";

        submitButton.onclick = () => {
            const playerName = nameInput.value.trim();
            if (playerName) {
                // Soumettre le score et afficher le classement
                this.submitScoreAndShowRanking(playerName, this.finalScore);

                // Supprimer le conteneur
                document.body.removeChild(container);
            } else {
                alert("Veuillez entrer votre nom!");
            }
        };

        // Assembler le formulaire
        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        form.appendChild(submitButton);

        // Assembler le conteneur
        container.appendChild(title);
        container.appendChild(scoreDisplay);
        container.appendChild(form);

        document.body.appendChild(container);

        // Focus sur l'input
        nameInput.focus();
    }

    // Soumettre le score et afficher le classement
    async submitScoreAndShowRanking(playerName, score) {
        try {
            // Préparer les données
            const scoreData = {
                name: playerName,
                score: score,
                time: new Date().toISOString()
            };

            // Soumettre au serveur
            console.log("Soumission du score:", scoreData);

            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });

            if (!response.ok) {
                console.error("Erreur lors de la soumission du score:", await response.text());
            }

            // Récupérer le classement et l'afficher (même en cas d'erreur)
            this.fetchScoresAndShowRanking(playerName);

        } catch (error) {
            console.error("Erreur réseau:", error);

            // En cas d'erreur réseau, afficher quand même le classement local
            this.showRankingScreen(playerName, []);
        }
    }

    // Récupérer les scores et afficher le classement
    async fetchScoresAndShowRanking(playerName) {
        try {
            // Récupérer les scores du serveur
            const response = await fetch(`${this.apiBaseUrl}?page=1&limit=${this.scoresPerPage}`);

            if (response.ok) {
                const data = await response.json();
                this.scoreData = data.scores || [];
                this.totalPages = data.totalPages || 1;
                this.currentPage = 1;

                // Afficher le classement
                this.showRankingScreen(playerName, this.scoreData);
            } else {
                console.error("Erreur lors de la récupération des scores:", await response.text());
                this.showRankingScreen(playerName, []);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            this.showRankingScreen(playerName, []);
        }
    }

    // Afficher l'écran de classement
    showRankingScreen(playerName, scores) {
        // Créer le conteneur
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.zIndex = '3000';
        container.style.padding = '20px';

        // Titre
        const title = document.createElement('h2');
        title.textContent = 'Classement des meilleurs scores';
        title.style.color = '#FFD700';
        title.style.fontSize = '28px';
        title.style.fontFamily = "'Press Start 2P', sans-serif";
        title.style.marginBottom = '30px';
        title.style.textAlign = 'center';

        // Tableau des scores
        const scoreTable = document.createElement('div');
        scoreTable.style.width = '100%';
        scoreTable.style.maxWidth = '800px';
        scoreTable.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        scoreTable.style.borderRadius = '10px';
        scoreTable.style.padding = '20px';
        scoreTable.style.marginBottom = '30px';
        scoreTable.style.maxHeight = '60vh';
        scoreTable.style.overflowY = 'auto';

        // En-tête du tableau
        const header = document.createElement('div');
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1fr 3fr 2fr';
        header.style.padding = '10px 15px';
        header.style.borderBottom = '2px solid #FFD700';
        header.style.marginBottom = '10px';
        header.style.fontWeight = 'bold';
        header.style.color = '#FFD700';
        header.style.fontFamily = "'Press Start 2P', sans-serif";

        const rankHeader = document.createElement('div');
        rankHeader.textContent = 'Rang';
        rankHeader.style.textAlign = 'center';

        const nameHeader = document.createElement('div');
        nameHeader.textContent = 'Nom';
        nameHeader.style.textAlign = 'center';

        const scoreHeader = document.createElement('div');
        scoreHeader.textContent = 'Score';
        scoreHeader.style.textAlign = 'center';

        header.appendChild(rankHeader);
        header.appendChild(nameHeader);
        header.appendChild(scoreHeader);
        scoreTable.appendChild(header);

        // Contenu du tableau
        if (scores.length > 0) {
            scores.forEach((scoreEntry, index) => {
                const row = document.createElement('div');
                row.style.display = 'grid';
                row.style.gridTemplateColumns = '1fr 3fr 2fr';
                row.style.padding = '10px 15px';
                row.style.borderBottom = '1px solid #666';
                row.style.fontFamily = "'Press Start 2P', sans-serif";

                // Mettre en évidence le joueur actuel
                if (scoreEntry.name === playerName) {
                    row.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                    row.style.fontWeight = 'bold';
                }

                const rankCell = document.createElement('div');
                rankCell.textContent = `${index + 1}`;
                rankCell.style.textAlign = 'center';
                rankCell.style.color = 'white';

                const nameCell = document.createElement('div');
                nameCell.textContent = scoreEntry.name;
                nameCell.style.textAlign = 'center';
                nameCell.style.color = 'white';

                const scoreCell = document.createElement('div');
                scoreCell.textContent = scoreEntry.score;
                scoreCell.style.textAlign = 'center';
                scoreCell.style.color = 'white';

                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                scoreTable.appendChild(row);
            });
        } else {
            // Message si pas de scores
            const noScoreMessage = document.createElement('div');
            noScoreMessage.textContent = 'Aucun score disponible.';
            noScoreMessage.style.color = 'white';
            noScoreMessage.style.textAlign = 'center';
            noScoreMessage.style.padding = '20px';
            noScoreMessage.style.fontFamily = "'Press Start 2P', sans-serif";
            scoreTable.appendChild(noScoreMessage);
        }

        // Contrôles de pagination
        const paginationControls = document.createElement('div');
        paginationControls.style.display = 'flex';
        paginationControls.style.justifyContent = 'center';
        paginationControls.style.alignItems = 'center';
        paginationControls.style.gap = '20px';
        paginationControls.style.marginBottom = '20px';

        const prevButton = document.createElement('button');
        prevButton.textContent = '← Précédent';
        prevButton.style.padding = '8px 15px';
        prevButton.style.fontSize = '16px';
        prevButton.style.backgroundColor = this.currentPage > 1 ? '#4A4A4A' : '#252525';
        prevButton.style.color = 'white';
        prevButton.style.border = 'none';
        prevButton.style.borderRadius = '5px';
        prevButton.style.cursor = this.currentPage > 1 ? 'pointer' : 'default';
        prevButton.style.opacity = this.currentPage > 1 ? '1' : '0.5';
        prevButton.style.fontFamily = "'Press Start 2P', sans-serif";
        prevButton.disabled = this.currentPage <= 1;

        prevButton.onclick = () => {
            if (this.currentPage > 1) {
                this.loadPage(this.currentPage - 1, playerName, container);
            }
        };

        const pageInfo = document.createElement('div');
        pageInfo.textContent = `Page ${this.currentPage} / ${this.totalPages}`;
        pageInfo.style.color = 'white';
        pageInfo.style.fontSize = '16px';
        pageInfo.style.fontFamily = "'Press Start 2P', sans-serif";

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Suivant →';
        nextButton.style.padding = '8px 15px';
        nextButton.style.fontSize = '16px';
        nextButton.style.backgroundColor = this.currentPage < this.totalPages ? '#4A4A4A' : '#252525';
        nextButton.style.color = 'white';
        nextButton.style.border = 'none';
        nextButton.style.borderRadius = '5px';
        nextButton.style.cursor = this.currentPage < this.totalPages ? 'pointer' : 'default';
        nextButton.style.opacity = this.currentPage < this.totalPages ? '1' : '0.5';
        nextButton.style.fontFamily = "'Press Start 2P', sans-serif";
        nextButton.disabled = this.currentPage >= this.totalPages;

        nextButton.onclick = () => {
            if (this.currentPage < this.totalPages) {
                this.loadPage(this.currentPage + 1, playerName, container);
            }
        };

        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(pageInfo);
        paginationControls.appendChild(nextButton);

        // Bouton continuer
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continuer';
        continueButton.style.padding = '12px 25px';
        continueButton.style.fontSize = '18px';
        continueButton.style.backgroundColor = '#4CAF50';
        continueButton.style.color = 'white';
        continueButton.style.border = 'none';
        continueButton.style.borderRadius = '5px';
        continueButton.style.cursor = 'pointer';
        continueButton.style.fontFamily = "'Press Start 2P', sans-serif";

        continueButton.onclick = () => {
            // Supprimer le conteneur
            document.body.removeChild(container);

            // Exécuter le callback de fermeture si disponible
            if (this.onCloseCallback) {
                this.onCloseCallback();
            }
        };

        // Assembler le conteneur
        container.appendChild(title);
        container.appendChild(scoreTable);
        container.appendChild(paginationControls);
        container.appendChild(continueButton);

        document.body.appendChild(container);
    }

    // Charger une page spécifique du classement
    async loadPage(page, playerName, container) {
        try {
            // Récupérer les scores de la page demandée
            const response = await fetch(`${this.apiBaseUrl}?page=${page}&limit=${this.scoresPerPage}`);

            if (response.ok) {
                const data = await response.json();
                this.scoreData = data.scores || [];
                this.totalPages = data.totalPages || 1;
                this.currentPage = page;

                // Supprimer l'ancien conteneur
                document.body.removeChild(container);

                // Afficher le nouveau classement
                this.showRankingScreen(playerName, this.scoreData);
            } else {
                console.error("Erreur lors de la récupération des scores:", await response.text());
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
        }
    }

    update(deltaTime) {
        // Rien à mettre à jour régulièrement
    }
}