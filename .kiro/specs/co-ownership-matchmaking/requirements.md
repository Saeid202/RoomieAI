# Requirements Document: Co-Ownership Matchmaking Engine

## Introduction

The Co-Ownership Matchmaking Engine is an AI-powered system that identifies and ranks compatible co-ownership partner pairs from the existing pool of active co-ownership profiles. It operates on a Complementary Financial Partnership Model — rewarding pairs where financial strengths offset weaknesses rather than simply matching similar profiles. The engine runs as a scheduled background agent, scores all viable profile pairs across five weighted dimensions, stores results with AI-generated briefings, and surfaces matches to users through a privacy-preserving reveal model.

## Glossary

- **Matchmaking_Engine**: The Supabase Edge Function that orchestrates the full match computation pipeline on a scheduled basis
- **Scoring_Engine**: The component responsible for computing the 0–100 compatibility score for a given profile pair
- **Hard_Filter**: A pre-scoring elimination rule that discards pairs that cannot form a viable co-ownership arrangement
- **Match_Pair**: A unique, ordered combination of two distinct active co-ownership profiles
- **Score_Tier**: A named classification of a match based on its total score (Exceptional, Strong, Good, Possible)
- **Financial_Complementarity**: The scoring dimension that rewards pairs where one partner's financial strengths offset the other's weaknesses
- **AI_Briefing**: A personalized, Gemini-generated natural language summary of why two profiles are compatible, tailored to each user's perspective
- **Partial_Profile**: The limited view of a matched user's profile visible before a chat connection is initiated
- **Full_Profile**: The complete profile including sensitive financial details, revealed only after a chat connection is initiated
- **Connection**: A tracked interaction state between two matched users (pending_chat, active_chat, declined, blocked)
- **Profile_Completeness**: A 0–100% score indicating how fully a co-ownership profile has been filled out
- **Budget_Overlap**: The intersection of two users' budget ranges expressed as a ratio of the overlap to the combined range
- **Down_Payment_Complementarity**: A measure of how well two users' combined down payments approach 20% of their shared budget midpoint
- **Income_Complementarity**: A measure rewarding pairs where high income is paired with high savings capacity
- **Credit_Score_Compatibility**: A tiered score based on the credit score ranges of both users
- **Ownership_Split**: A user's preferred equity division (e.g., 50/50, 60/40, 70/30, flexible)
- **Living_Arrangement**: A user's preferred occupancy model (e.g., live together, rent out, investment only, flexible)
- **Co_Ownership_Purpose**: A user's intended use of the co-owned property (e.g., primary residence, investment, vacation, flexible)
- **Match_Event**: An audit record of a single Matchmaking_Engine run, including timing, pair counts, and error state
- **Notification_System**: The existing in-app notification infrastructure used to alert users of new matches
- **RLS**: Row Level Security — PostgreSQL policies controlling which rows a user can read or write

---

## Requirements

### Requirement 1: Scheduled Match Computation

**User Story:** As a platform operator, I want the matchmaking engine to run automatically on a schedule, so that match data stays fresh without manual intervention.

#### Acceptance Criteria

1. THE Matchmaking_Engine SHALL run as a Supabase Edge Function triggered by a cron schedule every 6 hours
2. WHEN the Matchmaking_Engine starts a run, THE Matchmaking_Engine SHALL create a Match_Event record with status "running" and a start timestamp
3. WHEN the Matchmaking_Engine completes a run, THE Matchmaking_Engine SHALL update the Match_Event record with status "completed", an end timestamp, and counts of pairs evaluated, pairs scored, and matches stored
4. IF the Matchmaking_Engine encounters an unrecoverable error, THEN THE Matchmaking_Engine SHALL update the Match_Event record with status "failed" and a descriptive error message
5. THE Matchmaking_Engine SHALL process only profiles where is_active = true
6. THE Matchmaking_Engine SHALL generate all unique unordered pairs from the active profile pool before applying filters

---

### Requirement 2: Hard Filter — Pre-Scoring Elimination

**User Story:** As a platform operator, I want impossible or low-quality pairs eliminated before scoring, so that the scoring engine only processes viable candidates.

#### Acceptance Criteria

