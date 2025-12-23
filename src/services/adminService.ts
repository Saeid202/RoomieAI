import { supabase } from '@/integrations/supabase/client';

interface AdminCheckResult {
  isAdmin: boolean;
  checkedAt: number;
}

// Cache admin status for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const adminCache = new Map<string, AdminCheckResult>();

/**
 * Check if a user has admin role in the database
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    // Check cache first
    const cached = adminCache.get(userId);
    if (cached && Date.now() - cached.checkedAt < CACHE_DURATION) {
      return cached.isAdmin;
    }

    // Query the user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    const isAdmin = !!data;

    // Cache the result
    adminCache.set(userId, {
      isAdmin,
      checkedAt: Date.now()
    });

    return isAdmin;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}

/**
 * Verify current user has admin access
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    return await checkIsAdmin(user.id);
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}

/**
 * Clear admin cache for a specific user
 */
export function clearAdminCache(userId?: string) {
  if (userId) {
    adminCache.delete(userId);
  } else {
    adminCache.clear();
  }
}

/**
 * Get list of available roles for a user
 */
export async function getAvailableRoles(userId: string): Promise<string[]> {
  const baseRoles = ['seeker', 'landlord', 'renovator'];

  const isAdmin = await checkIsAdmin(userId);
  if (isAdmin) {
    return [...baseRoles, 'admin'];
  }

  return baseRoles;
}
