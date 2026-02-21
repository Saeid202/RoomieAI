# How to Test Document Access Requests

## Current Status: ✅ System is Working!

Your console shows:
- ✅ Sales property found: `3b80948d-74ca-494c-9c4b-9e012fb00add`
- ✅ Query executed successfully
- ℹ️ 0 requests found (because none have been created yet)

## The system is working correctly - you just need to create a request!

## Option 1: Test with UI (Recommended)

### Step 1: Create a Second User Account
You need TWO accounts to test:
1. **Seller** (you - the property owner)
2. **Buyer** (a different user who will request access)

If you don't have a second account:
- Open an incognito/private browser window
- Go to your app
- Sign up with a different email
- This will be your "buyer" account

### Step 2: As BUYER - Request Access
1. Stay logged in as the BUYER (in incognito window)
2. Go to "Buying Opportunities" → "Buy Unit"
3. Find your sales listing
4. Click to view details
5. Scroll to "Property Documents" section
6. Click "Request Full Document Access"
7. Add a message: "I'm interested in purchasing"
8. Click "Send Request"
9. You should see: "Access request sent successfully!"

### Step 3: As SELLER - View Request
1. Go back to your main browser (logged in as seller)
2. Go to "Applications" → "Sales Inquiries" tab
3. Scroll down to "Document Access Requests"
4. You should now see the request!

## Option 2: Create Test Request via SQL

If you can't create a second account, you can manually insert a test request:

### Step 1: Get a User ID
Run this in Supabase SQL Editor:
```sql
-- Get any user ID (can be your own for testing)
SELECT id, email FROM auth.users LIMIT 5;
```

### Step 2: Insert Test Request
Replace `YOUR_USER_ID` with an ID from step 1:
```sql
INSERT INTO document_access_requests (
  property_id,
  requester_id,
  requester_name,
  requester_email,
  request_message,
  status
) VALUES (
  '3b80948d-74ca-494c-9c4b-9e012fb00add',
  'YOUR_USER_ID',
  'Test Buyer',
  'testbuyer@example.com',
  'I am interested in this property',
  'pending'
);
```

### Step 3: Refresh and Check
1. Go to "Applications" → "Sales Inquiries"
2. The request should now appear!

## Verify It's Working

Run this SQL to see all requests:
```sql
SELECT 
  dar.id,
  dar.requester_name,
  dar.requester_email,
  dar.status,
  dar.requested_at,
  p.listing_title,
  p.address
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC;
```

## Why You See "0 requests"

The system is checking the database correctly, but there are simply no requests yet because:
1. No buyer has clicked "Request Full Document Access" yet
2. No test data has been inserted

This is NORMAL and EXPECTED for a new feature!

## Next Steps

Choose one:
- ✅ **Option 1**: Create a second user account and test the full flow (recommended)
- ✅ **Option 2**: Insert a test request via SQL to see how it looks

Both will work! The system is ready and waiting for requests.
