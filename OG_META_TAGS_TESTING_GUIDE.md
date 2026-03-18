# Open Graph Meta Tags - Testing Guide

## Quick Test in Browser DevTools

1. **Navigate to a property page**
   - Go to: `/dashboard/rental-options/{property-id}`
   - Or: `/dashboard/buy/{property-id}` for sale properties

2. **Open DevTools (F12)**
   - Go to Elements/Inspector tab
   - Press Ctrl+F (or Cmd+F on Mac)

3. **Search for OG tags**
   - Search for: `og:title`
   - You should see: `<meta property="og:title" content="[Property Title] - [Specs] $[Price]">`

4. **Verify all tags are updated**
   - `og:title` - Should show property title with specs and price
   - `og:description` - Should show property description
   - `og:image` - Should show first property image URL
   - `og:url` - Should show full property page URL
   - `twitter:title` - Should match og:title
   - `twitter:description` - Should match og:description
   - `twitter:image` - Should match og:image

## Test on Social Media

### Telegram
1. Copy property link
2. Paste in Telegram chat
3. Wait for preview to load
4. Should show property title, description, and image

### Facebook
1. Go to: https://developers.facebook.com/tools/debug/
2. Paste property URL
3. Click "Scrape Again"
4. Should show property-specific preview

### Twitter/X
1. Go to: https://cards-dev.twitter.com/validator
2. Paste property URL
3. Should show property title, description, and image

### LinkedIn
1. Paste property link in post
2. Should show property preview with image

## Test Landing Page (Default Tags)

1. **Navigate to home page**
   - Go to: `/`

2. **Check DevTools**
   - Search for `og:title`
   - Should show: "HomieAI - Smart Roommate & Co-Buying Platform for Canada"

3. **Navigate away from property page**
   - Go to any other page
   - Then go back to home
   - OG tags should reset to landing page defaults

## Test MLS Listings

1. **Navigate to MLS property**
   - Go to: `/dashboard/rental-options/mls-{mlsNumber}`

2. **Check DevTools**
   - `og:title` should show MLS address with specs and price
   - `og:image` should show MLS listing image

## Expected Behavior

### When Loading Property Page
- ✅ OG tags update immediately when property data loads
- ✅ Page title updates to property title
- ✅ Meta description updates to property description
- ✅ Social media preview shows property info

### When Leaving Property Page
- ✅ OG tags reset to landing page defaults
- ✅ Page title resets to "HomieAI - ..."
- ✅ Meta description resets to landing page description

### For Properties Without Images
- ✅ Falls back to: `https://www.homieai.ca/og.png`
- ✅ Still shows property title and description

### For Properties Without Description
- ✅ Falls back to: "[Property Title] in [City], [State]"
- ✅ Still shows property title and price

## Troubleshooting

### OG tags not updating?
1. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Verify property data is loading correctly

### Social media preview not showing?
1. Wait 24-48 hours for social media cache to clear
2. Use platform's debug tool to force refresh
3. Verify OG tags are correct in DevTools first

### Wrong image showing?
1. Check if property has images in database
2. Verify first image URL is valid
3. Check if image is accessible from public internet

## Performance Notes

- Meta tag updates happen client-side (no server calls)
- Updates are instant when property data loads
- No performance impact on page load
- Cleanup happens automatically on unmount
