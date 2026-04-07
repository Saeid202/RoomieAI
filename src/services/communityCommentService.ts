import { supabase } from "@/integrations/supabase/client";
import type { CommunityComment, CreateCommentInput } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await db
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  return (data as CommunityComment[]) || [];
}

/**
 * Create a comment on a post
 */
export async function createComment(input: CreateCommentInput): Promise<CommunityComment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await db
    .from('community_comments')
    .insert({
      post_id: input.post_id,
      user_id: user.id,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return data as CommunityComment;
}

/**
 * Delete a comment (owner or admin)
 */
export async function deleteComment(id: string): Promise<void> {
  const { error } = await db
    .from('community_comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting comment:", error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

/**
 * Subscribe to real-time comments on a post
 */
export function subscribeToPostComments(
  postId: string,
  onInsert: (comment: CommunityComment) => void,
  onDelete: (id: string) => void
) {
  const channel = supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => onInsert(payload.new as CommunityComment)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'community_comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => onDelete(payload.old.id as string)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
