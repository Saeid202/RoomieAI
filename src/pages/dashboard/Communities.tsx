import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MapPin, Globe, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { JoinCommunityButton } from '@/components/community/JoinCommunityButton';
import { getCommunities, getCommunityMemberCount } from '@/services/communityService';
import { getMembership } from '@/services/communityMembershipService';
import type { Community, CommunityMembership } from '@/types/community';

interface CommunityWithMeta extends Community {
  memberCount: number;
  membership: CommunityMembership | null;
}

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm animate-pulse">
          <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-300" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-3 w-full bg-gray-100 rounded-full" />
            <div className="h-3 w-2/3 bg-gray-100 rounded-full" />
            <div className="h-9 w-full bg-gray-200 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommunitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

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

  useEffect(() => {
    loadCommunities(search || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user?.id]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  function handleMembershipChange(communityId: string, membership: CommunityMembership | null) {
    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? { ...c, membership, memberCount: membership?.status === 'active' ? c.memberCount + 1 : Math.max(0, c.memberCount - 1) }
          : c
      )
    );
  }

  const joinedCommunities = communities.filter(c => c.membership?.status === 'active');
  const discoverCommunities = communities.filter(c => c.membership?.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 px-6 py-10 md:py-14">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium">Roommate Communities</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Find Your Community
          </h1>
          <p className="text-white/70 text-base mb-8 max-w-lg">
            Connect with seekers in your city, share posts, find roommates, and build your network.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search communities by city..."
                className="pl-10 h-11 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 h-11 rounded-xl bg-white text-purple-700 font-semibold text-sm hover:bg-white/90 transition-all shadow-lg"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-4 h-11 rounded-xl bg-white/20 text-white text-sm hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-10">

        {loading ? (
          <LoadingSkeleton />
        ) : communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Globe className="h-9 w-9 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No communities found</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {search ? `No communities found for "${search}". Try a different city.` : 'No communities available yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            {/* Joined Communities */}
            {joinedCommunities.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Your Communities</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    {joinedCommunities.length} joined
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {joinedCommunities.map(community => (
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

            {/* Discover Communities */}
            {discoverCommunities.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {joinedCommunities.length > 0 ? 'Discover More' : 'All Communities'}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    {discoverCommunities.length} available
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
      onClick={onNavigate}
    >
      {/* Cover */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl tracking-wide">{initials}</span>
        </div>
        {isJoined && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2.5 py-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white text-xs font-medium">Joined</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-purple-700 transition-colors">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {community.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            {community.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-purple-400" />
                <span className="font-medium text-gray-600">{community.city}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-400" />
              <span className="font-medium text-gray-600">
                {community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
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
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-all"
          >
            View
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
