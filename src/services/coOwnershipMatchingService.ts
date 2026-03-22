import { supabase } from '@/integrations/supabase/client';
import type {
  CoOwnershipProfile,
  PartialProfile,
  PartialMatchResult,
  FullMatchResult,
  Connection,
  ConnectionState,
  SubScores,
} from '@/types/coOwnershipMatching';

// Use a typed helper to query new tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Strip sensitive financial fields and round budget to nearest $50K
export function toPartialProfile(
  profile: CoOwnershipProfile & { user_id: string }
): PartialProfile {
  return {
    userId: profile.user_id,
    ageRange: profile.age_range,
    occupation: profile.occupation,
    whyCoOwnership: profile.why_co_ownership,
    approxBudgetMin: Math.round(profile.budget_min / 50000) * 50000,
    approxBudgetMax: Math.round(profile.budget_max / 50000) * 50000,
    preferredLocations: profile.preferred_locations,
    coOwnershipPurposes: profile.co_ownership_purposes,
    livingArrangements: profile.living_arrangements,
  };
}

// Returns matches for the current user, partial profile only (no financial details)
// Filters out declined/blocked connections, ordered by total_score DESC
export async function getMyMatches(userId: string): Promise<PartialMatchResult[]> {
  const { data: matches, error: matchError } = await db
    .from('co_ownership_matches')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .order('total_score', { ascending: false });

  if (matchError) throw matchError;
  if (!matches || matches.length === 0) return [];

  // Fetch all connections for this user to check declined/blocked states
  const { data: connections, error: connError } = await db
    .from('co_ownership_connections')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

  if (connError) throw connError;

  // Build a map: otherUserId -> connection
  const connectionMap = new Map<string, Connection>();
  for (const conn of (connections ?? []) as Connection[]) {
    const otherId = conn.user_id_1 === userId ? conn.user_id_2 : conn.user_id_1;
    connectionMap.set(otherId, conn);
  }

  const results: PartialMatchResult[] = [];

  for (const match of matches) {
    const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;

    // Skip declined or blocked (blocked is bidirectional)
    const connection = connectionMap.get(otherUserId) ?? null;
    if (connection && (connection.state === 'declined' || connection.state === 'blocked')) {
      continue;
    }

    // Fetch the other user's profile
    const { data: profileData, error: profileError } = await db
      .from('co_ownership_profiles')
      .select('*')
      .eq('user_id', otherUserId)
      .single();

    if (profileError || !profileData) continue;

    // Perspective-correct briefing
    const aiBriefing =
      userId === match.user_id_1
        ? (match.ai_briefing_user_1 ?? null)
        : (match.ai_briefing_user_2 ?? null);

    results.push({
      matchId: match.id,
      totalScore: match.total_score,
      tier: match.score_tier,
      financialScore: match.financial_score,
      propertyScore: match.property_score,
      structureScore: match.structure_score,
      qualityScore: match.quality_score,
      bonusScore: match.bonus_score,
      subScores: match.sub_scores as SubScores,
      aiBriefing,
      gapAnalysis: match.gap_analysis ?? null,
      partialProfile: toPartialProfile(profileData as CoOwnershipProfile & { user_id: string }),
      connectionState: connection ? connection.state : null,
    });
  }

  return results;
}

// Returns full profile for a specific match (only after connection is active_chat)
export async function getFullMatchProfile(
  userId: string,
  matchUserId: string
): Promise<FullMatchResult | null> {
  const uid1 = userId < matchUserId ? userId : matchUserId;
  const uid2 = userId < matchUserId ? matchUserId : userId;

  // Gate on active_chat connection
  const { data: connection, error: connError } = await db
    .from('co_ownership_connections')
    .select('*')
    .eq('user_id_1', uid1)
    .eq('user_id_2', uid2)
    .eq('state', 'active_chat')
    .maybeSingle();

  if (connError) throw connError;
  if (!connection) return null;

  const { data: match, error: matchError } = await db
    .from('co_ownership_matches')
    .select('*')
    .eq('user_id_1', uid1)
    .eq('user_id_2', uid2)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) return null;

  const { data: profileData, error: profileError } = await db
    .from('co_ownership_profiles')
    .select('*')
    .eq('user_id', matchUserId)
    .single();

  if (profileError || !profileData) return null;

  const aiBriefing =
    userId === match.user_id_1
      ? (match.ai_briefing_user_1 ?? null)
      : (match.ai_briefing_user_2 ?? null);

  return {
    matchId: match.id,
    totalScore: match.total_score,
    tier: match.score_tier,
    financialScore: match.financial_score,
    propertyScore: match.property_score,
    structureScore: match.structure_score,
    qualityScore: match.quality_score,
    bonusScore: match.bonus_score,
    subScores: match.sub_scores as SubScores,
    aiBriefing,
    gapAnalysis: match.gap_analysis ?? null,
    fullProfile: profileData as CoOwnershipProfile,
    connectionState: (connection as Connection).state,
  };
}

// Initiates a connection with canonical ordering (user_id_1 < user_id_2)
export async function initiateConnection(
  userId: string,
  matchUserId: string
): Promise<Connection> {
  const uid1 = userId < matchUserId ? userId : matchUserId;
  const uid2 = userId < matchUserId ? matchUserId : userId;

  const { data, error } = await db
    .from('co_ownership_connections')
    .insert({
      user_id_1: uid1,
      user_id_2: uid2,
      initiated_by: userId,
      state: 'pending_chat',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Connection;
}

// Updates connection state (declined, blocked, active_chat, pending_chat)
export async function updateConnectionState(
  connectionId: string,
  userId: string,
  newState: ConnectionState
): Promise<void> {
  const { error } = await db
    .from('co_ownership_connections')
    .update({
      state: newState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

  if (error) throw error;
}

// Returns all connections for the current user
export async function getMyConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await db
    .from('co_ownership_connections')
    .select('*')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

  if (error) throw error;
  return (data ?? []) as Connection[];
}
