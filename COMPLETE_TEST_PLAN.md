# Complete Test Plan for Document Access Requests

## Prerequisites
1. You need TWO user accounts:
   - **Seller Account**: Has properties listed for sale
   - **Buyer Account**: Different user who will request access

2. At least one property with:
   - `listing_category = 'sale'`
   - Some documents uploaded

## Test Flow

### Part 1: As SELLER - Verify Sales Property Exists

1. Log in as the SELLER
2. Go to "My Properties" page
3. Verify you have at least one property with "For Sale" badge
4. Note the property address/title

### Part 2: As BUYER - Request Document Access

1. **Log OUT from seller account**
2. **Log IN as BUYER** (different user)
3. Go to "Buying Opportunities" → "Buy Unit" tab
4. Find the sales listing
5. Click on it to view details
6. Scroll to "Property Documents" section
7. You should see:
   - List of documents with lock icons
   - "Request Full Document Access" button
   - Status badge showing "Access Required"

8. Click "Request Full Document Access"
9. Enter a message (optional): "I'm interested in purchasing this property"
10. Click "Send Request"

11. **Check Console** (F12 → Console tab):
   ```
   📤 Requesting document access for property: [property-id]
   👤 User profile: {full_name: "...", email: "..."}
   📝 Creating request with data: {...}
   ✅ Request created successfully: {...}
   ```

12. You should see:
   - Success toast: "Access request sent successfully!"
   - Status changes to "Request Pending"
   - Yellow badge with clock icon

### Part 3: As SELLER - Review Request

1. **Log OUT from buyer account**
2. **Log IN as SELLER** (property owner)
3. Go to "Applications" page
4. Click "Sales Inquiries" tab
5. **Check Console**:
   ```
   🔍 Loading document requests for user: [seller-id]
   📦 Sales properties found: [number]
   🔑 Property IDs to check: [array of IDs]
   📨 Document requests found: [number]
   ```

6. Scroll down to "Document Access Requests" section
7. You should see a card with:
   - Purple header with lock icon
   - "Document Access Request" title
   - Request date/time
   - Buyer's name and email
   - Property address
   - "Requested Access: All Property Documents"
   - Buyer's message (if provided)
   - Two buttons: "Approve" (green) and "Decline" (red)

### Part 4: As SELLER - Approve Request

1. Click "Approve" button
2. You should see:
   - Success toast: "Access granted successfully"
   - Card updates to show "Approved" badge (green)
   - Buttons disappear

### Part 5: As BUYER - Access Documents

1. **Log OUT from seller account**
2. **Log IN as BUYER**
3. Go back to the property details page
4. Scroll to "Property Documents" section
5. You should see:
   - Green "Access Granted" badge
   - "View All Documents" button (green)
6. Click "View All Documents"
7. Should navigate to document vault with full access

## Troubleshooting

### If Request Button Doesn't Appear
- Check console for errors
- Verify property has documents uploaded
- Verify you're logged in as a DIFFERENT user (not property owner)

### If Request Doesn't Show in Sales Inquiries
1. Check console logs (see Part 3, step 5)
2. If "Sales properties found: 0":
   - Property might not have `listing_category = 'sale'`
   - Run SQL: `UPDATE properties SET listing_category = 'sale' WHERE id = 'YOUR_PROPERTY_ID';`

3. If "Document requests found: 0":
   - Request might not have been created
   - Run SQL: `SELECT * FROM document_access_requests;`
   - Check if table is empty

4. If you see database errors:
   - Table might not exist
   - Run `create_document_access_requests_table.sql`

### If You See TypeScript Errors in Console
- These are expected and won't affect functionality
- To fix: Regenerate Supabase types (see DEBUG guide)

## SQL Verification Commands

### Check if request was created:
```sql
SELECT 
  dar.*,
  p.listing_title,
  p.address
FROM document_access_requests dar
JOIN properties p ON dar.property_id = p.id
ORDER BY dar.requested_at DESC;
```

### Check sales properties:
```sql
SELECT 
  id,
  listing_title,
  address,
  user_id,
  listing_category
FROM properties
WHERE listing_category = 'sale';
```

### Check RLS policies:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'document_access_requests';
```

## Expected Results

✅ Buyer can request access
✅ Request shows "Pending" status for buyer
✅ Request appears in seller's Sales Inquiries tab
✅ Seller can approve/deny request
✅ Approved status shows for buyer
✅ Buyer can access documents after approval

## If Still Not Working

Share these details:
1. Console logs from Part 2, step 11
2. Console logs from Part 3, step 5
3. Results from SQL verification commands
4. Screenshots of the Sales Inquiries tab
5. Any error messages
