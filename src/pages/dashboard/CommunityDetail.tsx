import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, PenSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/community/PostCard';
import { PostForm } from '@/components/community/PostForm';
import { JoinCommunityButton } from '@/components/community/JoinCommunityButton';
import { getCommunityById, getCommunityMemberCount } from '@/services/communityService';
import { getMembership } from '@/services/communityMembershipService';
import { getCommunityPosts } from '@/services/communityPostService';
import { getPostLikeCount, hasUserLikedPost } from '@/services/communityLikeService';
import { getPostComments } from '@/services/communityCommentService';
import type { Community, CommunityMembership, CommunityPost, PostType } from '@/types/community';

type FilterType = 'all' | PostType;

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate' },
  { value: 'offering_room', label: 'Offering Room' },
  { value: 'casual', label: 'General Chat' },
];

interface PostMeta {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-5 w-28 bg-muted rounded-full" />
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
          <div className="flex gap-4 pt-2 border-t">
            <div className="h-3 w-12 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [membership, setMembership] = useState<CommunityMembership | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postMeta, setPostMeta] = useState<Record<string, PostMeta>>({});
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showPostForm, setShowPostForm] = useState(false);

  const isMember = membership?.status === 'active';

  async function loadCommunity() {
    if (!id) return;
    try {
      const [comm, count, mem] = await Promise.all([
        getCommunityById(id),
        getCommunityMemberCount(id),
        user ? getMembership(id) : Promise.resolve(null),
      ]);
      setCommunity(comm);
      setMemberCount(count);
      setMembership(mem);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    if (!id) return;
    setPostsLoading(true);
    try {
      const data = await getCommunityPosts(id);
      setPosts(data);

      // Load meta for each post
      const metaEntries = await Promise.all(
        data.map(async post => {
          const [likeCount, commentCount, isLiked] = await Promise.all([
            getPostLikeCount(post.id),
            getPostComments(post.id).then(c => c.length),
            user ? hasUserLikedPost(post.id) : Promise.resolve(false),
          ]);
          return [post.id, { likeCount, commentCount, isLiked }] as const;
        })
      );
      setPostMeta(Object.fromEntries(metaEntries));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }

  useEffect(() => {
    loadCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  function handleMembershipChange(newMembership: CommunityMembership | null) {
    setMembership(newMembership);
    setMemberCount(prev =>
      newMembership?.status === 'active' ? prev + 1 : Math.max(0, prev - 1)
    );
  }

  function handlePostCreated(post: CommunityPost) {
    setPosts(prev => [post, ...prev]);
    setPostMeta(prev => ({
      ...prev,
      [post.id]: { likeCount: 0, commentCount: 0, isLiked: false },
    }));
  }

  function handleLikeChange(postId: string, liked: boolean, count: number) {
    setPostMeta(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isLiked: liked, likeCount: count },
    }));
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.post_type === filter);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 text-center">
        <p className="text-muted-foreground">Community not found.</p>
        <Button variant="link" onClick={() => navigate('/dashboard/communities')}>
          Back to Communities
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/communities')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Communities
      </button>

      {/* Community header */}
      <div className="rounded-lg border bg-card p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{community.name}</h1>
            {community.description && (
              <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {community.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {community.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
          {user && (
            <JoinCommunityButton
              communityId={community.id}
              membership={membership}
              onMembershipChange={handleMembershipChange}
            />
          )}
        </div>
      </div>

      {/* Create post button */}
      {isMember && (
        <Button
          onClick={() => setShowPostForm(true)}
          className="w-full mb-4 gap-2"
          variant="outline"
        >
          <PenSquare className="h-4 w-4" />
          Create Post
        </Button>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <LoadingSkeleton />
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? 'No posts yet. Be the first to post!' : 'No posts in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isMember={isMember}
              currentUserId={user?.id}
              likeCount={postMeta[post.id]?.likeCount ?? 0}
              commentCount={postMeta[post.id]?.commentCount ?? 0}
              isLiked={postMeta[post.id]?.isLiked ?? false}
              onLikeChange={handleLikeChange}
            />
          ))}
        </div>
      )}

      {/* Post form modal */}
      <PostForm
        communityId={community.id}
        open={showPostForm}
        onClose={() => setShowPostForm(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
