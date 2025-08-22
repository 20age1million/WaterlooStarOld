package storage

import (
	"WaterlooStar/backend/models"
	"log"
)

// FixExistingData handles migration of existing posts to work with the new user system
func FixExistingData() error {
	log.Println("Fixing existing data for user system migration...")

	// First, create a default "System" user for existing posts
	var systemUser models.User
	err := DB.Where("username = ?", "System").First(&systemUser).Error
	if err != nil {
		// Create system user
		systemUser = models.User{
			Username:        "System",
			Email:           "system@studentforum.local",
			IsEmailVerified: true,
		}
		// Set a default password (this account won't be used for login)
		err = systemUser.HashPassword("system-account-not-for-login")
		if err != nil {
			return err
		}
		
		if err := DB.Create(&systemUser).Error; err != nil {
			return err
		}
		log.Printf("Created system user with ID: %d", systemUser.ID)
	}

	// Update all posts that have author_id = 0 or NULL to use the system user
	result := DB.Model(&models.Post{}).Where("author_id = ? OR author_id IS NULL", 0).Update("author_id", systemUser.ID)
	if result.Error != nil {
		return result.Error
	}
	log.Printf("Updated %d posts to use system user", result.RowsAffected)

	// Update all comments that have author_id = 0 or NULL to use the system user
	result = DB.Model(&models.Comment{}).Where("author_id = ? OR author_id IS NULL", 0).Update("author_id", systemUser.ID)
	if result.Error != nil {
		return result.Error
	}
	log.Printf("Updated %d comments to use system user", result.RowsAffected)

	log.Println("Data migration completed successfully!")
	return nil
}
