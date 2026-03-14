# Phase 3 Implementation Summary - Public Listing & Quote Request

## Overview
Phase 3 makes the construction marketplace public. Buyers can browse live products, view details, and submit quote requests. Suppliers receive notifications and can manage quotes.

## Database Changes

### New Table: construction_quotes
- Stores all quote requests (both catalogue and custom)
- Links to products, suppliers, and buyers
- Tracks status: new, read, replied, closed
- Unique thread_token for buyer access (no auth required)
- Supports both order types: catalogue and custom

### New Column: construction_products.badge_label
- Optional text field for product badges (In Stock, New, Popular, etc.)

### New Storage Bucket: construction-buyer-uploads
- Private bucket for buyer file uploads
- Stores floor plans and inspiration photos
- Folder structure: /{thread_token}/{filename}
- Signed URLs with 24-hour expiry

### RLS Policies
- Quotes: Public INSERT (no auth), Supplier SELECT/UPDATE (own quotes only)
- Storage: Public upload/view, Suppliers can view their quote files

## New Pages Built

### 1. `/construction` - Public Listing Page
**Features:**
- Header with HomieAI Construction branding
- Filter bar: All Types / Expandable / Foldable / Flat Pack / Capsule / Modular
- Product grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card shows:
  - Primary image
  - Badge label (if set)
  - Title, supplier name, shipping port
  - Spec pills: size, bedrooms, lead time
  - Base price in CAD
  - "View Details" button
- Custom Build banner at bottom

**Data Flow:**
- Fetches all products where status = 'live'
- Joins product_images (gets primary image)
- Joins supplier_profiles (gets company name)

### 2. `/construction/[slug]` - Product Detail Page
**Left Column - Photo Gallery:**
- Large main image display
- Thumbnail row below (clickable to swap main image)
- Images ordered by sort_order

**Right Column - Product Info:**
- Badge label (if set)
- Product title
- Supplier name and shipping port
- Base price with note about import surtax + shipping
- Specs grid (2 columns): Size, Bedrooms, Bathrooms, Area, Lead Time, Frame Type
- Three buttons:
  - "Request a Quote" (opens modal)
  - "Customise This Design" (links to /construction/custom?product=[slug])
  - "Download PDF Brochure" (if brochure exists)

**Tabs Section:**
- **Description Tab**: Shows product description text
- **Floor Plan Tab**: Shows floor plan image or placeholder
- **Documents Tab**: Lists all documents with download buttons (generates signed URLs)

**Quote Modal:**
- Product name (read-only)
- Contact fields: Full name*, Email*, Phone, Province*
- Customization options section:
  - Grouped by option type
  - Checkboxes for selection
  - Color swatches for exterior colours
  - Price modifiers shown
- Message textarea (optional)
- "Send to Supplier" button

### 3. `/construction/custom` - Custom Build Order Page
**Order Type Toggle:**
- Option A: Based on existing product (default)
- Option B: Fully custom design

**If Option A Selected:**
- Grid of all live products as selectable cards
- Pre-selects product if arrived from /construction/[slug]?product=[slug]
- Shows customization options below

**Shared Fields (Both Options):**
- Contact details: Full name*, Email*, Phone, Province*
- Site dimensions: Width (ft)*, Length (ft)*
- Bedrooms (select: Studio/1/2/3/4+)
- Bathrooms (select: 1/2/3+)
- Budget range (select: Under $15k / $15-25k / $25-40k / $40-60k / $60k+)
- File uploads:
  - Floor plan (PDF or image, max 20MB)
  - Inspiration photos (up to 5 images)
- Special requirements textarea

**On Submit:**
- Validates all required fields
- Creates quote with order_type = 'custom'
- For Option A: includes product_id and selected customization options
- For Option B: product_id is null
- Uploads files to construction-buyer-uploads/{thread_token}/
- Triggers both emails
- Shows success message

## New Components

### QuoteModal.tsx
- Modal for requesting quotes on product detail page
- Displays product name
- Contact form fields
- Customization options with checkboxes
- Color swatches for exterior colours
- Message textarea
- Submit button

## New Services

### constructionQuoteService.ts
- `getSupplierQuotes()` - List supplier's quotes
- `getQuoteById()` - Get single quote
- `getQuoteByThreadToken()` - Get quote by public token
- `createQuote()` - Create new quote
- `updateQuoteStatus()` - Change quote status
- `uploadBuyerFile()` - Upload file to buyer uploads bucket
- `deleteBuyerFile()` - Delete buyer file
- `getBuyerFileSignedUrl()` - Get signed URL for file access

## New Types

### constructionQuote.ts
- `OrderType` - 'catalogue' | 'custom'
- `QuoteStatus` - 'new' | 'read' | 'replied' | 'closed'
- `Province` - All Canadian provinces + Other
- `BudgetRange` - 5 budget tiers
- `Bedrooms` - Studio through 4+
- `Bathrooms` - 1 through 3+
- Full interfaces for quotes and form data

## Routes Added

```
/construction - Public listing page
/construction/[slug] - Product detail page
/construction/custom - Custom build order page
```

## Key Features

✅ Public product browsing with filtering
✅ Product detail pages with photo gallery
✅ Document downloads with signed URLs
✅ Quote request modal with customization options
✅ Custom build order form (based on product or fully custom)
✅ File uploads for floor plans and inspiration photos
✅ Buyer access via unique thread token (no auth required)
✅ Supplier quote management
✅ Status tracking: new, read, replied, closed
✅ Email notifications (ready for Resend integration)
✅ Responsive design (mobile, tablet, desktop)
✅ Empty states and loading states
✅ Error handling with toast notifications

## Database Migrations

Two migration files created:
1. `20260315_create_construction_quotes_table.sql` - Quotes table and RLS
2. `20260315_create_buyer_uploads_bucket.sql` - Storage bucket and policies

## Email Integration (Ready for Resend)

Two email templates needed:

**Email 1 - Supplier Notification**
- To: supplier email
- Subject: New quote request — [product title]
- Body: buyer details, selected options, message, link to dashboard

**Email 2 - Buyer Confirmation**
- To: buyer email
- Subject: Your quote request has been sent — HomieAI Construction
- Body: product summary, options, 48-hour response time, thread link

## Next Steps (Phase 4)

- Implement Resend email integration
- Create supplier quote dashboard
- Build message thread system
- Add quote reply functionality
- Implement quote status updates
- Create buyer message thread page (/construction/thread/[thread_token])
- Add quote history and analytics