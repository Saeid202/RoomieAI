#!/bin/bash

# =====================================================
# Deploy AI Property Assistant with Gemini API
# =====================================================

echo "🚀 Deploying AI Property Assistant..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Set Gemini API Key in Supabase
echo -e "${BLUE}Step 1: Setting Gemini API Key in Supabase...${NC}"
supabase secrets set GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API key set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set API key${NC}"
    exit 1
fi

echo ""

# Step 2: Run Database Migration
echo -e "${BLUE}Step 2: Running database migration...${NC}"
supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration completed${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi

echo ""

# Step 3: Deploy Edge Functions
echo -e "${BLUE}Step 3: Deploying Edge Functions...${NC}"

echo "  📦 Deploying process-property-document..."
supabase functions deploy process-property-document

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ process-property-document deployed${NC}"
else
    echo -e "${RED}  ❌ Failed to deploy process-property-document${NC}"
    exit 1
fi

echo ""
echo "  📦 Deploying ai-property-assistant..."
supabase functions deploy ai-property-assistant

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ ai-property-assistant deployed${NC}"
else
    echo -e "${RED}  ❌ Failed to deploy ai-property-assistant${NC}"
    exit 1
fi

echo ""

# Step 4: Verify Deployment
echo -e "${BLUE}Step 4: Verifying deployment...${NC}"
supabase secrets list

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Upload a property document"
echo "2. Wait 1-2 minutes for processing"
echo "3. Ask the AI a question"
echo "4. Monitor usage at: https://aistudio.google.com"
echo ""
echo -e "${BLUE}Free Tier Limits:${NC}"
echo "  • 15 requests per minute"
echo "  • 1,500 requests per day"
echo "  • 1,000,000 tokens per day"
echo ""
echo -e "${GREEN}Cost: $0.00 (Free Forever!)${NC}"
