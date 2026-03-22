// Co-Ownership Matchmaking Engine — Supabase Edge Function
// Types are defined inline (Deno Edge Function cannot import from src/)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logger } from "../_shared/logger.ts";

// ─── Inline Types ────────────────────────────────────────────────────────────

interface CoOwnershipProfile {
  id: string;
  user_id: string;
  budget_min: number;
  budget_max: number;
  down_payment: number;
  annual_income: number;
  credit_score_range: string; // e.g. "700-749", "750+", "650-699", "flexible"
  property_types: string[];
  preferred_locations: string[];
  min_bedrooms: number;
  purchase_timeline: string; // "0-3 months" | "3-6 months" | "6-12 months" | "12+ months"
  ownership_split: string;   // "50/50" | "60/40" | "70/30" | "flexible"
  living_arrangements: string[];
  co_ownership_purposes: string[];
  age_range: string;
  occupation: string;
  why_co_ownership: string;
  profile_completeness: number;
  is_active: boolean;
}

type ScoreTier = 'exceptional' | 'strong' | 'good' | 'possible';

interface SubScores {
  budgetOverlap: number;
  downPaymentComp: number;
  incomeComp: number;
  creditCompat: number;
  locationOverlap: number;
  propertyTypeOverlap: number;
  timelineAlignment: number;
  ownershipSplit: number;
  livingArrangement: number;
  purposeAlignment: number;
}

interface ScoredPair {
  profile1: CoOwnershipProfile;
  profile2: CoOwnershipProfile;
  totalScore: number;
  tier: ScoreTier;
  financialScore: number;
  propertyScore: number;
  structureScore: number;
  qualityScore: number;
  bonusScore: number;
  subScores: SubScores;
}

interface FilterCounts {
  inactive: number;
  lowCompleteness: number;
  noBudgetOverlap: number;
}

// ─── Hard Filters ────────────────────────────────────────────────────────────

export function hasBudgetOverlap(a: CoOwnershipProfile, b: CoOwnershipProfile): boolean {
  const overlapMin = Math.max(a.budget_min, b.budget_min);
  const overlapMax = Math.min(a.budget_max, b.budget_max);
  return overlapMin <= overlapMax;
}

export function applyHardFilters(pairs: [CoOwnershipProfile, CoOwnershipProfile][]): { surviving: [CoOwnershipProfile, CoOwnershipProfile][]; filteredCounts: FilterCounts } {
  const counts: FilterCounts = { inactive: 0, lowCompleteness: 0, noBudgetOverlap: 0 };
  const surviving = pairs.filter(([a, b]) => {
    if (!a.is_active || !b.is_active) { counts.inactive++; return false; }
    if (a.profile_completeness < 40 || b.profile_completeness < 40) { counts.lowCompleteness++; return false; }
    if (!hasBudgetOverlap(a, b)) { counts.noBudgetOverlap++; return false; }
    return true;
  });
  return { surviving, filteredCounts: counts };
}

// ─── Dimension 1: Financial Complementarity (35 pts) ─────────────────────────

export function scoreBudgetOverlap(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  const overlapMin = Math.max(a.budget_min, b.budget_min);
  const overlapMax = Math.min(a.budget_max, b.budget_max);
  if (overlapMin > overlapMax) return 0;
  const overlapRange = overlapMax - overlapMin;
  const aRange = a.budget_max - a.budget_min;
  const bRange = b.budget_max - b.budget_min;
  const minRange = Math.min(aRange, bRange);
  if (minRange === 0) return overlapRange > 0 ? 10 : 0;
  const ratio = overlapRange / minRange;
  if (ratio > 0.5) return 10;
  if (ratio >= 0.25) return 6;
  return 2;
}

export function scoreDownPayment(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  const combined = a.down_payment + b.down_payment;
  const target = 0.20 * ((a.budget_max + b.budget_max) / 2);
  const ratio = target > 0 ? combined / target : 0;
  if (ratio >= 1.0) return 8;
  if (ratio >= 0.5) return 4;
  return 1;
}

