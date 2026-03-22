# Implementation Plan: Co-Ownership Matchmaking Engine

## Overview

Implement the full co-ownership matchmaking pipeline: database schema, Supabase Edge Function scoring engine, TypeScript types, frontend service layer, and React UI components. Tasks are ordered database → Edge Function → types/service → frontend → tests.

## Tasks

- [x] 1. Create database migration for all three tables
  - Create `supabase/migrations/20260360_create_co_ownership_matchmaking_tables.sql`
  - Define `co_ownership_matches` with all columns, CHECK constraints (`user_id_1 < user_id_2`, score bounds), UNIQUE constraint on `(user_id_1, user_id_2)`, and indexes on `user_id_1`, `user_id_2`, `total_score DESC`
  - Define `co_ownership_connections` with state enum CHECK, UNIQUE on `(user_id_1, user_id_2)`, CHECK `user_id_1 < user_id_2`, and indexes
  - Define `co_ownership_match_events` with all audit count columns, `filter_counts JSONB`, and index on `started_at DESC`
  - Apply all RLS policies from the design: `users_read_own_matches`, `service_role_write_matches`, `users_read_own_connections`, `users_insert_connections`, `users_update_own_connections`, `service_role_all_events`
  - Add a comment block at the top of the migration noting that pg_cron setup for the 6-hour schedule and 90-day event retention must be configured manually in the Supabase dashboard
  - _Requirements: 9.1–9.4, 13.1–13.2, 14.1–14.3, 15.1, 15.4_

- [x] 2. Implement TypeScript types
  - Create `src/types/coOwnershipMatching.ts`
  - Define all interfaces from the design: `CoOwnershipProfile`, `ScoredPair`, `SubScores`, `ScoreTier`, `ConnectionState`, `Connection`, `PartialProfile`, `PartialMatchResult`, `FullMatchResult`, `FilterCounts`, `MatchEventCounts`
  - _Requirements: 9.2, 12.1, 13.2_

- [x] 3. Implement the scoring engine functions
  - Create `supabase/functions/co-ownership-matchmaking-engine/index.ts`
  - Implement `hasBudgetOverlap`, `applyHardFilters` with `FilterCounts` tracking exactly as specified in the design pseudocode
  - Implement `scoreBudgetOverlap` (0–10), `scoreDownPayment` (0–8), `scoreIncome` (0–9), `scoreCreditCompat` (0–8) with the exact thresholds from the design
  - Implement `scoreFinancial` summing the four sub-scores (max 35)
  - Implement `jaccardScore`, `scoreLocationOverlap` (0–10), `scorePropertyTypeOverlap` (0–8), `scoreTimeline` (0–7) with the exact diff→points mapping from the design
  - Implement `scoreProperty` summing the three sub-scores (max 25)
  - Implement `scoreOwnershipSplit` (0–10), `scoreLivingArrangement` (0–8), `scorePurpose` (0–7) with flexible pass-through logic
  - Implement `scoreStructure` summing the three sub-scores (max 25)
  - Implement `scoreQuality` (0–10) as average completeness scaled linearly
  - Implement `scoreBonus` (0–5) with three stackable conditions capped at 5
  - Implement `scorePair` composing all five dimensions into a `ScoredPair`
  - Implement `assignTier` returning the correct `ScoreTier` or null for scores below 45
  - _Requirements: 3.1–3.5, 4.1–4.4, 5.1–5.4, 6.1, 7.1–7.4, 8.1–8.6_

  - [ ]* 3.1 Write property test: pair generation count (Property 1)
    - Use `fc.array(arbitraryProfile(), {minLength: 2})` → assert pair count equals N*(N-1)/2
    - Tag: `// Feature: co-ownership-matchmaking, Property 1`
    - _Validates: Requirements 1.6_

  - [ ]* 3.2 Write property test: hard filter low-completeness elimination (Property 2)
    - Generate pairs where at least one profile has `profile_completeness < 40` → assert eliminated
    - Tag: `// Feature: co-ownership-matchmaking, Property 2`
    - _Validates: Requirements 2.2_

  - [ ]* 3.3 Write property test: hard filter budget overlap with flexible pass-through (Property 3)
    - Non-overlapping budgets → eliminated; flexible budget indicator → survives
    - Tag: `// Feature: co-ownership-matchmaking, Property 3`
    - _Validates: Requirements 2.3, 2.4_

  - [ ]* 3.4 Write property test: all dimension scores within declared bounds (Property 4)
    - Use `arbitraryEligiblePair()` → assert financial ∈ [0,35], property ∈ [0,25], structure ∈ [0,25], quality ∈ [0,10], bonus ∈ [0,5], each sub-score within its own max
    - Tag: `// Feature: co-ownership-matchmaking, Property 4`
    - _Validates: Requirements 3.1–3.5, 4.1–4.4, 5.1–5.4, 6.1, 7.1, 7.4_

  - [ ]* 3.5 Write property test: total score bounded and correctly summed (Property 5)
    - Use `arbitraryEligiblePair()` → assert total equals sum of five dimensions and is in [0,100]
    - Tag: `// Feature: co-ownership-matchmaking, Property 5`
    - _Validates: Requirements 8.1_

  - [ ]* 3.6 Write property test: tier assignment correct and exhaustive (Property 6)
    - Use `fc.float({min:0, max:100})` → assert tier matches threshold boundaries exactly
    - Tag: `// Feature: co-ownership-matchmaking, Property 6`
    - _Validates: Requirements 8.2–8.6_

  - [ ]* 3.7 Write property test: scoring symmetry (Property 7)
    - Use `arbitraryEligiblePair()` → assert `scorePair(A,B).totalScore === scorePair(B,A).totalScore`
    - Tag: `// Feature: co-ownership-matchmaking, Property 7`
    - _Validates: Requirements 16.1_

  - [ ]* 3.8 Write property test: scoring idempotence (Property 8)
    - Use `arbitraryEligiblePair()` → assert calling `scorePair` twice yields identical `totalScore` and `tier`
    - Tag: `// Feature: co-ownership-matchmaking, Property 8`
    - _Validates: Requirements 16.2, 16.3, 16.4_

