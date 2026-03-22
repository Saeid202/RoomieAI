// Vercel Serverless Function: /api/og
// Handles social media crawler requests for property pages.
// Fetches property data from Supabase and returns HTML with injected OG meta tags.
//
// Usage: Vercel rewrites crawler requests on property routes to this function.
// Regular users get the normal SPA (index.html).

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://bjesofgfbuyzjamyliys.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZXNvZmdmYnV5emphbXlsaXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDcxOTcsImV4cCI6MjA2Nzc4MzE5N30.V0RSLBpoCehRW_CjIwfOmIm0iJio3Y2auDBoFyjUfOs';

const SITE_URL = 'https://www.homieai.ca';

const CRAWLER_UA = [
  'telegrambot', 'twitterbot', 'facebookexternalhit', 'linkedinbot',
  'whatsapp', 'slackbot', 'discordbot', 'googlebot', 'bingbot',
  'applebot', 'iframely', 'embedly', 'pinterest', 'vkshare',
];

const DEFAULT = {
  title: 'HomieAI - Smart Roommate & Co-Buying Platform for Canada',
  description:
    'Find your perfect roommate or co-buy investment partner. AI-powered matching, verified profiles, and seamless communication for renters, landlords, and investors.',
  image: `${SITE_URL}/api/og-image`,
};

function isCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return CRAWLER_UA.some((bot) => lower.includes(bot));
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchProperty(id: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/properties?id=eq.${id}&select=listing_title,description,images,monthly_rent,bedrooms,bathrooms,city,state,listing_category&limit=1`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  if (!res.ok) return null;
  const data: any[] = await res.json();
  return data?.[0] ?? null;
}

function buildHtml(og: { title: string; description: string; image: string; url: string }, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${esc(og.title)}</title>
  <meta name="description" content="${esc(og.description)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${esc(og.url)}"/>
  <meta property="og:title" content="${esc(og.title)}"/>
  <meta property="og:description" content="${esc(og.description)}"/>
  <meta property="og:image" content="${esc(og.image)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:site_name" content="HomieAI"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(og.title)}"/>
  <meta name="twitter:description" content="${esc(og.description)}"/>
  <meta name="twitter:image" content="${esc(og.image)}"/>
  <meta http-equiv="refresh" content="0;url=${esc(appUrl)}"/>
</head>
<body><p>Redirecting... <a href="${esc(appUrl)}">Click here</a></p></body>
</html>`;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent') || '';
  const pathname = url.searchParams.get('path') || '';
  const origin = url.searchParams.get('origin') || SITE_URL;

  // If not a crawler, serve the SPA index.html directly (no redirect needed)
  if (!isCrawler(ua)) {
    const spaRes = await fetch(`${origin}/index.html`);
    const html = await spaRes.text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Parse property ID from path: /dashboard/rental-options/:id or /dashboard/buy/:id
  const rentalMatch = pathname.match(/^\/dashboard\/rental-options\/([^/]+)$/);
  const buyMatch = pathname.match(/^\/dashboard\/buy\/([^/]+)$/);
  const match = rentalMatch || buyMatch;

  let og = { ...DEFAULT, url: `${origin}${pathname}` };

  if (match) {
    const id = match[1];
    const isMLS = id.startsWith('mls-');

    if (!isMLS) {
      try {
        const property = await fetchProperty(id);
        if (property) {
          const isSale = property.listing_category === 'sale' || property.listing_category === 'co-ownership';
          const price = isSale ? property.sales_price : property.monthly_rent;
          const priceText = price ? `$${Number(price).toLocaleString()}` : '';
          const specs = [
            property.bedrooms ? `${property.bedrooms}BR` : '',
            property.bathrooms ? `${property.bathrooms}BA` : '',
          ].filter(Boolean).join(' • ');

          og.title = `${property.listing_title || 'Property'} — ${[specs, priceText].filter(Boolean).join(' ')}`.trim();
          og.description = (
            property.description ||
            `${property.listing_title || 'Property'} in ${property.city || ''} ${property.state || ''}`
          ).slice(0, 155);
          og.image = property.images?.[0] || DEFAULT.image;
        }
      } catch {
        // fallback to defaults
      }
    }
  }

  return new Response(buildHtml(og, `${origin}${pathname}`), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}
