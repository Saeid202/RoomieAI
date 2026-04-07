import { supabase } from "@/integrations/supabase/client";
import type { CommunityPostLike } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get likes for a post
 */
export async function getPostLikes(postId: string): Promise<CommunityPostLike[]> {
  const { data, error } = await db
    .from('community_post_likes')
    .select('*')
    .eq('post_id', postId);

  if (error) {
    console.error("Error fetching post likes:", error);
    throw new Error(`Failed to fetch likes: ${error.message}`);
  }

  return (data as CommunityPostLike[]) || [];
}

/**
 * Get like count for a post
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  const { count, error } = await db
    .from('community_post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error("Error fetching like count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Check if the current user has liked a post
 */
export async function hasUserLikedPost(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await db
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    console.error("Error checking like status:", error);
    return false;
  }

  return !!data;
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<CommunityPostLike> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await db
    .from('community_post_likes')
    .insert({
      post_id: postId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error liking post:", error);
    throw new Error(`Failed to like post: ${error.message}`);
  }

  return data as CommunityPostLike;
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await db
    .from('community_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error unliking post:", error);
    throw new Error(`Failed to unlike post: ${error.message}`);
  }
}

/**
 * Toggle like on a post - returns new like state
 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean; count: number }> {
  const liked = await hasUserLikedPost(postId);

  if (liked) {
    await unlikePost(postId);
  } else {
    await likePost(postId);
  }

  const count = await getPostLikeCount(postId);
  return { liked: !liked, count };
}
