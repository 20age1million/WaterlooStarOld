package handlers

import (
	"WaterlooStar/backend/models"
	"WaterlooStar/backend/storage"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type RegisterRequest struct {
	Username        string `json:"username"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Message string       `json:"message"`
	User    *models.User `json:"user,omitempty"`
	Token   string       `json:"token,omitempty"`
}

var jwtSecret = []byte("your-secret-key-change-this-in-production")

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if err := validateRegistration(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := storage.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		http.Error(w, "Username or email already exists", http.StatusConflict)
		return
	}

	// Create new user
	user := models.User{
		Username: req.Username,
		Email:    req.Email,
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Generate email verification token
	token, err := generateRandomToken()
	if err != nil {
		http.Error(w, "Failed to generate verification token", http.StatusInternalServerError)
		return
	}
	user.EmailVerifyToken = token

	// Save user to database
	if err := storage.DB.Create(&user).Error; err != nil {
		log.Printf("Failed to create user: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Send verification email
	if err := sendVerificationEmail(user.Email, user.Username, token); err != nil {
		log.Printf("Failed to send verification email: %v", err)
		// Don't fail the registration, just log the error
	}

	response := AuthResponse{
		Message: "Registration successful! Please check your email to verify your account.",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Login handles user authentication
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find user by username
	var user models.User
	if err := storage.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Check if email is verified
	if !user.IsEmailVerified {
		http.Error(w, "Please verify your email before logging in", http.StatusUnauthorized)
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := generateJWTToken(user.ID, user.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	response := AuthResponse{
		Message: "Login successful",
		User:    &user,
		Token:   token,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// VerifyEmail handles email verification
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Verification token is required", http.StatusBadRequest)
		return
	}

	// Find user by verification token
	var user models.User
	if err := storage.DB.Where("email_verify_token = ?", token).First(&user).Error; err != nil {
		http.Error(w, "Invalid or expired verification token", http.StatusBadRequest)
		return
	}

	// Update user as verified
	user.IsEmailVerified = true
	user.EmailVerifyToken = "" // Clear the token
	if err := storage.DB.Save(&user).Error; err != nil {
		http.Error(w, "Failed to verify email", http.StatusInternalServerError)
		return
	}

	// Return success page or redirect
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintf(w, `
		<html>
		<head><title>Email Verified</title></head>
		<body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
			<h1 style="color: #d4a574;">✅ Email Verified Successfully!</h1>
			<p>Your account has been verified. You can now log in to the Student Community Forum.</p>
			<a href="http://localhost:3000" style="background: #d4a574; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Forum</a>
		</body>
		</html>
	`)
}

// Helper functions
func validateRegistration(req RegisterRequest) error {
	if len(req.Username) < 3 {
		return fmt.Errorf("username must be at least 3 characters long")
	}
	if len(req.Password) < 6 {
		return fmt.Errorf("password must be at least 6 characters long")
	}
	if req.Password != req.ConfirmPassword {
		return fmt.Errorf("passwords do not match")
	}
	if !isValidEmail(req.Email) {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func generateRandomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func generateJWTToken(userID uint, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func sendVerificationEmail(email, username, token string) error {
	// Email configuration - you should use environment variables for these
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	senderEmail := os.Getenv("SMTP_EMAIL")
	senderPassword := os.Getenv("SMTP_PASSWORD")

	if senderEmail == "" || senderPassword == "" {
		log.Println("SMTP credentials not configured, skipping email send")
		return nil // Don't fail registration if email isn't configured
	}

	verificationURL := fmt.Sprintf("http://localhost:8080/api/auth/verify-email?token=%s", token)

	subject := "Verify Your Email - Student Community Forum"
	body := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif;">
			<h2 style="color: #d4a574;">Welcome to Student Community Forum!</h2>
			<p>Hi %s,</p>
			<p>Thank you for registering! Please click the link below to verify your email address:</p>
			<a href="%s" style="background: #d4a574; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
			<p>Or copy and paste this link in your browser:</p>
			<p>%s</p>
			<p>This link will expire in 24 hours.</p>
			<p>If you didn't create this account, please ignore this email.</p>
		</body>
		</html>
	`, username, verificationURL, verificationURL)

	message := fmt.Sprintf("To: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s", email, subject, body)

	auth := smtp.PlainAuth("", senderEmail, senderPassword, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, senderEmail, []string{email}, []byte(message))
	return err
}
