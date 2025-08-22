package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

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

	// Simple CORS and Logging middleware
	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Request logging
			log.Printf("🌐 [%s] %s %s", r.RemoteAddr, r.Method, r.URL.Path)
			if r.Method == "POST" || r.Method == "PUT" {
				body, _ := io.ReadAll(r.Body)
				r.Body = io.NopCloser(strings.NewReader(string(body)))
				log.Printf("📝 Request Body: %s", string(body))
			}

			// CORS
			log.Printf("🔄 CORS: Processing %s request to %s", r.Method, r.URL.Path)
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			if r.Method == http.MethodOptions {
				log.Printf("✅ CORS: OPTIONS preflight handled - Status: 200")
				w.WriteHeader(http.StatusOK)
				return
			}

			// Call the actual handler
			log.Printf("🚀 Calling handler for %s %s", r.Method, r.URL.Path)
			next(w, r)
			log.Printf("✅ Handler completed for %s %s", r.Method, r.URL.Path)
		}
	}

	// Test endpoint
	http.HandleFunc("/api/test", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("🧪 Test endpoint called")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message":   "Backend is working!",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	}))

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
