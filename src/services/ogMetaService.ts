/**
 * Open Graph Meta Tag Service
 * Manages dynamic meta tags for social media sharing
 */

export interface OGMetaTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}

export const updateOGMetaTags = (tags: OGMetaTags) => {
  // Update Open Graph tags
  updateMetaTag('property', 'og:title', tags.title);
  updateMetaTag('property', 'og:description', tags.description);
  updateMetaTag('property', 'og:image', tags.image);
  updateMetaTag('property', 'og:url', tags.url);
  updateMetaTag('property', 'og:type', tags.type || 'website');

  // Update Twitter Card tags
  updateMetaTag('name', 'twitter:title', tags.title);
  updateMetaTag('name', 'twitter:description', tags.description);
  updateMetaTag('name', 'twitter:image', tags.image);
  updateMetaTag('name', 'twitter:card', 'summary_large_image');

  // Update standard meta tags
  updateMetaTag('name', 'description', tags.description);

  // Update page title
  document.title = tags.title;
};

export const resetOGMetaTags = () => {
  // Reset to default landing page tags
  updateOGMetaTags({
    title: 'HomieAI - Smart Roommate & Co-Buying Platform for Canada',
    description: 'Find your perfect roommate or co-buy investment partner. AI-powered matching, verified profiles, and seamless communication for renters, landlords, and investors.',
    image: 'https://www.homieai.ca/og.png',
    url: 'https://www.homieai.ca/',
    type: 'website',
  });
};

const updateMetaTag = (attrName: 'property' | 'name', attrValue: string, content: string) => {
  const selector = `meta[${attrName}="${attrValue}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', content);
};

export const generatePropertyOGTags = (property: {
  listing_title?: string;
  description?: string;
  images?: string[];
  monthly_rent?: number;
  sales_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  address?: string;
  id: string;
}): OGMetaTags => {
  const isSale = !!(property as any).sales_price;
  const price = isSale ? (property as any).sales_price : property.monthly_rent;
  const priceText = price ? `$${price.toLocaleString()}` : '';
  const bedsText = property.bedrooms ? `${property.bedrooms}BR` : '';
  const bathsText = property.bathrooms ? `${property.bathrooms}BA` : '';
  const specs = [bedsText, bathsText].filter(Boolean).join(' • ');

  const title = `${property.listing_title || 'Property'} - ${specs} ${priceText}`.trim();
  const description = property.description?.slice(0, 155) || `${property.listing_title || 'Property'} in ${property.city || property.state || ''}`;
  const image = property.images?.[0] || 'https://www.homieai.ca/og.png';
  const url = `${window.location.origin}/dashboard/${isSale ? 'buy' : 'rental-options'}/${property.id}`;

  return {
    title,
    description,
    image,
    url,
    type: 'website',
  };
};

export const generateMLSPropertyOGTags = (listing: {
  address?: string;
  description?: string;
  images?: string[];
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  province?: string;
  mlsNumber?: string;
}): OGMetaTags => {
  const priceText = listing.price ? `$${listing.price.toLocaleString()}` : '';
  const bedsText = listing.bedrooms ? `${listing.bedrooms}BR` : '';
  const bathsText = listing.bathrooms ? `${listing.bathrooms}BA` : '';
  const specs = [bedsText, bathsText].filter(Boolean).join(' • ');

  const title = `${listing.address || 'Property'} - ${specs} ${priceText}`.trim();
  const description = listing.description?.slice(0, 155) || `${listing.address || 'Property'} in ${listing.city || listing.province || ''}`;
  const image = listing.images?.[0] || 'https://www.homieai.ca/og.png';
  const url = `${window.location.origin}/dashboard/rental-options/mls-${listing.mlsNumber || ''}`;

  return {
    title,
    description,
    image,
    url,
    type: 'website',
  };
};
