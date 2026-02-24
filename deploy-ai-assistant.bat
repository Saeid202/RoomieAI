@echo off
REM =====================================================
REM Deploy AI Property Assistant with Gemini API
REM =====================================================

echo.
echo ========================================
echo   AI Property Assistant Deployment
echo ========================================
echo.

REM Step 1: Set Gemini API Key in Supabase
echo [Step 1] Setting Gemini API Key in Supabase...
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0

if %errorlevel% neq 0 (
    echo [ERROR] Failed to set API key
    pause
    exit /b 1
)

echo [SUCCESS] API key set successfully
echo.

REM Step 2: Run Database Migration
echo [Step 2] Running database migration...
supabase db push

if %errorlevel% neq 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)

echo [SUCCESS] Migration completed
echo.

REM Step 3: Deploy Edge Functions
echo [Step 3] Deploying Edge Functions...
echo.

echo   Deploying process-property-document...
supabase functions deploy process-property-document

if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy process-property-document
    pause
    exit /b 1
)

echo   [SUCCESS] process-property-document deployed
echo.

echo   Deploying ai-property-assistant...
supabase functions deploy ai-property-assistant

if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy ai-property-assistant
    pause
    exit /b 1
)

echo   [SUCCESS] ai-property-assistant deployed
echo.

REM Step 4: Verify Deployment
echo [Step 4] Verifying deployment...
supabase secrets list

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next Steps:
echo   1. Upload a property document
echo   2. Wait 1-2 minutes for processing
echo   3. Ask the AI a question
echo   4. Monitor usage at: https://aistudio.google.com
echo.
echo Free Tier Limits:
echo   - 15 requests per minute
echo   - 1,500 requests per day
echo   - 1,000,000 tokens per day
echo.
echo Cost: $0.00 (Free Forever!)
echo.
pause
