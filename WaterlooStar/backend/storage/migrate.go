package storage

import (
	"WaterlooStar/backend/models"
	"log"
)

func Migrate() {
	err := DB.AutoMigrate(&models.User{}, &models.Post{}, &models.Comment{}, &models.PostLike{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Add unique constraint for post likes (one like per user per post)
	err = DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id)").Error
	if err != nil {
		log.Printf("Warning: Failed to create unique index for post_likes: %v", err)
	}

	log.Println("Database migrated (tables 'users', 'posts', 'comments', and 'post_likes' ready)")
}
