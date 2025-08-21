package handlers

import (
	"WaterlooStar/backend/models"
	"WaterlooStar/backend/storage"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
)

func GetComments(w http.ResponseWriter, r *http.Request) {
	// Extract post ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/posts/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	postIDStr := parts[0]
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	var comments []models.Comment
	if err := storage.DB.Where("post_id = ?", uint(postID)).Order("created_at asc").Find(&comments).Error; err != nil {
		log.Println("DB Query error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(comments)
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	// Extract post ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/posts/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	postIDStr := parts[0]
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	var comment models.Comment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	comment.PostID = uint(postID)

	// Set default author if not provided
	if comment.Author == "" {
		comment.Author = "Anonymous"
	}

	if err := storage.DB.Create(&comment).Error; err != nil {
		log.Println("DB Insert error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}
