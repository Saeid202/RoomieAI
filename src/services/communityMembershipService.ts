import { supabase } from "@/integrations/supabase/client";
import type { CommunityMembership, BanUserInput } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get membership status for the current user in a community
 */
export async function getMembership(communityId: string): Promise<CommunityMembership | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await db
    .from('community_memberships')
    .select('*')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error("Error fetching membership:", error);
    throw new Error(`Failed to fetch membership: ${error.message}`);
  }

  return data as CommunityMembership;
}

/**
 * Join a community
 */
export async function joinCommunity(communityId: string): Promise<CommunityMembership> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if banned
  const existing = await getMembership(communityId);
  if (existing?.status === 'banned') {
    throw new Error("You are banned from this community");
  }

  const { data, error } = await db
    .from('community_memberships')
    .insert({
      community_id: communityId,
      user_id: user.id,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining community:", error);
    throw new Error(`Failed to join community: ${error.message}`);
  }

  return data as CommunityMembership;
}

/**
 * Leave a community
 */
export async function leaveCommunity(communityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await db
    .from('community_memberships')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error leaving community:", error);
    throw new Error(`Failed to leave community: ${error.message}`);
  }
}

/**
 * Get all members of a community (admin)
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMembership[]> {
  const { data, error } = await db
    .from('community_memberships')
    .select('*')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error("Error fetching community members:", error);
    throw new Error(`Failed to fetch community members: ${error.message}`);
  }

  return (data as CommunityMembership[]) || [];
}

/**
 * Ban a user from a community (admin only)
 */
export async function banUser(input: BanUserInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Insert ban record
  const { error: banError } = await db
    .from('community_bans')
    .insert({
      user_id: input.user_id,
      community_id: input.community_id,
      reason: input.reason,
      moderator_id: user.id,
    });

  if (banError && banError.code !== '23505') {
    console.error("Error creating ban:", banError);
    throw new Error(`Failed to ban user: ${banError.message}`);
  }

  // Update membership status to banned
  const { error: membershipError } = await db
    .from('community_memberships')
    .update({ status: 'banned' })
    .eq('community_id', input.community_id)
    .eq('user_id', input.user_id);

  if (membershipError) {
    console.error("Error updating membership status:", membershipError);
    throw new Error(`Failed to update membership status: ${membershipError.message}`);
  }
}

/**
 * Unban a user from a community (admin only)
 */
export async function unbanUser(userId: string, communityId: string): Promise<void> {
  // Remove ban record
  const { error: banError } = await db
    .from('community_bans')
    .delete()
    .eq('user_id', userId)
    .eq('community_id', communityId);

  if (banError) {
    console.error("Error removing ban:", banError);
    throw new Error(`Failed to unban user: ${banError.message}`);
  }

  // Update membership status back to active
  const { error: membershipError } = await db
    .from('community_memberships')
    .update({ status: 'active' })
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (membershipError) {
    console.error("Error updating membership status:", membershipError);
    throw new Error(`Failed to update membership status: ${membershipError.message}`);
  }
}

/**
 * Check if a user is banned from a community
 */
export async function isUserBanned(userId: string, communityId: string): Promise<boolean> {
  const { data, error } = await db
    .from('community_bans')
    .select('id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    console.error("Error checking ban status:", error);
    return false;
  }

  return !!data;
}
