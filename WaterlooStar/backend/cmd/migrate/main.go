package main

import (
	"WaterlooStar/backend/models"
	"WaterlooStar/backend/storage"
	"log"
	"os"
)

func main() {
	// Initialize database connection
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		dsn = "user=postgres password=P5269874 dbname=20Age sslmode=disable"
	}
	storage.InitDB(dsn)

	log.Println("Starting manual migration...")

	// Step 1: Create users table first
	err := storage.DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate users table: %v", err)
	}
	log.Println("✓ Users table migrated")

	// Step 2: Create a system user for existing posts
	var systemUser models.User
	err = storage.DB.Where("username = ?", "System").First(&systemUser).Error
	if err != nil {
		// Create system user
		systemUser = models.User{
			Username:        "System",
			Email:           "system@studentforum.local",
			IsEmailVerified: true,
		}
		err = systemUser.HashPassword("system-account-not-for-login")
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}
		
		if err := storage.DB.Create(&systemUser).Error; err != nil {
			log.Fatalf("Failed to create system user: %v", err)
		}
		log.Printf("✓ Created system user with ID: %d", systemUser.ID)
	} else {
		log.Printf("✓ System user already exists with ID: %d", systemUser.ID)
	}

	// Step 3: Update existing posts to have valid author_id
	// First, let's see if posts table exists and has data
	var postCount int64
	storage.DB.Raw("SELECT COUNT(*) FROM posts WHERE author_id = 0 OR author_id IS NULL").Scan(&postCount)
	if postCount > 0 {
		log.Printf("Found %d posts with invalid author_id, updating...", postCount)
		result := storage.DB.Exec("UPDATE posts SET author_id = ? WHERE author_id = 0 OR author_id IS NULL", systemUser.ID)
		if result.Error != nil {
			log.Fatalf("Failed to update posts: %v", result.Error)
		}
		log.Printf("✓ Updated %d posts to use system user", result.RowsAffected)
	}

	// Step 4: Update existing comments to have valid author_id
	var commentCount int64
	storage.DB.Raw("SELECT COUNT(*) FROM comments WHERE author_id = 0 OR author_id IS NULL").Scan(&commentCount)
	if commentCount > 0 {
		log.Printf("Found %d comments with invalid author_id, updating...", commentCount)
		result := storage.DB.Exec("UPDATE comments SET author_id = ? WHERE author_id = 0 OR author_id IS NULL", systemUser.ID)
		if result.Error != nil {
			log.Fatalf("Failed to update comments: %v", result.Error)
		}
		log.Printf("✓ Updated %d comments to use system user", result.RowsAffected)
	}

	// Step 5: Now migrate all tables with proper foreign keys
	err = storage.DB.AutoMigrate(&models.Post{}, &models.Comment{}, &models.PostLike{})
	if err != nil {
		log.Fatalf("Failed to migrate remaining tables: %v", err)
	}
	log.Println("✓ All tables migrated")

	// Step 6: Add unique constraint for post likes
	err = storage.DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id)").Error
	if err != nil {
		log.Printf("Warning: Failed to create unique index for post_likes: %v", err)
	} else {
		log.Println("✓ Unique index for post_likes created")
	}

	log.Println("🎉 Migration completed successfully!")
	log.Println("You can now run your main application.")
}