export function isCredit700Plus(range: string): boolean {
  return range === '750+' || range === '700-749';
}

export function isCredit650to699(range: string): boolean {
  return range === '650-699';
}

export function isCredit750Plus(range: string): boolean {
  return range === '750+';
}

export function scoreIncome(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  const aHighIncome = a.annual_income > 120000;
  const bHighIncome = b.annual_income > 120000;
  const aHighSavings = a.down_payment > 100000;
  const bHighSavings = b.down_payment > 100000;
  if ((aHighIncome && bHighSavings) || (bHighIncome && aHighSavings)) return 9;
  if (aHighIncome && bHighIncome) return 6;
  const aModerate = a.annual_income >= 60000;
  const bModerate = b.annual_income >= 60000;
  if (aModerate && bModerate) return 4;
  if ((aHighIncome || aModerate) && !(bHighIncome || bModerate)) return 3;
  if ((bHighIncome || bModerate) && !(aHighIncome || aModerate)) return 3;
  return 0;
}

export function scoreCreditCompat(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  const aTop = isCredit700Plus(a.credit_score_range);
  const bTop = isCredit700Plus(b.credit_score_range);
  const aMid = isCredit650to699(a.credit_score_range);
  const bMid = isCredit650to699(b.credit_score_range);
  if (aTop && bTop) return 8;
  if ((aTop && bMid) || (bTop && aMid)) return 5;
  if (aMid && bMid) return 3;
  return 0;
}

export function scoreFinancial(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return scoreBudgetOverlap(a, b) + scoreDownPayment(a, b) + scoreIncome(a, b) + scoreCreditCompat(a, b);
}

// ─── Dimension 2: Property Alignment (25 pts) ────────────────────────────────

export function jaccardScore(arrA: string[], arrB: string[], maxPts: number): number {
  const setA = new Set(arrA);
  const setB = new Set(arrB);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...arrA, ...arrB]).size;
  return union === 0 ? 0 : (intersection / union) * maxPts;
}

export function scoreLocationOverlap(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return jaccardScore(a.preferred_locations, b.preferred_locations, 10);
}

export function scorePropertyTypeOverlap(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return jaccardScore(a.property_types, b.property_types, 8);
}

export function scoreTimeline(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  const order = ["0-3 months", "3-6 months", "6-12 months", "12+ months"];
  const iA = order.indexOf(a.purchase_timeline);
  const iB = order.indexOf(b.purchase_timeline);
  if (iA === -1 || iB === -1) return 0;
  const diff = Math.abs(iA - iB);
  if (diff === 0) return 7;
  if (diff === 1) return 4;
  if (diff === 2) return 1;
  return 0;
}

export function scoreProperty(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return scoreLocationOverlap(a, b) + scorePropertyTypeOverlap(a, b) + scoreTimeline(a, b);
}

// ─── Dimension 3: Co-Ownership Structure (25 pts) ────────────────────────────

export function areCompatibleSplits(splitA: string, splitB: string): boolean {
  // 60/40 and 40/60 are the same split
  const normalize = (s: string) => s.split('/').map(Number).sort((a, b) => b - a).join('/');
  return normalize(splitA) === normalize(splitB);
}

export function scoreOwnershipSplit(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  if (a.ownership_split === 'flexible' || b.ownership_split === 'flexible') return 10;
  if (a.ownership_split === b.ownership_split) return 10;
  if (areCompatibleSplits(a.ownership_split, b.ownership_split)) return 4;
  return 1;
}

export function scoreLivingArrangement(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  if (a.living_arrangements.includes('flexible') || b.living_arrangements.includes('flexible')) return 8;
  const intersection = a.living_arrangements.filter(x => b.living_arrangements.includes(x));
  if (intersection.length === 0) return 0;
  const isFullMatch = intersection.length === Math.max(a.living_arrangements.length, b.living_arrangements.length);
  return isFullMatch ? 8 : 4;
}

