// Voici un serveur Go minimal pour gérer les scores:
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Score représente un score individuel
type Score struct {
	Name  string    `json:"name"`
	Score int       `json:"score"`
	Time  time.Time `json:"time"`
}

// ScoreResponse est la structure de la réponse pour les scores
type ScoreResponse struct {
	Scores      []Score `json:"scores"`
	TotalPages  int     `json:"totalPages"`
	CurrentPage int     `json:"currentPage"`
	TotalScores int     `json:"totalScores"`
}

// ScoreDatabase stocke tous les scores
type ScoreDatabase struct {
	scores []Score
	mutex  sync.RWMutex
}

var db ScoreDatabase

func init() {
	// Initialiser la base de données avec quelques scores
	db.scores = []Score{
		{Name: "Joueur1", Score: 5000, Time: time.Now().Add(-24 * time.Hour)},
		{Name: "Joueur2", Score: 4500, Time: time.Now().Add(-48 * time.Hour)},
		{Name: "Joueur3", Score: 6000, Time: time.Now().Add(-72 * time.Hour)},
	}
}

func main() {
	// Gestionnaire CORS pour toutes les requêtes
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Configurer les en-têtes CORS
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			// Gérer les requêtes OPTIONS (preflight)
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next(w, r)
		}
	}

	// Configurer les routes
	http.HandleFunc("/api/scores", corsMiddleware(handleScores))

	// Démarrer le serveur
	port := 8080
	fmt.Printf("Serveur démarré sur le port %d\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

// Gestionnaire de scores pour GET et POST
func handleScores(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Traiter selon la méthode HTTP
	switch r.Method {
	case "GET":
		getScores(w, r)
	case "POST":
		addScore(w, r)
	default:
		http.Error(w, "Méthode non supportée", http.StatusMethodNotAllowed)
	}
}

// Récupérer les scores avec pagination et recherche
func getScores(w http.ResponseWriter, r *http.Request) {
	// Paramètres de requête
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	search := r.URL.Query().Get("search")

	// Valeurs par défaut
	page := 1
	limit := 10

	// Parser les paramètres
	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}

	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}

	// Verrouiller pour la lecture
	db.mutex.RLock()
	defer db.mutex.RUnlock()

	// Filtrer par recherche si spécifiée
	var filteredScores []Score
	if search != "" {
		for _, score := range db.scores {
			if strings.Contains(strings.ToLower(score.Name), strings.ToLower(search)) {
				filteredScores = append(filteredScores, score)
			}
		}
	} else {
		// Copier tous les scores
		filteredScores = make([]Score, len(db.scores))
		copy(filteredScores, db.scores)
	}

	// Trier par score décroissant
	sort.Slice(filteredScores, func(i, j int) bool {
		return filteredScores[i].Score > filteredScores[j].Score
	})

	// Calculer la pagination
	totalScores := len(filteredScores)
	totalPages := (totalScores + limit - 1) / limit
	if totalPages == 0 {
		totalPages = 1
	}

	// Ajuster la page si nécessaire
	if page > totalPages {
		page = totalPages
	}

	// Extraire la page demandée
	start := (page - 1) * limit
	end := start + limit
	if end > totalScores {
		end = totalScores
	}

	var pageScores []Score
	if start < totalScores {
		pageScores = filteredScores[start:end]
	} else {
		pageScores = []Score{}
	}

	// Construire la réponse
	response := ScoreResponse{
		Scores:      pageScores,
		TotalPages:  totalPages,
		CurrentPage: page,
		TotalScores: totalScores,
	}

	// Envoyer la réponse
	json.NewEncoder(w).Encode(response)
}

// Ajouter un nouveau score
func addScore(w http.ResponseWriter, r *http.Request) {
	var newScore Score

	// Décoder le JSON
	err := json.NewDecoder(r.Body).Decode(&newScore)
	if err != nil {
		http.Error(w, "Erreur de décodage JSON", http.StatusBadRequest)
		return
	}

	// Valider les données
	if newScore.Name == "" {
		http.Error(w, "Le nom est requis", http.StatusBadRequest)
		return
	}

	// Mettre à jour l'horodatage
	newScore.Time = time.Now()

	// Verrouiller pour l'écriture
	db.mutex.Lock()
	defer db.mutex.Unlock()

	// Ajouter le score
	db.scores = append(db.scores, newScore)

	// Répondre avec succès
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Score ajouté avec succès"})
}
