import { useEffect, useState } from 'react';
import { getSiteSetting } from '@/services/siteSettingsService';

export function useHeroBanner() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [heroMode, setHeroMode] = useState<'default' | 'banner' | 'fullbanner'>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSiteSetting('hero_banner_url'),
      getSiteSetting('hero_mode'),
    ]).then(([url, mode]) => {
      setBannerUrl(url);
      setHeroMode((mode as 'default' | 'banner') || 'default');
    }).finally(() => setLoading(false));
  }, []);

  return { bannerUrl, heroMode, loading };
}

export type HeroMode = 'default' | 'banner' | 'fullbanner';
