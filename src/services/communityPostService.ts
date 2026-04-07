import { supabase } from "@/integrations/supabase/client";
import type { CommunityPost, CreatePostInput, UpdatePostInput } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get posts for a community with optional pagination
 */
export async function getCommunityPosts(
  communityId: string,
  limit = 20,
  offset = 0
): Promise<CommunityPost[]> {
  const { data, error } = await db
    .from('community_posts')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching community posts:", error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  return (data as CommunityPost[]) || [];
}

/**
 * Get a single post by ID
 */
export async function getPostById(id: string): Promise<CommunityPost | null> {
  const { data, error } = await db
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error("Error fetching post:", error);
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  return data as CommunityPost;
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<CommunityPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await db
    .from('community_posts')
    .insert({
      community_id: input.community_id,
      user_id: user.id,
      content: input.content,
      post_type: input.post_type,
      structured_data: input.structured_data || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return data as CommunityPost;
}

/**
 * Update a post (owner only)
 */
export async function updatePost(id: string, input: UpdatePostInput): Promise<CommunityPost> {
  const { data, error } = await db
    .from('community_posts')
    .update({
      ...(input.content !== undefined && { content: input.content }),
      ...(input.structured_data !== undefined && { structured_data: input.structured_data }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating post:", error);
    throw new Error(`Failed to update post: ${error.message}`);
  }

  return data as CommunityPost;
}

/**
 * Delete a post (owner or admin)
 */
export async function deletePost(id: string): Promise<void> {
  const { error } = await db
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting post:", error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
}

/**
 * Filter structured posts by criteria
 */
export async function filterStructuredPosts(
  communityId: string,
  filters: {
    budget_max?: number;
    move_in_date?: string;
    gender_preference?: string;
    pets?: boolean;
    room_type?: string;
    lease_duration?: string;
  }
): Promise<CommunityPost[]> {
  const { data, error } = await db
    .from('community_posts')
    .select('*')
    .eq('community_id', communityId)
    .neq('post_type', 'casual')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching structured posts:", error);
    throw new Error(`Failed to fetch structured posts: ${error.message}`);
  }

  let posts = (data as CommunityPost[]) || [];

  // Apply client-side filters on structured_data
  if (filters.budget_max !== undefined) {
    posts = posts.filter(p => {
      const budget = p.structured_data?.budget;
      return budget == null || budget <= filters.budget_max!;
    });
  }

  if (filters.gender_preference) {
    posts = posts.filter(p =>
      !p.structured_data?.gender_preference ||
      p.structured_data.gender_preference === 'any' ||
      p.structured_data.gender_preference === filters.gender_preference
    );
  }

  if (filters.pets !== undefined) {
    posts = posts.filter(p =>
      p.structured_data?.pets == null || p.structured_data.pets === filters.pets
    );
  }

  if (filters.room_type) {
    posts = posts.filter(p =>
      !p.structured_data?.room_type || p.structured_data.room_type === filters.room_type
    );
  }

  if (filters.lease_duration) {
    posts = posts.filter(p =>
      !p.structured_data?.lease_duration || p.structured_data.lease_duration === filters.lease_duration
    );
  }

  return posts;
}
