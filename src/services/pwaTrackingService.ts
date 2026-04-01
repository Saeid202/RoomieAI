import { supabase } from '@/lib/supabase';

interface PWAInstallationData {
  userId?: string;
  deviceType?: string;
  browser?: string;
  platform?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'mobile';
  }
  if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Detect browser from user agent
 */
function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
    return 'Chrome';
  }
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    return 'Safari';
  }
  if (/firefox/i.test(userAgent)) {
    return 'Firefox';
  }
  if (/edge/i.test(userAgent)) {
    return 'Edge';
  }
  if (/opera|opr/i.test(userAgent)) {
    return 'Opera';
  }
  return 'Unknown';
}

/**
 * Detect platform from user agent
 */
function detectPlatform(userAgent: string): string {
  if (/windows/i.test(userAgent)) {
    return 'Windows';
  }
  if (/mac/i.test(userAgent)) {
    return 'macOS';
  }
  if (/linux/i.test(userAgent)) {
    return 'Linux';
  }
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return 'iOS';
  }
  return 'Unknown';
}

/**
 * Get user's IP address (best effort)
 */
async function getUserIpAddress(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return undefined;
  }
}

/**
 * Log PWA installation
 */
export async function logPWAInstallation(data?: PWAInstallationData) {
  try {
    const userAgent = navigator.userAgent;
    const ipAddress = await getUserIpAddress();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No authenticated user found for PWA installation tracking');
      return;
    }

    const installationData = {
      user_id: user.id,
      device_type: data?.deviceType || detectDeviceType(userAgent),
      browser: data?.browser || detectBrowser(userAgent),
      platform: data?.platform || detectPlatform(userAgent),
      user_agent: userAgent,
      ip_address: data?.ipAddress || ipAddress,
    };

    const { error } = await supabase
      .from('pwa_installations')
      .insert([installationData]);

    if (error) {
      console.error('Failed to log PWA installation:', error);
    } else {
      console.log('PWA installation logged successfully');
    }
  } catch (error) {
    console.error('Error logging PWA installation:', error);
  }
}

/**
 * Get installation stats
 */
export async function getPWAInstallationStats() {
  try {
    const { data, error } = await supabase
      .from('pwa_installations')
      .select('*')
      .order('installed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch installation stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching installation stats:', error);
    return null;
  }
}

/**
 * Get installation stats by platform
 */
export async function getPWAInstallationStatsByPlatform() {
  try {
    const { data, error } = await supabase
      .from('pwa_installations')
      .select('platform, count(*) as count', { count: 'exact' })
      .group_by('platform');

    if (error) {
      console.error('Failed to fetch platform stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return null;
  }
}

/**
 * Get total installation count
 */
export async function getTotalPWAInstallations() {
  try {
    const { count, error } = await supabase
      .from('pwa_installations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Failed to fetch total installations:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching total installations:', error);
    return 0;
  }
}
