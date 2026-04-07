import { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { togglePostLike } from '@/services/communityLikeService';
import { CommentSection } from './CommentSection';
import { ReportModal } from './ReportModal';
import type { CommunityPost } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
  isMember: boolean;
  currentUserId?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  onLikeChange: (postId: string, liked: boolean, count: number) => void;
}

const POST_TYPE_COLORS: Record<string, string> = {
  casual: 'bg-gray-100 text-gray-700',
  looking_for_roommate: 'bg-blue-100 text-blue-700',
  offering_room: 'bg-green-100 text-green-700',
};

const POST_TYPE_LABELS: Record<string, string> = {
  casual: 'General Chat',
  looking_for_roommate: 'Looking for Roommate',
  offering_room: 'Offering Room',
};

function formatUserId(userId: string) {
  return `User ${userId.slice(0, 8)}`;
}

function StructuredDataFields({ data }: { data: NonNullable<CommunityPost['structured_data']> }) {
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
  commentCount,
  isLiked,
  onLikeChange,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likeCount);
  const [reportOpen, setReportOpen] = useState(false);

  const badgeColor = POST_TYPE_COLORS[post.post_type] || POST_TYPE_COLORS.casual;
  const badgeLabel = POST_TYPE_LABELS[post.post_type] || 'General Chat';

  async function handleToggleLike() {
    if (!isMember || likingPost) return;
    // Optimistic update
    const newLiked = !optimisticLiked;
    const newCount = newLiked ? optimisticCount + 1 : Math.max(0, optimisticCount - 1);
    setOptimisticLiked(newLiked);
    setOptimisticCount(newCount);
    setLikingPost(true);
    try {
      const result = await togglePostLike(post.id);
      setOptimisticLiked(result.liked);
      setOptimisticCount(result.count);
      onLikeChange(post.id, result.liked, result.count);
    } catch (e: any) {
      // Revert on error
      setOptimisticLiked(isLiked);
      setOptimisticCount(likeCount);
      toast.error(e?.message || 'Failed to update like');
    } finally {
      setLikingPost(false);
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
            {badgeLabel}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {/* Structured data */}
        {post.post_type !== 'casual' && post.structured_data && (
          <StructuredDataFields data={post.structured_data} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <button
            onClick={handleToggleLike}
            disabled={!isMember || likingPost}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isMember ? 'hover:text-red-500 cursor-pointer' : 'cursor-default'
            } ${optimisticLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${optimisticLiked ? 'fill-current' : ''}`} />
            <span>{optimisticCount}</span>
          </button>

          <button
            onClick={() => setShowComments(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-orange-500 cursor-pointer transition-colors ml-auto"
            title="Report post"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            communityId={post.community_id}
            isMember={isMember}
            currentUserId={currentUserId}
          />
        )}
      </CardContent>

      <ReportModal
        targetType="post"
        targetId={post.id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </Card>
  );
}
