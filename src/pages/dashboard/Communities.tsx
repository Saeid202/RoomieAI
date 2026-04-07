import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MapPin, Globe, ChevronRight, Sparkles, PenSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JoinCommunityButton } from '@/components/community/JoinCommunityButton';
import { PostCard } from '@/components/community/PostCard';
import { PostForm } from '@/components/community/PostForm';
import { PostFilter } from '@/components/community/PostFilter';
import { InviteModal } from '@/components/community/InviteModal';
import type { PostFilters } from '@/components/community/PostFilter';
import { getCommunities, getCommunityMemberCount } from '@/services/communityService';
import { getMembership } from '@/services/communityMembershipService';
import { getCommunityPosts, filterStructuredPosts } from '@/services/communityPostService';
import { getPostLikeCount, hasUserLikedPost } from '@/services/communityLikeService';
import { getPostComments } from '@/services/communityCommentService';
import type { Community, CommunityMembership, CommunityPost, PostType } from '@/types/community';

interface CommunityWithMeta extends Community {
  memberCount: number;
  membership: CommunityMembership | null;
}

interface PostMeta {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

type FilterType = 'all' | PostType;

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'looking_for_roommate', label: 'Looking for Roommate' },
  { value: 'offering_room', label: 'Offering Room' },
  { value: 'casual', label: 'General Chat' },
];

const STRUCTURED_TABS: FilterType[] = ['looking_for_roommate', 'offering_room'];

// Gradient palettes for community cover images
const GRADIENTS = [
  'from-violet-600 via-purple-600 to-indigo-700',
  'from-rose-500 via-pink-600 to-purple-700',
  'from-amber-500 via-orange-600 to-rose-600',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-blue-500 via-indigo-600 to-violet-700',
  'from-fuchsia-500 via-pink-600 to-rose-600',
];

