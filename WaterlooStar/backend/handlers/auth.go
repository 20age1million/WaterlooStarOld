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

// Helper function to send JSON error response with logging
func sendErrorResponse(w http.ResponseWriter, statusCode int, message string, logMessage string) {
	log.Printf("❌ [%d] %s", statusCode, logMessage)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

// Helper function to send JSON success response with logging
func sendSuccessResponse(w http.ResponseWriter, statusCode int, response interface{}, logMessage string) {
	log.Printf("✅ [%d] %s", statusCode, logMessage)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	log.Printf("Registration request received from %s", r.RemoteAddr)

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body", fmt.Sprintf("Failed to decode registration request: %v", err))
		return
	}

	log.Printf("Registration attempt for username: %s, email: %s", req.Username, req.Email)

	// Validate input
	if err := validateRegistration(req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, err.Error(), fmt.Sprintf("Registration validation failed for user %s: %v", req.Username, err))
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := storage.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		sendErrorResponse(w, http.StatusConflict, "Username or email already exists", fmt.Sprintf("Registration failed - user already exists: username=%s, email=%s", req.Username, req.Email))
		return
	}

	// Create new user
	user := models.User{
		Username:        req.Username,
		Email:           req.Email,
		IsEmailVerified: true, // Auto-verify for now (email verification disabled)
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to process password", fmt.Sprintf("Password hashing failed for user %s: %v", req.Username, err))
		return
	}

	// Skip email verification token generation since we're auto-verifying
	// token, err := generateRandomToken()
	// if err != nil {
	// 	http.Error(w, "Failed to generate verification token", http.StatusInternalServerError)
	// 	return
	// }
	// user.EmailVerifyToken = token

	// Save user to database
	if err := storage.DB.Create(&user).Error; err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to create user", fmt.Sprintf("Database error creating user %s: %v", req.Username, err))
		return
	}

	log.Printf("User created successfully: ID=%d, Username=%s", user.ID, user.Username)

	// Skip sending verification email since we're auto-verifying
	// if err := sendVerificationEmail(user.Email, user.Username, token); err != nil {
	// 	log.Printf("Failed to send verification email: %v", err)
	// 	// Don't fail the registration, just log the error
	// }

	response := AuthResponse{
		Message: "Registration successful! You can now log in with your credentials.",
	}

	sendSuccessResponse(w, http.StatusCreated, response, fmt.Sprintf("User %s (ID: %d) registered successfully", user.Username, user.ID))
}

// Login handles user authentication
func Login(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔐 Login request received from %s", r.RemoteAddr)

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body", fmt.Sprintf("Failed to decode login request: %v", err))
		return
	}

	log.Printf("🔐 Login attempt for username: %s", req.Username)

	// Find user by username
	var user models.User
	if err := storage.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid username or password", fmt.Sprintf("Login failed - user not found: %s", req.Username))
		return
	}

	// Skip email verification check (disabled for now)
	// if !user.IsEmailVerified {
	// 	http.Error(w, "Please verify your email before logging in", http.StatusUnauthorized)
	// 	return
	// }

	// Check password
	if !user.CheckPassword(req.Password) {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid username or password", fmt.Sprintf("Login failed - invalid password for user: %s", req.Username))
		return
	}

	// Generate JWT token
	token, err := generateJWTToken(user.ID, user.Username)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Failed to generate token", fmt.Sprintf("JWT generation failed for user %s: %v", req.Username, err))
		return
	}

	// Create a clean user object without relationships to avoid JSON serialization issues
	cleanUser := models.User{
		ID:              user.ID,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		Username:        user.Username,
		Email:           user.Email,
		IsEmailVerified: user.IsEmailVerified,
		Name:            user.Name,
		SchoolYear:      user.SchoolYear,
		Major:           user.Major,
		ContactInfo:     user.ContactInfo,
		Bio:             user.Bio,
	}

	response := AuthResponse{
		Message: "Login successful",
		User:    &cleanUser,
		Token:   token,
	}

	sendSuccessResponse(w, http.StatusOK, response, fmt.Sprintf("User %s (ID: %d) logged in successfully", user.Username, user.ID))
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
