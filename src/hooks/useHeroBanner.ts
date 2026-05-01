import { useEffect, useState, useTransition } from 'react';
import { getSiteSetting } from '@/services/siteSettingsService';

export type HeroMode = 'default' | 'banner' | 'fullbanner';

export function useHeroBanner() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [heroMode, setHeroMode] = useState<HeroMode>('default');
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSiteSetting('hero_banner_url'),
      getSiteSetting('hero_mode'),
    ]).then(([url, mode]) => {
      if (!cancelled) {
        startTransition(() => {
          setBannerUrl(url);
          setHeroMode((mode as HeroMode) || 'default');
          setLoading(false);
        });
      }
    }).catch(() => {
      if (!cancelled) startTransition(() => setLoading(false));
    });
    return () => { cancelled = true; };
  }, []);

  return { bannerUrl, heroMode, loading };
}