- [x] 4. Implement Edge Function orchestration
  - Implement `fetchEligibleProfiles` querying `co_ownership_profiles` where `is_active = true`
  - Implement `generatePairs` producing all N*(N-1)/2 unique unordered pairs
  - Implement `buildBriefingPrompt` using the exact prompt template from the design
  - Implement `generateBriefing` calling the Gemini API; on failure log via shared logger and return null without aborting
  - Implement `sendMatchNotification` inserting into the existing notifications table; on failure log and continue
  - Implement the main `serve` handler: create Match_Event with status "running", run the full pipeline, upsert matches into `co_ownership_matches` keyed on ordered `(user_id_1, user_id_2)`, send notifications for scores ≥ 75 skipping pairs already notified at the same tier, update Match_Event to "completed" with all counts; wrap in try/catch to set status "failed" on unrecoverable error
  - Generate AI briefings only for pairs scoring ≥ 75; generate gap_analysis text for pairs scoring 45–74
  - Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars; import logger from `../_shared/logger.ts`
  - _Requirements: 1.1–1.6, 2.1–2.5, 9.1–9.3, 10.1–10.6, 11.1–11.5, 15.1–15.3_

- [x] 5. Checkpoint — Ensure scoring engine and Edge Function compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement frontend service layer
  - Create `src/services/coOwnershipMatchingService.ts`
  - Implement `toPartialProfile` stripping `annual_income`, `down_payment`, `credit_score_range`, `budget_min`, `budget_max` and rounding budget to nearest $50K
  - Implement `getMyMatches(userId)` querying `co_ownership_matches` ordered by `total_score DESC`, joining partial profile data, filtering out declined/blocked connections; returns `PartialMatchResult[]`
  - Implement `getFullMatchProfile(userId, matchUserId)` returning full profile only when a `co_ownership_connections` row with `state = 'active_chat'` exists for the pair; otherwise returns null
  - Implement `initiateConnection(userId, matchUserId)` inserting into `co_ownership_connections` with canonical ordering (`user_id_1 < user_id_2`)
  - Implement `updateConnectionState(connectionId, userId, newState)` updating the connection row
  - Implement `getMyConnections(userId)` returning all connections for the user
  - Use `supabase` client from `@/integrations/supabase/client`
  - _Requirements: 12.1–12.5, 13.1–13.5, 14.4–14.5_

  - [ ]* 6.1 Write property test: partial profile excludes sensitive financial fields (Property 11)
    - Call `toPartialProfile` on arbitrary profiles → assert no `annual_income`, `down_payment`, `credit_score_range`; assert budget rounded to nearest $50K
    - Tag: `// Feature: co-ownership-matchmaking, Property 11`
    - _Validates: Requirements 12.1, 12.2_

  - [ ]* 6.2 Write property test: full profile gated on active_chat (Property 12)
    - Mock connection state as non-active_chat → assert `getFullMatchProfile` returns null
    - Tag: `// Feature: co-ownership-matchmaking, Property 12`
    - _Validates: Requirements 12.3, 12.4_

  - [ ]* 6.3 Write property test: connection state filters match list (Property 13)
    - Declined/blocked connections → assert those users absent from match list; blocked is bidirectional
    - Tag: `// Feature: co-ownership-matchmaking, Property 13`
    - _Validates: Requirements 13.3, 13.4_

  - [ ]* 6.4 Write property test: match list ordered by score descending (Property 14)
    - Assert `results[i].totalScore >= results[i+1].totalScore` for all i
    - Tag: `// Feature: co-ownership-matchmaking, Property 14`
    - _Validates: Requirements 14.4_

  - [ ]* 6.5 Write unit tests for service layer
    - Test `toPartialProfile` with known inputs
    - Test `initiateConnection` enforces canonical ordering
    - Test `getFullMatchProfile` returns null when no active_chat row exists
    - _Requirements: 12.1–12.4, 13.1_

