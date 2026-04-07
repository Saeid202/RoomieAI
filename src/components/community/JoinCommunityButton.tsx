import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { joinCommunity, leaveCommunity } from '@/services/communityMembershipService';
import type { CommunityMembership } from '@/types/community';

interface JoinCommunityButtonProps {
  communityId: string;
  membership: CommunityMembership | null;
  onMembershipChange: (membership: CommunityMembership | null) => void;
}

export function JoinCommunityButton({
  communityId,
  membership,
  onMembershipChange,
}: JoinCommunityButtonProps) {
  const [loading, setLoading] = useState(false);

  const isBanned = membership?.status === 'banned';
  const isMember = membership?.status === 'active';

  async function handleJoin() {
    setLoading(true);
    try {
      const result = await joinCommunity(communityId);
      onMembershipChange(result);
      toast.success('Joined community');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to join community');
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    try {
      await leaveCommunity(communityId);
      onMembershipChange(null);
      toast.success('Left community');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to leave community');
    } finally {
      setLoading(false);
    }
  }

  if (isBanned) {
    return (
      <button disabled className="w-full py-2 px-4 rounded-xl bg-red-50 text-red-400 text-sm font-medium border border-red-100 cursor-not-allowed">
        Banned
      </button>
    );
  }

  if (isMember) {
    return (
      <button
        onClick={handleLeave}
        disabled={loading}
        className="w-full py-2 px-4 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
      >
        {loading ? 'Leaving...' : 'Leave Community'}
      </button>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-sm shadow-purple-200 disabled:opacity-50"
    >
      {loading ? 'Joining...' : '+ Join Community'}
    </button>
  );
}
