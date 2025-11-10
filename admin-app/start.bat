@echo off
REM ============================================
REM Script de demarrage FasoDocs Admin
REM ============================================

echo.
echo ========================================
echo    FasoDocs Admin - Demarrage
echo ========================================
echo.

REM Verification que Node.js est installe
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js est installe
node --version
echo.

REM Aller dans le dossier admin-app
cd /d "%~dp0"
echo Repertoire actuel: %CD%
echo.

REM Verification que node_modules existe
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    echo Cela peut prendre quelques minutes...
    echo.
    call npm install
    echo.
)

echo ========================================
echo    Demarrage du serveur...
echo ========================================
echo.
echo L'application sera accessible sur:
echo http://localhost:4200
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

REM Demarrer le serveur de developpement
call npm start

pause


