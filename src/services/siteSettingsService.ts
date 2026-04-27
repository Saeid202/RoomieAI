import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

/**
 * Get a site setting value by key.
 */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await db
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Set a site setting value (admin only — enforce via RLS).
 */
export async function setSiteSetting(key: string, value: string | null): Promise<void> {
  const { error } = await db
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(`Failed to update site setting: ${error.message}`);
}

/**
 * Upload a hero banner image to Supabase Storage and save the public URL.
 * Returns the public URL.
 */
export async function uploadHeroBanner(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `hero/banner-${Date.now()}.${ext}`;

  const { error: uploadError } = await (supabase.storage as any)
    .from('site-assets')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data } = (supabase.storage as any)
    .from('site-assets')
    .getPublicUrl(fileName);

  const publicUrl: string = data.publicUrl;
  await setSiteSetting('hero_banner_url', publicUrl);
  return publicUrl;
}

/**
 * Remove the hero banner (clears the URL in site_settings).
 */
export async function removeHeroBanner(): Promise<void> {
  await setSiteSetting('hero_banner_url', null);
}