export function scorePurpose(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  if (a.co_ownership_purposes.includes('flexible') || b.co_ownership_purposes.includes('flexible')) return 7;
  const intersection = a.co_ownership_purposes.filter(x => b.co_ownership_purposes.includes(x));
  if (intersection.length === 0) return 0;
  const isFullMatch = intersection.length === Math.max(a.co_ownership_purposes.length, b.co_ownership_purposes.length);
  return isFullMatch ? 7 : 4;
}

export function scoreStructure(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return scoreOwnershipSplit(a, b) + scoreLivingArrangement(a, b) + scorePurpose(a, b);
}

// ─── Dimension 4: Profile Quality Signal (10 pts) ────────────────────────────

export function scoreQuality(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  return ((a.profile_completeness + b.profile_completeness) / 2) / 100 * 10;
}

// ─── Dimension 5: Complementary Strength Bonus (5 pts) ───────────────────────

export function scoreBonus(a: CoOwnershipProfile, b: CoOwnershipProfile): number {
  let bonus = 0;
  if ((a.annual_income > 120000 && b.down_payment > 100000) ||
      (b.annual_income > 120000 && a.down_payment > 100000)) bonus += 2;
  if ((isCredit750Plus(a.credit_score_range) && b.down_payment > 80000) ||
      (isCredit750Plus(b.credit_score_range) && a.down_payment > 80000)) bonus += 2;
  if ((a.purchase_timeline === '0-3 months' && b.purchase_timeline === 'flexible') ||
      (b.purchase_timeline === '0-3 months' && a.purchase_timeline === 'flexible')) bonus += 1;
  return Math.min(bonus, 5);
}

// ─── Tier Assignment ──────────────────────────────────────────────────────────

export function assignTier(score: number): ScoreTier | null {
  if (score >= 90) return 'exceptional';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'good';
  if (score >= 45) return 'possible';
  return null;
}

// ─── Pair Scorer ─────────────────────────────────────────────────────────────

export function scorePair(a: CoOwnershipProfile, b: CoOwnershipProfile): ScoredPair {
  const financialScore = scoreFinancial(a, b);
  const propertyScore = scoreProperty(a, b);
  const structureScore = scoreStructure(a, b);
  const qualityScore = scoreQuality(a, b);
  const bonusScore = scoreBonus(a, b);
  const totalScore = financialScore + propertyScore + structureScore + qualityScore + bonusScore;
  const tier = assignTier(totalScore)!;
  const subScores: SubScores = {
    budgetOverlap: scoreBudgetOverlap(a, b),
    downPaymentComp: scoreDownPayment(a, b),
    incomeComp: scoreIncome(a, b),
    creditCompat: scoreCreditCompat(a, b),
    locationOverlap: scoreLocationOverlap(a, b),
    propertyTypeOverlap: scorePropertyTypeOverlap(a, b),
    timelineAlignment: scoreTimeline(a, b),
    ownershipSplit: scoreOwnershipSplit(a, b),
    livingArrangement: scoreLivingArrangement(a, b),
    purposeAlignment: scorePurpose(a, b),
  };
  return { profile1: a, profile2: b, totalScore, tier, financialScore, propertyScore, structureScore, qualityScore, bonusScore, subScores };
}

// ─── Pair Generator ───────────────────────────────────────────────────────────

export function generatePairs(profiles: CoOwnershipProfile[]): [CoOwnershipProfile, CoOwnershipProfile][] {
  const pairs: [CoOwnershipProfile, CoOwnershipProfile][] = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      pairs.push([profiles[i], profiles[j]]);
    }
  }
  return pairs;
}

// ─── AI Briefing ──────────────────────────────────────────────────────────────