function getGradient(id: string) {
  const index = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[index];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm animate-pulse">
          <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300" />
          <div className="p-6 space-y-4">
            <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-4 w-full bg-gray-100 rounded-lg" />
            <div className="h-4 w-2/3 bg-gray-100 rounded-lg" />
            <div className="flex gap-3 pt-2">
              <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
              <div className="h-10 w-20 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 space-y-3 animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-5 w-32 bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-4/5 bg-gray-100 rounded" />
          <div className="flex gap-6 pt-3 border-t border-gray-100">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function loadPostMeta(posts: CommunityPost[], userId?: string) {
  const entries = await Promise.all(
    posts.map(async post => {
      const [likeCount, commentCount, isLiked] = await Promise.all([
        getPostLikeCount(post.id),
        getPostComments(post.id).then(c => c.length),
        userId ? hasUserLikedPost(post.id) : Promise.resolve(false),
      ]);
      return [post.id, { likeCount, commentCount, isLiked }] as const;
    })
  );
  return Object.fromEntries(entries);
}

type TabType = 'browse' | 'my-community';

export default function CommunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Tab-based navigation state
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  
  // Joined community detail view state
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithMeta | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postMeta, setPostMeta] = useState<Record<string, PostMeta>>({});
  const [postsLoading, setPostsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [structuredFilters, setStructuredFilters] = useState<PostFilters>({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const showPostFilter = STRUCTURED_TABS.includes(filter);
  const isMember = selectedCommunity?.membership?.status === 'active';

  async function loadCommunities(city?: string) {
    setLoading(true);
    try {
      const data = await getCommunities(city);
      const withMeta = await Promise.all(
        data.map(async community => {
          const [memberCount, membership] = await Promise.all([
            getCommunityMemberCount(community.id),
            user ? getMembership(community.id) : Promise.resolve(null),
          ]);
          return { ...community, memberCount, membership };
        })
      );
      setCommunities(withMeta);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    if (!selectedCommunity) return;
    setPostsLoading(true);
    try {
      let data: CommunityPost[];
      if (showPostFilter && Object.keys(structuredFilters).some(k => structuredFilters[k as keyof PostFilters] != null)) {
        data = await filterStructuredPosts(selectedCommunity.id, structuredFilters);
        if (filter !== 'all') {
          data = data.filter(p => p.post_type === filter);
        }
      } else {
        data = await getCommunityPosts(selectedCommunity.id);
      }
      setPosts(data);
      const meta = await loadPostMeta(data, user?.id);
      setPostMeta(meta);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  }

  useEffect(() => {
    loadCommunities(search || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user?.id]);

  useEffect(() => {
    if (selectedCommunity) {
      loadPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommunity?.id, user?.id, filter, structuredFilters]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  function handleMembershipChange(communityId: string, membership: CommunityMembership | null) {
    setCommunities(prev => {
      const updated = prev.map(c =>
        c.id === communityId
          ? { ...c, membership, memberCount: membership?.status === 'active' ? c.memberCount + 1 : Math.max(0, c.memberCount - 1) }
          : c
      );
      
      // If user just joined, automatically switch to my-community tab
      if (membership?.status === 'active') {
        const joinedCommunity = updated.find(c => c.id === communityId);
        if (joinedCommunity) {
          setSelectedCommunity(joinedCommunity);
          setActiveTab('my-community');
          setFilter('all');
          setStructuredFilters({});
          setPosts([]);
        }
      } else {
        // If user left, switch back to browse tab
        if (selectedCommunity?.id === communityId) {
          setSelectedCommunity(null);
          setActiveTab('browse');
        }
      }
      
      return updated;
    });
  }

  function handleSelectCommunity(community: CommunityWithMeta) {
    setSelectedCommunity(community);
    setActiveTab('my-community');
    setFilter('all');
    setStructuredFilters({});
    setPosts([]);
  }

  function handleBackFromDetail() {
    setActiveTab('browse');
    setShowPostForm(false);
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

  function handleFilterTabChange(tab: FilterType) {
    setFilter(tab);
    if (!STRUCTURED_TABS.includes(tab)) {
      setStructuredFilters({});
    }
  }

  const displayedPosts = showPostFilter
    ? posts
    : filter === 'all'
    ? posts
    : posts.filter(p => p.post_type === filter);

  const joinedCommunities = communities.filter(c => c.membership?.status === 'active');
  const discoverCommunities = communities.filter(c => c.membership?.status !== 'active');

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header - Homei AI Brand */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-orange-500 px-8 py-16 md:py-20">
        {/* Energetic animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">Communities</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
            Find Your Community
          </h1>
          <p className="text-white/95 text-lg mb-10 max-w-2xl leading-relaxed drop-shadow">
            Connect with like-minded seekers in your city. Share experiences, find roommates, and build meaningful relationships.
          </p>

          {/* Premium Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search communities by city..."
                className="pl-12 h-12 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-lg text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 text-base"
              />
            </div>
            <button
              type="submit"
              className="px-8 h-12 rounded-lg bg-white text-violet-600 font-semibold text-base hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-6 h-12 rounded-lg bg-white/20 backdrop-blur-sm text-white text-base font-medium hover:bg-white/30 transition-all border border-white/30"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Tab Navigation - Premium Style */}
      {selectedCommunity && (
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex gap-12">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 px-1 border-b-2 font-semibold text-base transition-all ${
                  activeTab === 'browse'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Browse Communities
              </button>
              <button
                onClick={() => setActiveTab('my-community')}
                className={`py-4 px-1 border-b-2 font-semibold text-base transition-all ${
                  activeTab === 'my-community'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {selectedCommunity.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content - Premium Layout */}
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            {loading ? (
              <LoadingSkeleton />
            ) : communities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-6">
                  <Globe className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No communities found</h3>
                <p className="text-gray-600 max-w-md text-lg">
                  {search ? `No communities found for "${search}". Try a different city.` : 'No communities available yet. Check back soon.'}
                </p>
              </div>
            ) : (
              <>
                {/* Joined Communities Section */}
                {joinedCommunities.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Your Communities</h2>
                        <p className="text-gray-600 mt-1">Communities you're actively part of</p>
                      </div>
                      <span className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 rounded-full shadow-md">
                        {joinedCommunities.length} joined
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {joinedCommunities.map(community => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onNavigate={() => handleSelectCommunity(community)}
                          onMembershipChange={m => handleMembershipChange(community.id, m)}
                          showUser={!!user}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Discover Communities Section */}
                {discoverCommunities.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {joinedCommunities.length > 0 ? 'Discover More' : 'All Communities'}
                        </h2>
                        <p className="text-gray-600 mt-1">Explore communities and find your perfect match</p>
                      </div>
                      <span className="text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 rounded-full shadow-md">
                        {discoverCommunities.length} available
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {discoverCommunities.map(community => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onNavigate={() => navigate(`/dashboard/communities/${community.id}`)}
                          onMembershipChange={m => handleMembershipChange(community.id, m)}
                          showUser={!!user}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* My Community Tab */}
        {activeTab === 'my-community' && selectedCommunity && (
          <div className="w-full">
            {/* Community header - Full Width Premium Card */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-10 mb-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-3xl">{getInitials(selectedCommunity.name)}</span>
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold text-gray-900 mb-2">{selectedCommunity.name}</h1>
                      {selectedCommunity.description && (
                        <p className="text-gray-700 text-lg leading-relaxed">{selectedCommunity.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 mt-6 text-lg">
                    {selectedCommunity.city && (
                      <span className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <MapPin className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">{selectedCommunity.city}</p>
                        </div>
                      </span>
                    )}
                    <span className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Members</p>
                        <p className="font-semibold text-gray-900">{selectedCommunity.memberCount.toLocaleString()}</p>
                      </div>
                    </span>
                  </div>
                </div>
                
                {user && (
                  <div className="w-48 flex-shrink-0">
                    <JoinCommunityButton
                      communityId={selectedCommunity.id}
                      membership={selectedCommunity.membership}
                      onMembershipChange={m => handleMembershipChange(selectedCommunity.id, m)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Modern & Luxury */}
            {isMember && (
              <div className="flex gap-6 mb-10 max-w-2xl">
                <button
                  onClick={() => setShowPostForm(true)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 px-8 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 flex-1"
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="relative flex items-center justify-center gap-3">
                    <PenSquare className="h-6 w-6" />
                    <span>Create Post</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="group relative overflow-hidden rounded-2xl bg-white border-2 border-violet-600 px-8 py-4 text-violet-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-violet-50 flex items-center justify-center gap-3"
                >
                  <div className="relative flex items-center justify-center gap-3">
                    <Users className="h-6 w-6" />
                    <span>Invite</span>
                  </div>
                </button>
              </div>
            )}

            {/* Filter Tabs - Enhanced */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Browse Posts</h3>
              <div className="flex gap-3 overflow-x-auto pb-3 border-b-2 border-gray-200">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => handleFilterTabChange(tab.value)}
                    className={`px-6 py-3 rounded-xl text-base font-semibold whitespace-nowrap transition-all ${
                      filter === tab.value
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Post Filters */}
            {showPostFilter && (
              <div className="mb-10 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Refine Your Search</h3>
                <PostFilter
                  activeFilters={structuredFilters}
                  onFilterChange={setStructuredFilters}
                />
              </div>
            )}

            {/* Posts Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {filter === 'all' ? 'All Posts' : `${FILTER_TABS.find(t => t.value === filter)?.label} Posts`}
              </h3>
              {postsLoading ? (
                <PostLoadingSkeleton />
              ) : displayedPosts.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                    <PenSquare className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    {filter === 'all' ? 'No posts yet. Be the first to post!' : 'No posts in this category.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {displayedPosts.map(post => (
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
            </div>

            {/* Post Form Modal */}
            <PostForm
              communityId={selectedCommunity.id}
              open={showPostForm}
              onClose={() => setShowPostForm(false)}
              onPostCreated={handlePostCreated}
            />

            {/* Invite Modal */}
            <InviteModal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              communityId={selectedCommunity.id}
              communityName={selectedCommunity.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Community Card ────────────────────────────────────────────────────────────

interface CommunityCardProps {
  community: CommunityWithMeta;
  onNavigate: () => void;
  onMembershipChange: (m: CommunityMembership | null) => void;
  showUser: boolean;
}

function CommunityCard({ community, onNavigate, onMembershipChange, showUser }: CommunityCardProps) {
  const gradient = getGradient(community.id);
  const initials = getInitials(community.name);
  const isJoined = community.membership?.status === 'active';

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onNavigate}
    >
      {/* Premium Cover */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent transition-opacity duration-300" />
        
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-xl">
          <span className="text-white font-bold text-2xl tracking-wide">{initials}</span>
        </div>
        
        {isJoined && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-900 text-xs font-semibold">Joined</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-violet-700 transition-colors">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {community.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-violet-500" />
                <span className="font-medium">{community.city}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-500" />
              <span className="font-medium">
                {community.memberCount.toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {showUser && (
            <div className="flex-1">
              <JoinCommunityButton
                communityId={community.id}
                membership={community.membership}
                onMembershipChange={onMembershipChange}
              />
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); onNavigate(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 hover:text-violet-700 hover:border-violet-300 transition-all"
          >
            View
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
