import { supabase } from "@/integrations/supabase/client";
import type { CommunityAnalytics } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Get analytics for a community (admin only)
 */
export async function getCommunityAnalytics(communityId: string): Promise<CommunityAnalytics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [membersResult, postsResult, postsTodayResult, structuredResult] = await Promise.all([
    db
      .from('community_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('status', 'active'),

    db
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId),

    db
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .gte('created_at', todayIso),

    db
      .from('community_posts')
      .select('post_type')
      .eq('community_id', communityId)
      .neq('post_type', 'casual'),
  ]);

  const totalMembers = membersResult.count || 0;
  const totalPosts = postsResult.count || 0;
  const postsToday = postsTodayResult.count || 0;
  const structuredPosts = structuredResult.data?.length || 0;
  const casualPosts = totalPosts - structuredPosts;

  // Get most active users (top 5 by post count)
  const { data: userPostsData } = await db
    .from('community_posts')
    .select('user_id')
    .eq('community_id', communityId);

  const userPostCounts: Record<string, number> = {};
  for (const row of (userPostsData || []) as Array<{ user_id: string }>) {
    userPostCounts[row.user_id] = (userPostCounts[row.user_id] || 0) + 1;
  }

  const mostActiveUsers = Object.entries(userPostCounts)
    .map(([user_id, post_count]) => ({ user_id, post_count }))
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 5);

  return {
    community_id: communityId,
    total_members: totalMembers,
    total_posts: totalPosts,
    posts_today: postsToday,
    structured_posts: structuredPosts,
    casual_posts: casualPosts,
    most_active_users: mostActiveUsers,
  };
}

/**
 * Get analytics summary for all communities (admin only)
 */
export async function getAllCommunitiesAnalytics(): Promise<
  Array<{ community_id: string; name: string; total_members: number; total_posts: number }>
> {
  const { data: communities, error } = await db
    .from('communities')
    .select('id, name');

  if (error) {
    console.error("Error fetching communities for analytics:", error);
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }

  const results = await Promise.all(
    ((communities || []) as Array<{ id: string; name: string }>).map(async (community) => {
      const [membersResult, postsResult] = await Promise.all([
        db
          .from('community_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', community.id)
          .eq('status', 'active'),
        db
          .from('community_posts')
          .select('id', { count: 'exact', head: true })
          .eq('community_id', community.id),
      ]);

      return {
        community_id: community.id,
        name: community.name,
        total_members: membersResult.count || 0,
        total_posts: postsResult.count || 0,
      };
    })
  );

  return results;
}
