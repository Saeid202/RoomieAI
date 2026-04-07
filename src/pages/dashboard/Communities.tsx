import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { JoinCommunityButton } from '@/components/community/JoinCommunityButton';
import { getCommunities, getCommunityMemberCount } from '@/services/communityService';
import { getMembership } from '@/services/communityMembershipService';
import type { Community, CommunityMembership } from '@/types/community';

interface CommunityWithMeta extends Community {
  memberCount: number;
  membership: CommunityMembership | null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded" />
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

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600">
          <Users className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            Communities
          </h1>
          <p className="text-sm text-muted-foreground">
            Find roommates in your city
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by city..."
            className="pl-9"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); }}
            className="px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : communities.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? `No communities found for "${search}"` : 'No communities available yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {communities.map(community => (
            <Card
              key={community.id}
              className="border bg-card hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/communities/${community.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{community.name}</h3>
                    {community.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {community.description}
                      </p>
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
                        {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    {user && (
                      <JoinCommunityButton
                        communityId={community.id}
                        membership={community.membership}
                        onMembershipChange={m => handleMembershipChange(community.id, m)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
