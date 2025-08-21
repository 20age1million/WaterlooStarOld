# 🚨 TROUBLESHOOTING: "react-scripts is not recognized"

## Problem
You're getting this error:
```
'react-scripts' is not recognized as an internal or external command,
operable program or batch file.
```

## Root Cause
The `node_modules` folder is missing or incomplete because:
1. Dependencies were never installed
2. PowerShell execution policy is blocking npm
3. Installation was interrupted

## 🔧 SOLUTIONS (Try in order)

### Solution 1: Use Command Prompt (Recommended)
1. **Close PowerShell**
2. **Open Command Prompt** (search "cmd" in Start menu)
3. Navigate to the frontend folder:
   ```cmd
   cd C:\Users\carly\OneDrive\Documents\20Age1Million\WaterlooStar\frontend
   ```
4. Install dependencies:
   ```cmd
   npm install
   ```
5. Start the server:
   ```cmd
   set NODE_OPTIONS=--openssl-legacy-provider
   npm start
   ```

### Solution 2: Use the Batch Files
1. **Double-click** `install-dependencies.bat` first
2. Wait for installation to complete
3. **Double-click** `start-dev.bat` to start the server

### Solution 3: Fix PowerShell Execution Policy
1. **Open PowerShell as Administrator** (right-click → "Run as administrator")
2. Run this command:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type `Y` and press Enter
4. Now you can use npm in PowerShell:
   ```powershell
   npm install
   npm start
   ```

### Solution 4: Manual Installation Check
1. Check if `node_modules` folder exists in the frontend directory
2. If missing, create it by running `npm install`
3. Verify `react-scripts` is installed:
   ```cmd
   dir node_modules\.bin\react-scripts*
   ```

## 🎯 Complete Step-by-Step (Foolproof Method)

### Step 1: Install Dependencies
```cmd
# Open Command Prompt (NOT PowerShell)
cd C:\Users\carly\OneDrive\Documents\20Age1Million\WaterlooStar\frontend
npm install
```

### Step 2: Start Frontend Server
```cmd
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

### Step 3: Start Backend Server (New Command Prompt window)
```cmd
cd C:\Users\carly\OneDrive\Documents\20Age1Million\WaterlooStar\backend
go run main.go
```

## ✅ Success Indicators

### After `npm install`:
- `node_modules` folder appears (large folder with thousands of files)
- No error messages
- Takes 2-5 minutes to complete

### After `npm start`:
```
Compiled successfully!

You can now view waterloo-star in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🆘 If Nothing Works

### Nuclear Option (Clean Reinstall):
1. Delete these files/folders:
   - `node_modules` folder
   - `package-lock.json` file
2. Run in Command Prompt:
   ```cmd
   npm cache clean --force
   npm install
   ```

### Alternative: Use Different Terminal
- **Git Bash** (if installed)
- **Windows Terminal** with Command Prompt profile
- **VS Code Terminal** set to Command Prompt

### Check Your Setup:
```cmd
node --version    # Should show v22.18.0 or similar
npm --version     # Should show 10.x.x or similar
```

## 📞 Quick Reference

| Problem | Solution |
|---------|----------|
| PowerShell blocks npm | Use Command Prompt instead |
| react-scripts not found | Run `npm install` first |
| OpenSSL error | Set `NODE_OPTIONS=--openssl-legacy-provider` |
| Installation fails | Try as Administrator |

The key is using **Command Prompt** instead of **PowerShell** for npm commands!
