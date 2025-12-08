# Deploy DeepSeek Chat Edge Function to Supabase

# Make sure you have Supabase CLI installed
# Install: npm install -g supabase

# Login to Supabase (if not already logged in)
# supabase login

# Link to your project
# supabase link --project-ref bjesofgfbuyzjamyliys

# Set the DeepSeek API key as a secret
supabase secrets set DEEPSEEK_API_KEY=sk-2531714d05d94a16a216aa80c984b41d

# Deploy the function
supabase functions deploy deepseek-chat

Write-Host "Edge function deployed successfully!"
Write-Host "Function URL: https://bjesofgfbuyzjamyliys.supabase.co/functions/v1/deepseek-chat"
