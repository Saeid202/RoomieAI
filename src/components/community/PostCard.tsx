import { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { togglePostLike } from '@/services/communityLikeService';
import { getPostComments, createComment } from '@/services/communityCommentService';
import type { CommunityPost, CommunityComment } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
  isMember: boolean;
  currentUserId?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onLikeChange: (postId: string, liked: boolean, count: number) => void;
}

const POST_TYPE_BADGE: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  casual: { label: 'General Chat', variant: 'secondary' },
  looking_for_roommate: { label: 'Looking for Roommate', variant: 'default' },
  offering_room: { label: 'Offering Room', variant: 'outline' },
};

const POST_TYPE_COLORS: Record<string, string> = {
  casual: 'bg-gray-100 text-gray-700',
  looking_for_roommate: 'bg-blue-100 text-blue-700',
  offering_room: 'bg-green-100 text-green-700',
};

function formatUserId(userId: string) {
  return `User ${userId.slice(0, 8)}`;
}

function StructuredDataFields({ data, postType }: { data: NonNullable<CommunityPost['structured_data']>; postType: string }) {
  const fields: { label: string; value: string | null | undefined }[] = [];

  if (data.budget != null) fields.push({ label: 'Budget', value: `$${data.budget}/mo` });
  if (data.move_in_date) fields.push({ label: 'Move-in', value: data.move_in_date });
  if (data.gender_preference) fields.push({ label: 'Gender', value: data.gender_preference.replace('_', '-') });
  if (data.pets != null) fields.push({ label: 'Pets', value: data.pets ? 'Allowed' : 'Not allowed' });
  if (data.room_type) fields.push({ label: 'Room', value: data.room_type });
  if (data.lease_duration) fields.push({ label: 'Lease', value: data.lease_duration.replace(/_/g, ' ') });

  if (fields.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {fields.map(({ label, value }) => (
        <div key={label} className="text-xs">
          <span className="text-muted-foreground">{label}: </span>
          <span className="font-medium capitalize">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function PostCard({
  post,
  isMember,
  currentUserId,
  likeCount,
  commentCount: initialCommentCount,
  isLiked,
  onLikeChange,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);

  const badgeInfo = POST_TYPE_BADGE[post.post_type] || POST_TYPE_BADGE.casual;
  const badgeColor = POST_TYPE_COLORS[post.post_type] || POST_TYPE_COLORS.casual;

  async function handleToggleLike() {
    if (!isMember || likingPost) return;
    setLikingPost(true);
    try {
      const result = await togglePostLike(post.id);
      onLikeChange(post.id, result.liked, result.count);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update like');
    } finally {
      setLikingPost(false);
    }
  }

  async function handleToggleComments() {
    if (!showComments && !commentsLoaded) {
      try {
        const data = await getPostComments(post.id);
        setComments(data);
        setCommentsLoaded(true);
      } catch {
        toast.error('Failed to load comments');
      }
    }
    setShowComments(prev => !prev);
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const comment = await createComment({ post_id: post.id, content: newComment.trim() });
      setComments(prev => [...prev, comment]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <Card className="border bg-card">
      <CardContent className="pt-4 pb-3 px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-sm font-medium">{formatUserId(post.user_id)}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
            {badgeInfo.label}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {/* Structured data */}
        {post.post_type !== 'casual' && post.structured_data && (
          <StructuredDataFields data={post.structured_data} postType={post.post_type} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <button
            onClick={handleToggleLike}
            disabled={!isMember || likingPost}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isMember ? 'hover:text-red-500 cursor-pointer' : 'cursor-default'
            } ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 space-y-2">
            {comments.map(comment => (
              <div key={comment.id} className="text-sm bg-muted/40 rounded-md px-3 py-2">
                <span className="font-medium text-xs">{formatUserId(comment.user_id)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                <p className="mt-0.5 text-sm">{comment.content}</p>
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
                      handleSubmitComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="self-end"
                >
                  Post
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