1. WHEN evaluating a pair, THE Matchmaking_Engine SHALL eliminate the pair if either profile has is_active = false
2. WHEN evaluating a pair, THE Matchmaking_Engine SHALL eliminate the pair if either profile has a profile_completeness below 40%
3. WHEN evaluating a pair, THE Matchmaking_Engine SHALL eliminate the pair if the two profiles have zero budget range overlap, unless either profile has a "flexible" budget indicator
4. WHERE a profile has "flexible" set on any filterable field, THE Matchmaking_Engine SHALL treat that field as passing all hard filter checks for that field
5. THE Matchmaking_Engine SHALL record the count of pairs eliminated by each filter type in the Match_Event record

---

### Requirement 3: Financial Complementarity Scoring (35 points)

**User Story:** As a seeker, I want to be matched with partners whose financial profile complements mine, so that together we can achieve what neither could alone.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute a Budget Overlap sub-score worth up to 10 points based on the ratio of the overlapping budget range to the combined budget range of both profiles
2. THE Scoring_Engine SHALL compute a Down Payment Complementarity sub-score worth up to 8 points based on how closely the sum of both users' down payments approaches 20% of the shared budget midpoint
3. THE Scoring_Engine SHALL compute an Income Complementarity sub-score worth up to 9 points that rewards pairs where one profile has high annual income and the other has high savings capacity
4. THE Scoring_Engine SHALL compute a Credit Score Compatibility sub-score worth up to 8 points using the following tiers: both profiles in the 700+ credit score range earns 8 points; one profile in 700+ and one in 650–699 earns 5 points; both profiles in 650–699 earns 3 points; all other combinations earn 0 points
5. THE Scoring_Engine SHALL sum the four Financial Complementarity sub-scores to produce a Financial Complementarity dimension score with a maximum of 35 points

---

### Requirement 4: Property Alignment Scoring (25 points)

**User Story:** As a seeker, I want to be matched with partners who are looking for similar properties in similar locations, so that we can realistically search together.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute a Location Overlap sub-score worth up to 10 points based on the ratio of shared entries in both profiles' preferred_locations arrays to the union of both arrays
2. THE Scoring_Engine SHALL compute a Property Type Overlap sub-score worth up to 8 points based on the ratio of shared entries in both profiles' property_types arrays to the union of both arrays
3. THE Scoring_Engine SHALL compute a Timeline Alignment sub-score worth up to 7 points based on the proximity of both profiles' purchase_timeline values, where identical timelines earn full points and adjacent timeline buckets earn partial points
4. THE Scoring_Engine SHALL sum the three Property Alignment sub-scores to produce a Property Alignment dimension score with a maximum of 25 points

---

### Requirement 5: Co-Ownership Structure Scoring (25 points)

**User Story:** As a seeker, I want to be matched with partners who share compatible co-ownership arrangements, so that we can agree on how to structure the purchase.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute an Ownership Split Compatibility sub-score worth up to 10 points; WHERE either profile has ownership_split = "flexible", THE Scoring_Engine SHALL award full points for that sub-score
2. THE Scoring_Engine SHALL compute a Living Arrangement Alignment sub-score worth up to 8 points based on the intersection of both profiles' living_arrangements arrays; WHERE either profile includes "flexible" in its living_arrangements, THE Scoring_Engine SHALL award full points for that sub-score
3. THE Scoring_Engine SHALL compute a Purpose Alignment sub-score worth up to 7 points based on the intersection of both profiles' co_ownership_purposes arrays; WHERE either profile includes "flexible" in its co_ownership_purposes, THE Scoring_Engine SHALL award full points for that sub-score
4. THE Scoring_Engine SHALL sum the three Co-Ownership Structure sub-scores to produce a Co-Ownership Structure dimension score with a maximum of 25 points

---

### Requirement 6: Profile Quality Signal Scoring (10 points)

**User Story:** As a platform operator, I want matches between well-completed profiles to rank higher, so that users are connected with serious, detailed candidates.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute a Profile Quality Signal score worth up to 10 points based on the average profile_completeness of both profiles in the pair, scaled linearly from 0 to 10

---

### Requirement 7: Complementary Strength Bonus (5 points)

**User Story:** As a seeker, I want the system to recognize and reward genuinely complementary financial pairings, so that the best partnerships are surfaced first.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute a Complementary Strength Bonus worth up to 5 points using stackable bonuses for complementary financial pairs
2. THE Scoring_Engine SHALL award a bonus when one profile has high annual income and the other has a high down payment amount
3. THE Scoring_Engine SHALL award a bonus when one profile has a high credit score range and the other has a high savings-to-income ratio
4. THE Scoring_Engine SHALL cap the total Complementary Strength Bonus at 5 points regardless of how many bonus conditions are met

