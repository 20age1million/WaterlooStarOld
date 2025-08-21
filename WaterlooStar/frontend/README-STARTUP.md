# Student Community Forum - Complete Startup Guide

## 🚨 IMPORTANT: Fix for OpenSSL Error + PowerShell Issues

### Problem
You're getting this error:
```
Error: error:0308010C:digital envelope routines::unsupported
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ]
```

### Root Cause
- Node.js 17+ uses OpenSSL 3.0 which removed legacy algorithms
- React Scripts 4.0.3 uses older webpack that depends on these algorithms
- PowerShell execution policy may block npm scripts

## 🔧 SOLUTIONS (Try in order)

### Solution 1: Use Command Prompt (NOT PowerShell)
1. Open **Command Prompt** (cmd.exe) as Administrator
2. Navigate to the frontend folder:
   ```cmd
   cd C:\Users\carly\OneDrive\Documents\20Age1Million\WaterlooStar\frontend
   ```
3. Set the environment variable and start:
   ```cmd
   set NODE_OPTIONS=--openssl-legacy-provider
   npm start
   ```

### Solution 2: Use the Batch File
1. Double-click `start-dev.bat` in the frontend folder
2. Or run from Command Prompt:
   ```cmd
   start-dev.bat
   ```

### Solution 3: Fix PowerShell Execution Policy
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` to confirm
4. Then try: `npm start`

### Solution 4: Use .env File (Already configured)
The `.env` file should work automatically. Just run:
```cmd
npm start
```

### Solution 5: Manual Environment Variable (Windows)
1. Right-click "This PC" → Properties → Advanced System Settings
2. Click "Environment Variables"
3. Under "User variables", click "New"
4. Variable name: `NODE_OPTIONS`
5. Variable value: `--openssl-legacy-provider`
6. Click OK, restart your terminal, then run `npm start`

## 🛠️ If Nothing Works

### Option A: Update Dependencies (Recommended)
1. Delete `node_modules` folder and `package-lock.json`
2. Update package.json (already done):
   - react-scripts: 5.0.1 (instead of 4.0.3)
3. Run: `npm install`
4. Run: `npm start`

### Option B: Use Node.js 16 (Temporary fix)
1. Download Node.js 16 LTS from nodejs.org
2. Install it (will replace Node.js 22)
3. Run: `npm start`
4. No environment variables needed

## ✅ Success Indicators
When working correctly, you should see:
```
Compiled successfully!

You can now view waterloo-star in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🔄 Starting Both Servers

### Frontend (React)
```cmd
cd WaterlooStar/frontend
npm start
```

### Backend (Go)
```cmd
cd WaterlooStar/backend
go run main.go
```

## 🆘 Emergency Contacts
If you're still having issues:
1. Check Node.js version: `node --version`
2. Check npm version: `npm --version`
3. Try the Command Prompt method (Solution 1)
4. Consider using Node.js 16 temporarily

The forum will be available at http://localhost:3000 once both servers are running!
