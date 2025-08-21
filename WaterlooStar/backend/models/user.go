package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	Username           string         `gorm:"uniqueIndex;not null" json:"username"`
	Email              string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash       string         `gorm:"not null" json:"-"`
	IsEmailVerified    bool           `gorm:"default:false" json:"is_email_verified"`
	EmailVerifyToken   string         `json:"-"`
	ResetPasswordToken string         `json:"-"`
	Name               string         `json:"name,omitempty"`
	SchoolYear         string         `json:"school_year,omitempty"`
	Major              string         `json:"major,omitempty"`
	ContactInfo        string         `json:"contact_info,omitempty"`
	Bio                string         `json:"bio,omitempty"`
	Posts              []Post         `json:"posts,omitempty" gorm:"foreignKey:AuthorID"`
	Comments           []Comment      `json:"comments,omitempty" gorm:"foreignKey:AuthorID"`
}

// HashPassword hashes the user's password
func (u *User) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	return nil
}

// CheckPassword checks if the provided password matches the user's password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}
