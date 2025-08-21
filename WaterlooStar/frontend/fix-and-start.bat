@echo off
title Student Forum - Fix and Start
echo.
echo ========================================
echo  Student Community Forum
echo  Automatic Fix and Start Script
echo ========================================
echo.

echo Checking Node.js version...
node --version
echo.

echo Checking npm version...
npm --version
echo.

echo Setting environment variables for compatibility...
set NODE_OPTIONS=--openssl-legacy-provider
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=false
echo Environment variables set.
echo.

echo Checking if node_modules exists...
if exist node_modules (
    echo node_modules found.
    echo Checking if react-scripts is installed...
    if exist "node_modules\.bin\react-scripts.cmd" (
        echo react-scripts found.
    ) else (
        echo react-scripts missing. Installing dependencies...
        call npm install
        echo.
    )
) else (
    echo node_modules not found. Installing dependencies...
    echo This may take a few minutes...
    call npm install
    echo.
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        echo.
        echo SOLUTION: Please run this command manually in Command Prompt:
        echo   npm install
        echo.
        echo Then run this batch file again.
        pause
        exit /b 1
    )
)

echo Starting development server...
echo.
echo *** IMPORTANT ***
echo If you see OpenSSL errors, this script should fix them automatically.
echo The server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server when done.
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

npm start

echo.
echo Server stopped. Press any key to exit.
pause >nul
