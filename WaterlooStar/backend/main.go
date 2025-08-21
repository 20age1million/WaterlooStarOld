package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"WaterlooStar/backend/handlers"
	"WaterlooStar/backend/middleware"
	"WaterlooStar/backend/storage"
)

func main() {
	// Example: "user=postgres password=yourpassword dbname=yourdb sslmode=disable"
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		dsn = "user=postgres password=P5269874 dbname=20Age sslmode=disable"
	}
	storage.InitDB(dsn)
	storage.Migrate()

	// CORS middleware
	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next(w, r)
		}
	}

	// Authentication endpoints
	http.HandleFunc("/api/auth/register", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handlers.Register(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}))

	http.HandleFunc("/api/auth/login", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handlers.Login(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}))

	http.HandleFunc("/api/auth/verify-email", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handlers.VerifyEmail(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}))

	// Posts endpoints
	http.HandleFunc("/api/posts", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			// Use optional auth middleware for GET (guests can view)
			middleware.OptionalAuthMiddleware(handlers.GetPosts)(w, r)
			return
		}
		if r.Method == http.MethodPost {
			// Require auth for POST (only authenticated users can create)
			middleware.AuthMiddleware(handlers.CreatePost)(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}))

	// Post likes endpoints
	http.HandleFunc("/api/posts/", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/api/posts/")
		parts := strings.Split(path, "/")

		if len(parts) >= 2 && parts[1] == "like" {
			// Handle post likes: /api/posts/{id}/like
			if r.Method == http.MethodPost {
				middleware.AuthMiddleware(handlers.TogglePostLike)(w, r)
				return
			}
			if r.Method == http.MethodGet {
				middleware.OptionalAuthMiddleware(handlers.GetPostLikes)(w, r)
				return
			}
		} else if len(parts) >= 2 && parts[1] == "comments" {
			// Handle comments: /api/posts/{id}/comments
			postIDStr := parts[0]
			_, err := strconv.ParseUint(postIDStr, 10, 32)
			if err != nil {
				http.Error(w, "Invalid post ID", http.StatusBadRequest)
				return
			}

			if r.Method == http.MethodGet {
				handlers.GetComments(w, r)
				return
			}
			if r.Method == http.MethodPost {
				middleware.AuthMiddleware(handlers.CreateComment)(w, r)
				return
			}
		}
		http.Error(w, "Not found", http.StatusNotFound)
	}))

	log.Println("Backend running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