export function buildBriefingPrompt(subject: CoOwnershipProfile, match: CoOwnershipProfile, score: ScoredPair): string {
  return `You are a co-ownership partnership advisor. Write a personalized 150-200 word briefing for ${subject.occupation} (${subject.age_range}) explaining why their match is a strong financial complement.

Subject's profile: budget ${subject.budget_min}–${subject.budget_max}, down payment ${subject.down_payment}, income ${subject.annual_income}, credit ${subject.credit_score_range}, timeline ${subject.purchase_timeline}, locations: ${subject.preferred_locations.join(', ')}.

Match's profile: budget ${match.budget_min}–${match.budget_max}, down payment ${match.down_payment}, income ${match.annual_income}, credit ${match.credit_score_range}, timeline ${match.purchase_timeline}, locations: ${match.preferred_locations.join(', ')}.

Compatibility score: ${score.totalScore}/100 (${score.tier}). Financial: ${score.financialScore}/35, Property: ${score.propertyScore}/25, Structure: ${score.structureScore}/25.

Focus on the complementary financial partnership angle. Be specific about what makes this pairing strong. Do not mention exact dollar amounts from the match's profile. Max 200 words.`;
}

export async function generateBriefing(
  subject: CoOwnershipProfile,
  match: CoOwnershipProfile,
  score: ScoredPair,
  apiKey: string
): Promise<string | null> {
  try {
    const prompt = buildBriefingPrompt(subject, match, score);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    logger.error('Gemini briefing failed', { pair: [subject.user_id, match.user_id], err });
    return null;
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function sendMatchNotification(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  matchUserId: string,
  tier: ScoreTier,
  briefingSummary: string
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'co_ownership_match',
      title: `New ${tier} co-ownership match`,
      message: briefingSummary || `You have a new ${tier} co-ownership match.`,
      metadata: { match_user_id: matchUserId, tier },
      read: false,
    });
  } catch (err) {
    logger.error('Notification failed', { userId, matchUserId, err });
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? '';

  // Determine trigger type
  const triggerType = req.headers.get('x-trigger-type') === 'manual' ? 'manual' : 'scheduled';

  // 1. Create Match_Event record with status "running"
  const { data: eventRow, error: eventErr } = await supabase
    .from('co_ownership_match_events')
    .insert({ status: 'running', trigger_type: triggerType })
    .select('id')
    .single();

  if (eventErr || !eventRow) {
    logger.error('Failed to create match event', { eventErr });
    return new Response(JSON.stringify({ error: 'Failed to create match event' }), { status: 500 });
  }

  const eventId = eventRow.id;

  try {
    // 2. Fetch active profiles
    const { data: profiles, error: profilesErr } = await supabase
      .from('co_ownership_profiles')
      .select('*')
      .eq('is_active', true);

    if (profilesErr) throw new Error(`Failed to fetch profiles: ${profilesErr.message}`);

    const activeProfiles: CoOwnershipProfile[] = profiles ?? [];
    const totalActiveProfiles = activeProfiles.length;

    // 3. Generate all pairs
    const allPairs = generatePairs(activeProfiles);
    const totalPairsEvaluated = allPairs.length;

    // 4. Apply hard filters
    const { surviving, filteredCounts } = applyHardFilters(allPairs);
    const totalPairsFiltered = totalPairsEvaluated - surviving.length;

    // 5. Score each surviving pair
    let totalMatchesStored = 0;
    let totalNotificationsSent = 0;
    let totalBriefingsGenerated = 0;
    let totalPairsScored = 0;

    for (const [a, b] of surviving) {
      const scored = scorePair(a, b);
      const tier = assignTier(scored.totalScore);
      if (!tier) continue; // below 45 — discard

      totalPairsScored++;

      // Canonical ordering
      const [uid1, uid2] = a.user_id < b.user_id ? [a, b] : [b, a];

      // 6. Generate AI briefings for score >= 75
      let briefing1: string | null = null;
      let briefing2: string | null = null;
      let gapAnalysis: string | null = null;

      if (scored.totalScore >= 75 && geminiApiKey) {
        briefing1 = await generateBriefing(uid1, uid2, scored, geminiApiKey);
        briefing2 = await generateBriefing(uid2, uid1, scored, geminiApiKey);
        if (briefing1) totalBriefingsGenerated++;
        if (briefing2) totalBriefingsGenerated++;
      } else if (scored.totalScore >= 45 && scored.totalScore < 75) {
        // Generate gap analysis for 45-74 range
        const lowestDims = [
          { name: 'Financial', score: scored.financialScore, max: 35 },
          { name: 'Property', score: scored.propertyScore, max: 25 },
          { name: 'Structure', score: scored.structureScore, max: 25 },
          { name: 'Quality', score: scored.qualityScore, max: 10 },
        ].sort((a, b) => (a.score / a.max) - (b.score / b.max)).slice(0, 2);
        gapAnalysis = `Lowest scoring dimensions: ${lowestDims.map(d => `${d.name} (${d.score}/${d.max})`).join(', ')}.`;
      }

      // 7. Upsert match record
      const { error: upsertErr } = await supabase
        .from('co_ownership_matches')
        .upsert({
          user_id_1: uid1.user_id,
          user_id_2: uid2.user_id,
          total_score: scored.totalScore,
          score_tier: tier,
          financial_score: scored.financialScore,
          property_score: scored.propertyScore,
          structure_score: scored.structureScore,
          quality_score: scored.qualityScore,
          bonus_score: scored.bonusScore,
          sub_scores: scored.subScores,
          ai_briefing_user_1: briefing1,
          ai_briefing_user_2: briefing2,
          gap_analysis: gapAnalysis,
          computed_at: new Date().toISOString(),
        }, { onConflict: 'user_id_1,user_id_2' });

      if (upsertErr) {
        logger.error('Failed to upsert match', { uid1: uid1.user_id, uid2: uid2.user_id, upsertErr });
        continue;
      }

      totalMatchesStored++;

      // 8. Send notifications for score >= 75 (skip if already notified at same tier)
      if (scored.totalScore >= 75) {
        const { data: existingMatch } = await supabase
          .from('co_ownership_matches')
          .select('notified_tier, notified_at')
          .eq('user_id_1', uid1.user_id)
          .eq('user_id_2', uid2.user_id)
          .single();

        const alreadyNotifiedAtSameTier = existingMatch?.notified_tier === tier;

        if (!alreadyNotifiedAtSameTier) {
          const summary1 = briefing1?.slice(0, 200) ?? `You have a new ${tier} co-ownership match.`;
          const summary2 = briefing2?.slice(0, 200) ?? `You have a new ${tier} co-ownership match.`;

          await sendMatchNotification(supabase, uid1.user_id, uid2.user_id, tier, summary1);
          await sendMatchNotification(supabase, uid2.user_id, uid1.user_id, tier, summary2);
          totalNotificationsSent += 2;

          // Update notified_at and notified_tier
          await supabase
            .from('co_ownership_matches')
            .update({ notified_at: new Date().toISOString(), notified_tier: tier })
            .eq('user_id_1', uid1.user_id)
            .eq('user_id_2', uid2.user_id);
        }
      }
    }

    // 9. Update Match_Event to "completed"
    await supabase
      .from('co_ownership_match_events')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_active_profiles: totalActiveProfiles,
        total_pairs_evaluated: totalPairsEvaluated,
        total_pairs_filtered: totalPairsFiltered,
        filter_counts: filteredCounts,
        total_pairs_scored: totalPairsScored,
        total_matches_stored: totalMatchesStored,
        total_notifications_sent: totalNotificationsSent,
        total_briefings_generated: totalBriefingsGenerated,
      })
      .eq('id', eventId);

    return new Response(JSON.stringify({
      status: 'completed',
      totalActiveProfiles,
      totalPairsEvaluated,
      totalPairsFiltered,
      totalPairsScored,
      totalMatchesStored,
      totalNotificationsSent,
      totalBriefingsGenerated,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Matchmaking engine failed', { eventId, err });

    await supabase
      .from('co_ownership_match_events')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq('id', eventId);

    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});
