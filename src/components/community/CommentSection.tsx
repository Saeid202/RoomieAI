import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  getPostComments,
  createComment,
  deleteComment,
  subscribeToPostComments,
} from '@/services/communityCommentService';
import { getPostById } from '@/services/communityPostService';
import { getUserProfiles, getUserProfile, getDisplayName } from '@/services/userProfileService';
import { createNotification } from '@/services/notificationService';
import type { CommunityComment } from '@/types/community';

interface CommentSectionProps {
  postId: string;
  communityId: string;
  isMember: boolean;
  currentUserId?: string;
}



export function CommentSection({ postId, communityId, isMember, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function load() {
      try {
        const data = await getPostComments(postId);
        setComments(data);
        
        // Fetch all user profiles for the comments
        if (data.length > 0) {
          const userIds = data.map(c => c.user_id);
          const profiles = await getUserProfiles(userIds);
          setUserProfiles(profiles);
        }
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    }

    load();

    unsubscribe = subscribeToPostComments(
      postId,
      async (comment) => setComments(prev => {
        if (prev.some(c => c.id === comment.id)) return prev;
        // Fetch profile for new comment
        getUserProfile(comment.user_id).then(profile => {
          if (profile) {
            setUserProfiles(prev => new Map(prev).set(comment.user_id, profile));
          }
        });
        return [...prev, comment];
      }),
      (id) => setComments(prev => prev.filter(c => c.id !== id))
    );

    return () => unsubscribe?.();
  }, [postId]);

  async function handleSubmit() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await createComment({ post_id: postId, content: newComment.trim() });
      setComments(prev => {
        if (prev.some(c => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
      setNewComment('');

      // Notify post author if it's someone else's post
      try {
        const post = await getPostById(postId);
        if (post && post.user_id !== currentUserId) {
          await createNotification({
            user_id: post.user_id,
            type: 'general',
            title: 'New comment on your post',
            message: 'Someone commented on your post',
            link: `/dashboard/communities/${communityId}`,
          });
        }
      } catch {
        // Notification failure is non-critical
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete comment');
    }
  }

  if (loading) {
    return <div className="py-2 text-xs text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="mt-3 space-y-2">
      {comments.length === 0 && (
        <p className="text-xs text-muted-foreground py-1">No comments yet.</p>
      )}

      {comments.map(comment => (
        <div key={comment.id} className="text-sm bg-muted/40 rounded-md px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-xs">
                {getDisplayName(userProfiles.get(comment.user_id) || null, comment.user_id)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              <p className="mt-0.5 text-sm break-words">{comment.content}</p>
            </div>
            {comment.user_id === currentUserId && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                title="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {isMember && (
        <div className="flex gap-2 mt-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="text-sm min-h-[60px] resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="self-end"
          >
            {submitting ? '...' : 'Post'}
          </Button>
        </div>
      )}
    </div>
  );
}
