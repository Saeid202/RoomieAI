import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MatchCard } from '@/components/co-ownership/MatchCard';
import {
  getMyMatches,
  initiateConnection,
  updateConnectionState,
} from '@/services/coOwnershipMatchingService';
import type { PartialMatchResult } from '@/types/coOwnershipMatching';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-6 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 flex-1 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoOwnershipMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<PartialMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMatches() {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const results = await getMyMatches(user.id);
      setMatches(results);
    } catch (e: any) {
      setError(e?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleConnect(matchUserId: string) {
    if (!user?.id) return;
    try {
      await initiateConnection(user.id, matchUserId);
      toast.success('Connection request sent');
      await loadMatches();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to connect');
    }
  }

  async function handleDecline(connectionId: string, matchUserId: string) {
    if (!user?.id) return;
    try {
      await updateConnectionState(connectionId, user.id, 'declined');
      toast.success('Match declined');
      await loadMatches();
    } catch (e: any) {
      // If no connection exists yet (connectionId is the matchId), we need to
      // create a declined connection first
      try {
        const conn = await initiateConnection(user.id, matchUserId);
        await updateConnectionState(conn.id, user.id, 'declined');
        toast.success('Match declined');
        await loadMatches();
      } catch {
        toast.error(e?.message || 'Failed to decline');
      }
    }
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
            Co-Ownership Matches
          </h1>
          <p className="text-sm text-muted-foreground">
            Compatible partners ranked by compatibility score
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={loadMatches}
            className="mt-3 text-sm text-primary underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No matches yet. Complete your co-ownership profile to get matched.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.matchId}
              match={match}
              currentUserId={user?.id ?? ''}
              onConnect={handleConnect}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
