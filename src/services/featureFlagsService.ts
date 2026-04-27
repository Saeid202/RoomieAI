import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

export type FeatureFlag = 'community_enabled';

/**
 * Get a feature flag value from the database.
 * Falls back to `defaultValue` if the flag doesn't exist yet.
 */
export async function getFeatureFlag(flag: FeatureFlag, defaultValue = true): Promise<boolean> {
  try {
    const { data, error } = await db
      .from('feature_flags')
      .select('value')
      .eq('key', flag)
      .maybeSingle();

    if (error || !data) return defaultValue;
    return data.value === true || data.value === 'true';
  } catch {
    return defaultValue;
  }
}

/**
 * Set a feature flag value (admin only — enforce via RLS on the table).
 */
export async function setFeatureFlag(flag: FeatureFlag, value: boolean): Promise<void> {
  const { error } = await db
    .from('feature_flags')
    .upsert({ key: flag, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) {
    throw new Error(`Failed to update feature flag: ${error.message}`);
  }
}
