// Vercel Serverless Function: /api/og-image
// Generates dynamic OG image for social media previews
// Returns SVG as PNG-compatible image

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const title = url.searchParams.get('title') || 'HomieAI - Smart Roommate & Co-Buying Platform';
  const description = url.searchParams.get('description') || 'Find your perfect roommate or co-buy investment partner';

  // Generate SVG OG image
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="1100" cy="530" r="120" fill="rgba(255,255,255,0.1)"/>
      <circle cx="600" cy="315" r="150" fill="rgba(255,255,255,0.05)"/>
      
      <!-- Logo/Icon -->
      <g transform="translate(100, 80)">
        <rect width="60" height="60" rx="12" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2"/>
        <text x="30" y="40" font-size="32" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">🏠</text>
      </g>
      
      <!-- Main Title -->
      <text x="600" y="180" font-size="56" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif" dominant-baseline="middle">
        HomieAI
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="240" font-size="28" fill="rgba(255,255,255,0.95)" text-anchor="middle" font-family="Arial, sans-serif" dominant-baseline="middle">
        Smart Roommate & Co-Buying Platform
      </text>
      
      <!-- Description -->
      <text x="600" y="320" font-size="18" fill="rgba(255,255,255,0.85)" text-anchor="middle" font-family="Arial, sans-serif" dominant-baseline="middle" max-width="1000">
        Find your perfect roommate or co-buy investment partner
      </text>
      
      <!-- Features -->
      <g transform="translate(150, 400)">
        <text x="0" y="0" font-size="16" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-weight="bold">✓ AI-Powered Matching</text>
        <text x="350" y="0" font-size="16" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-weight="bold">✓ Verified Profiles</text>
        <text x="700" y="0" font-size="16" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-weight="bold">✓ Secure Communication</text>
      </g>
      
      <!-- URL/Domain -->
      <text x="600" y="580" font-size="20" fill="rgba(255,255,255,0.8)" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">
        homieai.ca
      </text>
      
      <!-- Accent bar -->
      <rect x="0" y="620" width="1200" height="10" fill="url(#accentGradient)"/>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
