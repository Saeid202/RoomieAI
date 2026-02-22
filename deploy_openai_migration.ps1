# =====================================================
# OpenAI Migration Deployment Script (Windows)
# =====================================================

Write-Host "`n🚀 OpenAI Migration Deployment`n" -ForegroundColor Cyan

# Step 1: Run Database Migration
Write-Host "📊 Step 1: Running database migration..." -ForegroundColor Yellow
Write-Host "   File: supabase/migrations/20260221_migrate_to_openai_embeddings.sql`n"

$runMigration = Read-Host "Run migration now? (y/n)"
if ($runMigration -eq 'y') {
    Write-Host "`n   Running: supabase db push`n" -ForegroundColor Gray
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Migration completed successfully`n" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Migration failed. Please run manually in Supabase SQL Editor.`n" -ForegroundColor Red
        Write-Host "   Copy contents of: supabase/migrations/20260221_migrate_to_openai_embeddings.sql`n" -ForegroundColor Gray
    }
} else {
    Write-Host "`n   ⏭️  Skipped. Run manually: supabase db push`n" -ForegroundColor Gray
}

# Step 2: Set OpenAI API Key
Write-Host "🔑 Step 2: Setting OpenAI API Key..." -ForegroundColor Yellow
Write-Host "   Key: sk-proj-miBSp5SDoUd6zTK_dDKLXnfmUCTrBbGnxXT33JaoBvgzCEJF3KJ7aOome0Syu49dk-qBKKfXHM...`n"

$setApiKey = Read-Host "Set API key now? (y/n)"
if ($setApiKey -eq 'y') {
    $apiKey = "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"
    
    Write-Host "`n   Running: supabase secrets set OPENAI_API_KEY=...`n" -ForegroundColor Gray
    supabase secrets set "OPENAI_API_KEY=$apiKey"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ API key set successfully`n" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Failed to set API key. Set manually in Supabase Dashboard:`n" -ForegroundColor Red
        Write-Host "   1. Go to Project Settings > Edge Functions" -ForegroundColor Gray
        Write-Host "   2. Add secret: OPENAI_API_KEY = $apiKey`n" -ForegroundColor Gray
    }
} else {
    Write-Host "`n   ⏭️  Skipped. Set manually in Supabase Dashboard.`n" -ForegroundColor Gray
}

# Step 3: Deploy Edge Function
Write-Host "🚀 Step 3: Deploying Edge Function..." -ForegroundColor Yellow
Write-Host "   Function: process-property-document-simple`n"

$deployFunction = Read-Host "Deploy function now? (y/n)"
if ($deployFunction -eq 'y') {
    Write-Host "`n   Running: supabase functions deploy process-property-document-simple`n" -ForegroundColor Gray
    supabase functions deploy process-property-document-simple
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Edge Function deployed successfully`n" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Deployment failed. Check Supabase CLI setup.`n" -ForegroundColor Red
    }
} else {
    Write-Host "`n   ⏭️  Skipped. Deploy manually: supabase functions deploy process-property-document-simple`n" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "📋 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "="*60 + "`n" -ForegroundColor Cyan

Write-Host "✅ Changes Applied:" -ForegroundColor Green
Write-Host "   • Migrated from Gemini (768D) to OpenAI (1536D)"
Write-Host "   • Updated Edge Function API endpoint"
Write-Host "   • Database schema updated for 1536 dimensions"
Write-Host "   • Test embeddings cleared"
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test document processing (see OPENAI_MIGRATION_DEPLOYMENT.md)"
Write-Host "   2. Run browser script: process_document_now.js"
Write-Host "   3. Verify embeddings in database"
Write-Host "   4. Deploy ai-property-assistant function"
Write-Host "   5. Test chat interface"
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Full guide: OPENAI_MIGRATION_DEPLOYMENT.md"
Write-Host "   • Test script: process_document_now.js"
Write-Host ""

Write-Host "🎉 Migration complete! Ready to process documents with OpenAI.`n" -ForegroundColor Green
