@echo off
title Student Forum - Install Dependencies
echo.
echo ========================================
echo  Student Community Forum
echo  Dependency Installation
echo ========================================
echo.

echo This will install all required dependencies for the React frontend.
echo This may take 2-5 minutes depending on your internet connection.
echo.
pause

echo Installing dependencies...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ========================================
    echo  INSTALLATION FAILED
    echo ========================================
    echo.
    echo This might be due to PowerShell execution policy.
    echo.
    echo MANUAL SOLUTION:
    echo 1. Open Command Prompt as Administrator
    echo 2. Navigate to this folder:
    echo    cd "%cd%"
    echo 3. Run: npm install
    echo.
    echo OR try this PowerShell fix:
    echo 1. Open PowerShell as Administrator
    echo 2. Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo 3. Type Y and press Enter
    echo 4. Run this batch file again
    echo.
) else (
    echo.
    echo ========================================
    echo  INSTALLATION SUCCESSFUL!
    echo ========================================
    echo.
    echo Dependencies installed successfully.
    echo You can now run the development server.
    echo.
    echo Next steps:
    echo 1. Double-click 'start-dev.bat' to start the server
    echo 2. Or run 'npm start' in Command Prompt
    echo.
)

echo.
pause
