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
      <Button variant="destructive" disabled size="sm">
        Banned
      </Button>
    );
  }

  if (isMember) {
    return (
      <Button variant="outline" size="sm" onClick={handleLeave} disabled={loading}>
        {loading ? 'Leaving...' : 'Leave Community'}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={handleJoin} disabled={loading}>
      {loading ? 'Joining...' : 'Join Community'}
    </Button>
  );
}
