import { supabase } from "@/integrations/supabase/client";
import type { Community, CreateCommunityInput, UpdateCommunityInput } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get all communities, optionally filtered by city
 */
export async function getCommunities(city?: string): Promise<Community[]> {
  let query = db
    .from('communities')
    .select('*')
    .order('created_at', { ascending: false });

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching communities:", error);
    throw new Error(`Failed to fetch communities: ${error.message}`);
  }

  return (data as Community[]) || [];
}

/**
 * Get a single community by ID
 */
export async function getCommunityById(id: string): Promise<Community | null> {
  const { data, error } = await db
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error("Error fetching community:", error);
    throw new Error(`Failed to fetch community: ${error.message}`);
  }

  return data as Community;
}

/**
 * Create a new community (admin only)
 */
export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await db
    .from('communities')
    .insert({
      name: input.name,
      description: input.description || null,
      city: input.city || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating community:", error);
    throw new Error(`Failed to create community: ${error.message}`);
  }

  return data as Community;
}

/**
 * Update a community (admin only)
 */
export async function updateCommunity(id: string, input: UpdateCommunityInput): Promise<Community> {
  const { data, error } = await db
    .from('communities')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.city !== undefined && { city: input.city }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating community:", error);
    throw new Error(`Failed to update community: ${error.message}`);
  }

  return data as Community;
}

/**
 * Delete a community (admin only)
 */
export async function deleteCommunity(id: string): Promise<void> {
  const { error } = await db
    .from('communities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting community:", error);
    throw new Error(`Failed to delete community: ${error.message}`);
  }
}

/**
 * Get member count for a community
 */
export async function getCommunityMemberCount(communityId: string): Promise<number> {
  const { count, error } = await db
    .from('community_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('status', 'active');

  if (error) {
    console.error("Error fetching member count:", error);
    return 0;
  }

  return count || 0;
}