- [ ] 7. Implement frontend components
  - [x] 7.1 Create `src/components/co-ownership/CompatibilityBreakdown.tsx`
    - Render progress bars for each of the five dimension scores vs. their max (35/25/25/10/5)
    - Show AI briefing text when `aiBriefing` is non-null (score ≥ 75)
    - Show gap analysis text when `gapAnalysis` is non-null (score 45–74)
    - _Requirements: 12.1_

  - [x] 7.2 Create `src/components/co-ownership/MatchCard.tsx`
    - Display partial profile fields: age range, occupation, why_co_ownership, approx budget, preferred locations, co-ownership purposes, living arrangements
    - Show total score and tier badge (Exceptional / Strong / Good / Possible)
    - Show connection state badge (pending, active, declined)
    - "Connect" button calls `initiateConnection()`; "Decline" button calls `updateConnectionState(..., 'declined')`
    - Embed `<CompatibilityBreakdown>` for score details
    - _Requirements: 12.1, 12.2, 13.1_

  - [x] 7.3 Create `src/pages/dashboard/CoOwnershipMatches.tsx`
    - Fetch matches via `getMyMatches(userId)` on mount
    - Render list of `<MatchCard>` components sorted by score descending
    - Show empty state when no matches exist
    - Show loading skeleton while fetching
    - _Requirements: 12.1, 14.4, 14.5_

- [x] 8. Wire up routing and navigation
  - Add route `/dashboard/co-ownership-matches` pointing to `CoOwnershipMatches` page in `src/App.tsx`
  - Add "Matches" navigation link in the co-ownership section of the dashboard navigation component
  - _Requirements: 12.1_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- pg_cron schedule (`SELECT cron.schedule('co-ownership-matchmaking', '0 */6 * * *', ...)`) and the 90-day retention job must be configured manually in the Supabase dashboard — they cannot be automated via migration
- Property tests use fast-check; unit tests use Vitest — both live in `src/tests/coOwnershipScoring.test.ts`
- The Edge Function uses the service role key and must never be called from the browser
- Canonical pair ordering (`user_id_1 < user_id_2`) must be enforced both in the DB CHECK constraint and in application code before any insert