---

### Requirement 8: Total Score Computation and Tier Assignment

**User Story:** As a platform operator, I want each match pair assigned a score tier, so that the UI and notification system can treat different quality matches appropriately.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL compute a total score by summing all five dimension scores: Financial Complementarity (max 35) + Property Alignment (max 25) + Co-Ownership Structure (max 25) + Profile Quality Signal (max 10) + Complementary Strength Bonus (max 5), for a maximum total of 100 points
2. WHEN the total score is between 90 and 100 inclusive, THE Scoring_Engine SHALL assign the tier "Exceptional Match"
3. WHEN the total score is between 75 and 89 inclusive, THE Scoring_Engine SHALL assign the tier "Strong Match"
4. WHEN the total score is between 60 and 74 inclusive, THE Scoring_Engine SHALL assign the tier "Good Match"
5. WHEN the total score is between 45 and 59 inclusive, THE Scoring_Engine SHALL assign the tier "Possible Match"
6. WHEN the total score is below 45, THE Scoring_Engine SHALL not store the pair as a match and SHALL not surface it to users

---

### Requirement 9: Match Storage

**User Story:** As a platform operator, I want computed match results stored persistently, so that the frontend can query them without re-running the scoring engine on every request.

#### Acceptance Criteria

1. THE Matchmaking_Engine SHALL upsert each scored pair into the co_ownership_matches table, keyed on the ordered pair of (user_id_1, user_id_2)
2. THE co_ownership_matches table SHALL store: user_id_1, user_id_2, total_score, score_tier, dimension scores for each of the five dimensions, ai_briefing_user_1, ai_briefing_user_2, gap_analysis, computed_at timestamp, and match metadata
3. WHEN a pair is re-scored in a subsequent engine run, THE Matchmaking_Engine SHALL update the existing record rather than insert a duplicate
4. THE co_ownership_matches table SHALL enforce that user_id_1 < user_id_2 to guarantee a canonical ordering for each pair

---

### Requirement 10: AI Briefing Generation

**User Story:** As a seeker with a strong match, I want to receive a personalized AI-written explanation of why my match is compatible, so that I can quickly understand the opportunity.

#### Acceptance Criteria

1. WHEN a pair scores 75 or above, THE Matchmaking_Engine SHALL generate an AI_Briefing for each user in the pair using the Gemini API
2. THE AI_Briefing for user_1 SHALL be written from user_1's perspective, explaining what makes user_2 a strong complement to their financial and property goals
3. THE AI_Briefing for user_2 SHALL be written from user_2's perspective, explaining what makes user_1 a strong complement to their financial and property goals
4. THE Matchmaking_Engine SHALL store both AI_Briefings in the co_ownership_matches record
5. IF the Gemini API call fails, THEN THE Matchmaking_Engine SHALL store the match record without briefings and SHALL log the failure in the Match_Event record without aborting the full run
6. THE Matchmaking_Engine SHALL generate a gap_analysis for pairs scoring between 45 and 74, identifying the dimensions with the lowest sub-scores

---

### Requirement 11: In-App Notifications for Strong Matches

**User Story:** As a seeker with a new strong match, I want to be notified immediately, so that I don't miss a high-quality connection.

#### Acceptance Criteria

1. WHEN a pair scores 90 or above (Exceptional Match), THE Matchmaking_Engine SHALL send an in-app notification to both users via the existing Notification_System immediately after the match is stored
2. WHEN a pair scores between 75 and 89 (Strong Match), THE Matchmaking_Engine SHALL send an in-app notification to both users via the existing Notification_System
3. THE notification SHALL include the score tier and a brief summary drawn from the AI_Briefing
4. IF a notification fails to send, THEN THE Matchmaking_Engine SHALL log the failure and continue processing remaining matches without aborting the run
5. THE Matchmaking_Engine SHALL not send duplicate notifications for a pair that was already notified in a previous engine run unless the score tier has changed

---

### Requirement 12: Privacy-Preserving Profile Reveal

**User Story:** As a seeker browsing matches, I want to see enough information to decide whether to connect, without exposing sensitive financial details until I choose to engage.

