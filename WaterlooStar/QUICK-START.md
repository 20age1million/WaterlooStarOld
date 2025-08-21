# 🚀 Student Community Forum - Quick Start Guide

## ⚡ Fastest Way to Start (Windows)

### 🚨 FIRST TIME SETUP (Required)
1. Open **Command Prompt** (NOT PowerShell)
2. Install dependencies:
```cmd
cd WaterlooStar\frontend
npm install
```
3. Wait 2-5 minutes for installation to complete

### Option 1: Double-click the batch file
1. Navigate to `WaterlooStar/frontend/`
2. Double-click `install-dependencies.bat` (first time only)
3. Double-click `start-dev.bat`
4. Open http://localhost:3000 in your browser

### Option 2: Command Prompt (Recommended)
1. Open **Command Prompt** (NOT PowerShell)
2. Run these commands:
```cmd
cd WaterlooStar\frontend
npm install
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

## 🔧 What We Fixed

### 1. OpenSSL Compatibility Issue
- **Problem**: Node.js 22 + React Scripts 4.0.3 incompatibility
- **Solution**: Added `NODE_OPTIONS=--openssl-legacy-provider` environment variable
- **Files Modified**: 
  - `.env` (automatic environment setup)
  - `package.json` (updated react-scripts to 5.0.1)

### 2. PowerShell Execution Policy
- **Problem**: Windows PowerShell blocks npm scripts by default
- **Solution**: Created batch files that work with Command Prompt
- **Files Created**:
  - `start-dev.bat` (simple start)
  - `fix-and-start.bat` (comprehensive solution)

### 3. Future-Proofing
- **Updated Dependencies**: React Scripts 5.0.1 (compatible with Node.js 17+)
- **Environment Variables**: Automatic setup via `.env` file
- **Multiple Start Methods**: Batch files, PowerShell scripts, manual commands

## 🎯 Start Both Servers

### Frontend (Port 3000)
```cmd
cd WaterlooStar\frontend
fix-and-start.bat
```

### Backend (Port 8080)
```cmd
cd WaterlooStar\backend
go run main.go
```

## ✅ Success Check
When working, you should see:
- Frontend: http://localhost:3000 (React app)
- Backend: http://localhost:8080 (Go API)
- No OpenSSL errors in the console

## 🆘 If Still Having Issues

1. **Try Command Prompt instead of PowerShell**
2. **Use the batch files** (they handle everything automatically)
3. **Check Node.js version**: `node --version` (should work with any version now)
4. **Delete and reinstall**: Remove `node_modules`, run `npm install`

## 📱 Using the Forum

Once both servers are running:
1. Visit http://localhost:3000
2. Browse the 6 community sections
3. Create posts with tags
4. Use the search and filter features
5. Chat in the General Chat sidebar
6. Set up your user profile

The forum is now fully functional and future-proof! 🎉
