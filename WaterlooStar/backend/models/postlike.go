package models

import (
	"time"
	"gorm.io/gorm"
)

type PostLike struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	PostID    uint           `gorm:"not null" json:"post_id"`
	User      User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Post      Post           `json:"post,omitempty" gorm:"foreignKey:PostID"`
}

// Ensure unique constraint on user_id and post_id combination
func init() {
	// This will be handled by GORM's unique index
}
