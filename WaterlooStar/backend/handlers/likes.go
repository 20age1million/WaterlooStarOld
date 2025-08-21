package handlers

import (
	"WaterlooStar/backend/middleware"
	"WaterlooStar/backend/models"
	"WaterlooStar/backend/storage"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

type LikeResponse struct {
	Message string `json:"message"`
	Liked   bool   `json:"liked"`
	Count   uint   `json:"count"`
}

// TogglePostLike handles liking/unliking a post
func TogglePostLike(w http.ResponseWriter, r *http.Request) {
	// Extract user from context (requires authentication)
	userClaims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	// Extract post ID from URL path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseUint(pathParts[3], 10, 32)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	// Check if post exists
	var post models.Post
	if err := storage.DB.First(&post, postID).Error; err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	// Check if user already liked this post
	var existingLike models.PostLike
	err = storage.DB.Where("user_id = ? AND post_id = ?", userClaims.UserID, postID).First(&existingLike).Error
	
	var liked bool
	var newCount uint

	if err != nil {
		// User hasn't liked this post yet, create a like
		newLike := models.PostLike{
			UserID: userClaims.UserID,
			PostID: uint(postID),
		}
		
		if err := storage.DB.Create(&newLike).Error; err != nil {
			http.Error(w, "Failed to like post", http.StatusInternalServerError)
			return
		}
		
		// Increment like count
		storage.DB.Model(&post).Update("likes", post.Likes+1)
		liked = true
		newCount = post.Likes + 1
	} else {
		// User already liked this post, remove the like
		if err := storage.DB.Delete(&existingLike).Error; err != nil {
			http.Error(w, "Failed to unlike post", http.StatusInternalServerError)
			return
		}
		
		// Decrement like count (ensure it doesn't go below 0)
		if post.Likes > 0 {
			storage.DB.Model(&post).Update("likes", post.Likes-1)
			newCount = post.Likes - 1
		} else {
			newCount = 0
		}
		liked = false
	}

	response := LikeResponse{
		Message: func() string {
			if liked {
				return "Post liked successfully"
			}
			return "Post unliked successfully"
		}(),
		Liked: liked,
		Count: newCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetPostLikes returns the like status and count for a post
func GetPostLikes(w http.ResponseWriter, r *http.Request) {
	// Extract post ID from URL path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	postID, err := strconv.ParseUint(pathParts[3], 10, 32)
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	// Get post
	var post models.Post
	if err := storage.DB.First(&post, postID).Error; err != nil {
		http.Error(w, "Post not found", http.StatusNotFound)
		return
	}

	// Check if current user liked this post (if authenticated)
	var liked bool
	userClaims, authenticated := middleware.GetUserFromContext(r)
	if authenticated {
		var existingLike models.PostLike
		err = storage.DB.Where("user_id = ? AND post_id = ?", userClaims.UserID, postID).First(&existingLike).Error
		liked = (err == nil)
	}

	response := LikeResponse{
		Message: "Like status retrieved",
		Liked:   liked,
		Count:   post.Likes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
