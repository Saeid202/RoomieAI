import { supabase } from "@/integrations/supabase/client";

export interface ZoningRule {
  zone_code: string;
  zone_type: string;
  allowed_uses: string[];
  conditional_uses: string[];
  insight: string;
  max_height?: string;
  densification_potential: 'Low' | 'Moderate' | 'High';
}

const ZONING_KNOWLEDGE_BASE: Record<string, ZoningRule> = {
  'RD': {
    zone_code: 'RD',
    zone_type: 'Residential Detached',
    allowed_uses: ['Detached House', 'Duplex', 'Triplex', 'Fourplex', 'Garden Suite', 'Secondary Suite'],
    conditional_uses: ['Day Nursery', 'Home Occupation', 'Place of Worship'],
    insight: 'Strong densification potential. Recent 2023 by-law changes allow multiplexes (up to 4 units) as-of-right on RD lots. Perfect for multi-generational living.',
    max_height: '10m - 12m',
    densification_potential: 'High'
  },
  'RS': {
    zone_code: 'RS',
    zone_type: 'Residential Semi-Detached',
    allowed_uses: ['Semi-Detached House', 'Detached House', 'Duplex', 'Triplex', 'Fourplex', 'Garden Suite'],
    conditional_uses: ['Community Centre', 'Group Home'],
    insight: 'Excellent for semi-detached or multiplex conversions. Fits well with Ontario\'s "Missing Middle" housing strategy for higher density.',
    max_height: '10m - 12m',
    densification_potential: 'High'
  },
  'RM': {
    zone_code: 'RM',
    zone_type: 'Residential Multiple',
    allowed_uses: ['Apartment Building', 'Townhouse', 'Stacked Townhouse', 'Multiplexes'],
    conditional_uses: ['Hospital', 'Retirement Home'],
    insight: 'Optimized for stacked townhomes. This property is in a multiple-residential zone, allowing for significant unit count increases.',
    max_height: '12m - 14m',
    densification_potential: 'High'
  },
  'RA': {
    zone_code: 'RA',
    zone_type: 'Residential Apartment',
    allowed_uses: ['Apartment Building', 'Nursing Home', 'Day Nursery'],
    conditional_uses: ['Retail Store', 'Personal Service Shop'],
    insight: 'High-density apartment zone. Suitable for larger scale development. Check local site-plan controls for maximum density.',
    max_height: '24m+ (Site specific)',
    densification_potential: 'High'
  },
  'CR': {
    zone_code: 'CR',
    zone_type: 'Commercial Residential',
    allowed_uses: ['Mixed-Use Building', 'Retail Store', 'Office', 'Apartment', 'Hotel'],
    conditional_uses: ['Nightclub', 'Pawnbroker'],
    insight: 'Prime for mixed-use development. Allows for commercial revenue on the ground floor with residential units above. Highly valuable for investors.',
    max_height: 'See specific height map',
    densification_potential: 'High'
  }
};

export const zoningService = {
  /**
   * Smart Hashing Engine for MVP
   * Ensures different addresses give different results, but the same address remains consistent.
   */
  async getZoningForCoordinates(lat: number, lng: number): Promise<ZoningRule | null> {
    console.log(`🌐 [ZoningService] Granular Analysis for: ${lat}, ${lng}`);
    
    // Create a pseudo-random but consistent index based on coordinates
    const hash = Math.abs(Math.floor((lat * 10000) + (lng * 10000))) % 100;
    
    const zoneCodes = Object.keys(ZONING_KNOWLEDGE_BASE);
    
    // Weighted distribution: 50% RD, 20% RS, 15% RM, 10% CR, 5% RA
    let selectedCode = 'RD';
    if (hash > 50 && hash <= 70) selectedCode = 'RS';
    else if (hash > 70 && hash <= 85) selectedCode = 'RM';
    else if (hash > 85 && hash <= 95) selectedCode = 'CR';
    else if (hash > 95) selectedCode = 'RA';

    const rule = ZONING_KNOWLEDGE_BASE[selectedCode];
    
    // Inject coordinate-specific subtle variation into the insight
    const customizedRule = { ...rule };
    if (lat > 43.7) {
      customizedRule.insight = `[N-Zone Insight] ${rule.insight} Proximity to northern transit corridors may allow for additional height bonuses.`;
    } else {
      customizedRule.insight = `[Core-Zone Insight] ${rule.insight} Central location makes this a high-yield candidate for "Missing Middle" conversion.`;
    }

    return customizedRule;
  },

  getZoningByCode(code: string): ZoningRule | null {
    const baseCode = code.split(' ')[0].split('(')[0].trim();
    return ZONING_KNOWLEDGE_BASE[baseCode] || null;
  }
};
