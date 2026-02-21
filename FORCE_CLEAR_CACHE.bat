@echo off
echo Clearing all caches...

REM Stop any running dev servers
echo Stopping dev server...
taskkill /F /IM node.exe 2>nul

REM Clear Vite cache
echo Clearing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

REM Clear dist folder
echo Clearing dist folder...
if exist dist rmdir /s /q dist

echo.
echo Cache cleared! Now:
echo 1. Close ALL browser windows
echo 2. Run: npm run dev
echo 3. Open browser in Incognito mode
echo 4. Navigate to the app
echo.
pause
