import { useEffect, useState } from 'react';
import { getFeatureFlag, type FeatureFlag } from '@/services/featureFlagsService';

/**
 * Hook to read a feature flag. Returns `defaultValue` while loading.
 */
export function useFeatureFlag(flag: FeatureFlag, defaultValue = true): boolean {
  const [enabled, setEnabled] = useState(defaultValue);

  useEffect(() => {
    getFeatureFlag(flag, defaultValue).then(setEnabled);
  }, [flag, defaultValue]);

  return enabled;
}
