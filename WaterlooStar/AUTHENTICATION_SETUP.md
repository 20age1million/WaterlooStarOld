# 🔐 Authentication System Setup Guide

## Overview
The Student Community Forum now includes a complete authentication system with:
- User registration with email verification
- Secure login with JWT tokens
- Password hashing with bcrypt
- Email confirmation system

## 🚀 Quick Setup

### 1. Environment Variables (Optional)
For email verification to work, set these environment variables:

**Windows (Command Prompt):**
```cmd
set SMTP_EMAIL=your-gmail@gmail.com
set SMTP_PASSWORD=your-app-password
```

**Windows (PowerShell):**
```powershell
$env:SMTP_EMAIL="your-gmail@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
```

**Note:** If you don't set these, registration will still work but no verification emails will be sent.

### 2. Gmail App Password Setup (if using Gmail)
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular password) in SMTP_PASSWORD

### 3. Start the Servers
```cmd
# Backend (Terminal 1)
cd WaterlooStar/backend
go run main.go

# Frontend (Terminal 2)
cd WaterlooStar/frontend
npm start
```

## 🔑 How It Works

### Registration Process
1. User fills out registration form (username, email, password, confirm password)
2. Backend validates input and creates user account
3. Verification email is sent (if SMTP is configured)
4. User clicks verification link in email
5. Account is activated and user can login

### Login Process
1. User enters username and password
2. Backend verifies credentials and email verification status
3. JWT token is generated and returned
4. Frontend stores token and user info
5. User is logged in and can access protected features

### Security Features
- Passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Email verification required before login
- Input validation on both frontend and backend
- SQL injection protection with GORM

## 🎯 User Experience

### For New Users
1. Click "📝 Register" in header
2. Fill out registration form
3. Check email for verification link
4. Click verification link
5. Return to site and click "🔐 Login"
6. Enter credentials and start using the forum

### For Existing Users
1. Click "🔐 Login" in header
2. Enter username and password
3. Automatically logged in and redirected

### Logged In Users
- See their username in header with profile button
- Can access "🚪 Logout" button
- Profile information is preserved
- Can create posts and comments (when implemented)

## 🛠️ Technical Details

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verify_token VARCHAR,
    reset_password_token VARCHAR,
    name VARCHAR,
    school_year VARCHAR,
    major VARCHAR,
    contact_info VARCHAR,
    bio TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email?token=...` - Email verification

### Frontend State Management
- Authentication state stored in localStorage
- JWT token included in API requests
- User info available throughout the app
- Automatic logout on token expiration

## 🔧 Troubleshooting

### Email Not Sending
- Check SMTP environment variables are set correctly
- Verify Gmail app password (not regular password)
- Check spam folder for verification emails
- Registration still works without email - users just can't login until manually verified

### Login Issues
- Ensure email is verified (check database or implement admin panel)
- Check username/password are correct
- Clear localStorage if having token issues

### Development Tips
- Use a test email service like Mailtrap for development
- Check browser console for authentication errors
- Monitor backend logs for detailed error messages

## 🎉 What's Next

The authentication system is now ready! Users can:
- ✅ Register new accounts
- ✅ Verify email addresses
- ✅ Login securely
- ✅ Stay logged in across sessions
- ✅ Logout when needed

Future enhancements could include:
- Password reset functionality
- Social login (Google, Facebook)
- Admin user management
- Enhanced profile features
- Two-factor authentication
