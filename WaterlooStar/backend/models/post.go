package models

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Section   string         `json:"section"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Author    string         `json:"author"` // Username for display
	AuthorID  uint           `gorm:"not null" json:"author_id"`
	Tags      string         `json:"tags,omitempty"`
	Views     uint           `json:"views" gorm:"default:0"`
	Likes     uint           `json:"likes" gorm:"default:0"`
	IsLiked   bool           `json:"is_liked" gorm:"-"` // Computed field for current user
	Comments  []Comment      `json:"comments,omitempty" gorm:"foreignKey:PostID"`
	PostLikes []PostLike     `json:"post_likes,omitempty" gorm:"foreignKey:PostID"`
	User      User           `json:"user,omitempty" gorm:"foreignKey:AuthorID"`
}

type Comment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	PostID    uint           `gorm:"not null" json:"post_id"`
	Content   string         `json:"content"`
	Author    string         `json:"author"` // Username for display
	AuthorID  uint           `gorm:"not null" json:"author_id"`
	Likes     uint           `json:"likes" gorm:"default:0"`
	User      User           `json:"user,omitempty" gorm:"foreignKey:AuthorID"`
}
