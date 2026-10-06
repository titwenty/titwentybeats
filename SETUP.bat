@echo off
cd /d "%~dp0"
echo Installing dependencies...
npm install
echo.
echo Login to Cloudflare:
npx wrangler login
echo.
echo Creating R2 bucket if possible:
npx wrangler r2 bucket create titwenty-beats
echo.
echo Set ADMIN_PASSWORD:
npx wrangler secret put ADMIN_PASSWORD
echo.
echo Deploying...
npx wrangler deploy
pause
