@echo off
title Student Community Forum - Development Server
echo.
echo ========================================
echo  Student Community Forum
echo  Development Server Startup
echo ========================================
echo.
echo Setting up environment for Node.js compatibility...
set NODE_OPTIONS=--openssl-legacy-provider
set SKIP_PREFLIGHT_CHECK=true
echo.
echo Starting React development server...
echo This may take a moment on first run...
echo.
echo Press Ctrl+C to stop the server
echo.
npm start
echo.
echo Server stopped.
pause