#### Acceptance Criteria

1. WHEN a user views their match list, THE System SHALL display only the Partial_Profile for each match: age range, occupation, why_co_ownership, approximate budget range, location preferences, co_ownership_purpose, living_arrangement, and compatibility score
2. THE System SHALL not expose exact financial figures (annual_income, down_payment, credit_score_range) in the Partial_Profile view
3. WHEN a user initiates a chat connection with a match, THE System SHALL reveal the Full_Profile including all financial details to both parties
4. THE System SHALL enforce the partial/full reveal distinction at the service layer, not solely at the UI layer
5. THE System SHALL allow a user to reach out to any match without requiring mutual interest first

---

### Requirement 13: Connection Tracking

**User Story:** As a seeker, I want my interactions with matches tracked, so that I can manage my connections and the system can personalize my experience.

#### Acceptance Criteria

1. THE System SHALL record a Connection record in the co_ownership_connections table when a user initiates contact with a match
2. THE co_ownership_connections table SHALL support the following states: pending_chat, active_chat, declined, blocked
3. WHEN a user declines a match, THE System SHALL update the Connection state to "declined" and SHALL not surface that match again in the user's match list
4. WHEN a user blocks another user, THE System SHALL update the Connection state to "blocked" and SHALL exclude that user from all future match results for both parties
5. WHEN both users in a Connection reach the active_chat state, THE Matchmaking_Engine SHALL send a co-ownership education brief covering legal considerations and next steps in Canada

---

### Requirement 14: Match List Query and RLS

**User Story:** As a seeker, I want to query only my own matches, so that my match data is private and secure.

#### Acceptance Criteria

1. THE System SHALL implement RLS policies on co_ownership_matches such that a user can only read rows where they are user_id_1 OR user_id_2
2. THE System SHALL implement RLS policies on co_ownership_connections such that a user can only read or write rows where they are the initiating or receiving user
3. THE System SHALL implement RLS policies on co_ownership_match_events such that only service-role callers can write, and admin users can read
4. WHEN a user queries their match list, THE System SHALL return matches ordered by total_score descending
5. THE System SHALL not return matches with a score below 45 in any user-facing query

---

### Requirement 15: Match Audit Trail

**User Story:** As a platform operator, I want a complete audit trail of every engine run, so that I can diagnose issues and monitor system health.

#### Acceptance Criteria

1. THE co_ownership_match_events table SHALL record: run_id, started_at, completed_at, status, total_active_profiles, total_pairs_evaluated, total_pairs_filtered, total_pairs_scored, total_matches_stored, total_notifications_sent, total_briefings_generated, error_message
2. THE Matchmaking_Engine SHALL write one Match_Event record per run
3. WHEN the Matchmaking_Engine is run manually by an operator, THE Matchmaking_Engine SHALL still create a Match_Event record with a "manual" trigger type
4. THE System SHALL retain Match_Event records for a minimum of 90 days

---

### Requirement 16: Score Determinism and Round-Trip Consistency

**User Story:** As a platform operator, I want the scoring engine to produce consistent, reproducible results, so that re-running the engine on the same data yields the same scores.

#### Acceptance Criteria

1. THE Scoring_Engine SHALL produce identical scores when given the same two profile inputs regardless of the order in which the profiles are passed
2. FOR ALL valid profile pairs, running the Scoring_Engine twice on the same pair SHALL produce the same total_score and score_tier (idempotence property)
3. THE Scoring_Engine SHALL not use any non-deterministic inputs (e.g., random numbers, current timestamps) in score computation
4. WHEN the Matchmaking_Engine re-processes a pair whose underlying profiles have not changed, THE Matchmaking_Engine SHALL produce the same score as the previous run

---

### Requirement 17: Education Brief on Active Chat

**User Story:** As a seeker who has started chatting with a match, I want to receive relevant co-ownership education, so that I can make informed decisions about proceeding.

#### Acceptance Criteria

1. WHEN both users in a Connection transition to active_chat state, THE System SHALL trigger delivery of a co-ownership education brief to both users via the Notification_System
2. THE education brief SHALL cover legal considerations for co-ownership in Canada, including title structures and co-ownership agreements
3. THE education brief SHALL include recommended next steps for proceeding with a co-ownership purchase
4. THE System SHALL deliver the education brief only once per Connection, not on every message exchange
