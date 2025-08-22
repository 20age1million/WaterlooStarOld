package storage

import (
	"WaterlooStar/backend/models"
	"log"
)

func Migrate() {
	log.Println("Starting database migration...")

	// Check if we need to run the manual migration first
	var userCount int64
	DB.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users'").Scan(&userCount)

	if userCount == 0 {
		log.Println("Users table doesn't exist. Running safe migration...")
		// Safe migration for new database
		err := DB.AutoMigrate(&models.User{}, &models.Post{}, &models.Comment{}, &models.PostLike{})
		if err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}
	} else {
		log.Println("Users table exists. Checking for data migration needs...")
		// Check if we have posts with invalid author_id
		var invalidPosts int64
		DB.Raw("SELECT COUNT(*) FROM posts WHERE author_id = 0 OR author_id IS NULL").Scan(&invalidPosts)

		if invalidPosts > 0 {
			log.Printf("Found %d posts with invalid author_id. Please run the manual migration first:", invalidPosts)
			log.Println("cd backend && go run cmd/migrate/main.go")
			log.Fatalf("Manual migration required before running the main application")
		}

		// Safe to migrate normally
		err := DB.AutoMigrate(&models.User{}, &models.Post{}, &models.Comment{}, &models.PostLike{})
		if err != nil {
			log.Fatalf("Failed to migrate database: %v", err)
		}
	}

	// Add unique constraint for post likes (one like per user per post)
	err := DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id)").Error
	if err != nil {
		log.Printf("Warning: Failed to create unique index for post_likes: %v", err)
	}

	log.Println("Database migrated (tables 'users', 'posts', 'comments', and 'post_likes' ready)")
}
