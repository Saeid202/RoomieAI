# Open Graph Meta Tags Implementation

## Problem
When sharing property links on social media platforms (Telegram, Facebook, etc.), the preview showed the old landing page instead of property-specific information.

## Root Cause
Meta tags were hardcoded in `index.html` and didn't change based on the current route. Social media crawlers fetch the page and read these static tags, so they always saw the generic landing page preview.

## Solution
Implemented dynamic Open Graph meta tag management that updates based on the current property being viewed.

## Files Created

### 1. `src/services/ogMetaService.ts`
A utility service that manages Open Graph meta tags dynamically:

**Key Functions:**
- `updateOGMetaTags(tags)` - Updates OG, Twitter, and standard meta tags
- `resetOGMetaTags()` - Resets to default landing page tags
- `generatePropertyOGTags(property)` - Generates OG tags for HomieAI properties
- `generateMLSPropertyOGTags(listing)` - Generates OG tags for MLS listings

**Meta Tags Updated:**
- `og:title` - Property title with specs and price
- `og:description` - Property description (truncated to 155 chars)
- `og:image` - First property image or fallback
- `og:url` - Full URL to the property page
- `twitter:title`, `twitter:description`, `twitter:image` - Twitter Card tags
- `description` - Standard meta description

## Files Modified

### 1. `src/pages/dashboard/PropertyDetails.tsx`
- Added import for OG meta service
- Updated SEO useEffect to call `updateOGMetaTags()` when property/MLS listing loads
- Added cleanup useEffect to reset OG tags when component unmounts
- Now handles both HomieAI properties and MLS listings

### 2. `index.html`
- Updated brand name from "RoomieAI" to "HomieAI" (consistency)
- Updated URLs from roomieai.ca to homieai.ca
- Kept default landing page OG tags as fallback

## How It Works

1. **User visits property page** → PropertyDetails component mounts
2. **Property data loads** → SEO useEffect triggers
3. **OG tags generated** → `generatePropertyOGTags()` creates tags with property info
4. **Meta tags updated** → `updateOGMetaTags()` updates all OG/Twitter tags in DOM
5. **Social media crawler fetches page** → Sees property-specific OG tags
6. **Preview shows property info** → Title, description, image, price, specs

## Example Preview

When sharing a property link on Telegram/Facebook:

**Before:**
- Title: "HomieAI - Smart Roommate & Co-Buying Platform"
- Description: Generic landing page description
- Image: Generic landing page image

**After:**
- Title: "Beautiful 2BR Apartment - 2BR • 1BA $1,500"
- Description: "Spacious 2-bedroom apartment in downtown Toronto with modern amenities..."
- Image: First property photo

## Testing

To test the implementation:

1. Visit a property detail page: `/dashboard/rental-options/{property-id}`
2. Open browser DevTools → Elements tab
3. Search for `<meta property="og:title">`
4. Verify it shows property-specific information
5. Share the link on social media to see the preview

## Technical Details

- **Client-side implementation** - Meta tags updated in browser DOM
- **Automatic cleanup** - Tags reset to landing page defaults when leaving property page
- **MLS support** - Works with both HomieAI and MLS listings
- **Fallback handling** - Uses placeholder image if property has no images
- **URL generation** - Correctly routes to buy or rental-options based on property type

## Future Enhancements

- Add Open Graph image generation service for dynamic property cards
- Implement server-side rendering for better crawler support
- Add structured data (Schema.org) for rich snippets
- Track social media shares analytics
