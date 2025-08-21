package handlers

import (
	"WaterlooStar/backend/middleware"
	"WaterlooStar/backend/models"
	"WaterlooStar/backend/storage"
	"encoding/json"
	"log"
	"net/http"
)

func GetPosts(w http.ResponseWriter, r *http.Request) {
	section := r.URL.Query().Get("section")
	var posts []models.Post
	query := storage.DB.Preload("Comments").Order("created_at desc")
	if section != "" {
		query = query.Where("section = ?", section)
	}
	if err := query.Find(&posts).Error; err != nil {
		log.Println("DB Query error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Check if current user liked each post (if authenticated)
	userClaims, authenticated := middleware.GetUserFromContext(r)
	if authenticated {
		for i := range posts {
			var existingLike models.PostLike
			err := storage.DB.Where("user_id = ? AND post_id = ?", userClaims.UserID, posts[i].ID).First(&existingLike).Error
			posts[i].IsLiked = (err == nil)
		}
	}

	json.NewEncoder(w).Encode(posts)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	// Require authentication for creating posts
	userClaims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "Authentication required to create posts", http.StatusUnauthorized)
		return
	}

	section := r.URL.Query().Get("section")
	if section == "" {
		http.Error(w, "Section is required", http.StatusBadRequest)
		return
	}

	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	// Get user information
	var user models.User
	if err := storage.DB.First(&user, userClaims.UserID).Error; err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Set post information from authenticated user
	post.Section = section // Always use section from URL, ignore body
	post.AuthorID = userClaims.UserID
	post.Author = user.Username // Use username instead of manual input

	if err := storage.DB.Create(&post).Error; err != nil {
		log.Println("DB Insert error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}
