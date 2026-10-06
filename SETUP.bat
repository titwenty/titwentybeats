@echo off
setlocal
echo ==========================================
echo       titwenty-Beats Cloudflare setup
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
echo Installing Wrangler...
call npm install
if errorlevel 1 goto fail
echo.
echo Logging into Cloudflare...
call npx wrangler login
if errorlevel 1 goto fail
echo.
echo Creating R2 bucket titwenty-beats...
call npx wrangler r2 bucket create titwenty-beats
if errorlevel 1 (
  echo Bucket may already exist; continuing...
)
echo.
echo Set the password that protects your upload/admin panel.
echo IMPORTANT: do not share this password with artists.
set /p ADMINPASS=Admin password: 
if "%ADMINPASS%"=="" goto fail
echo.
echo Saving ADMIN_PASSWORD as a Cloudflare secret...
echo %ADMINPASS%| call npx wrangler secret put ADMIN_PASSWORD
if errorlevel 1 goto fail
echo.
echo Deploying titwenty-Beats...
call npx wrangler deploy
if errorlevel 1 goto fail
echo.
echo ==========================================
echo DONE! Open the URL printed above.
echo ==========================================
pause
exit /b 0

:fail
echo.
echo SETUP FAILED. Read the error above.
pause
exit /b 1
