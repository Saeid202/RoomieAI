import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompatibilityBreakdown } from "./CompatibilityBreakdown";
import type { PartialMatchResult, ScoreTier, ConnectionState } from "@/types/coOwnershipMatching";

interface MatchCardProps {
  match: PartialMatchResult;
  currentUserId: string;
  onConnect: (matchUserId: string) => Promise<void>;
  onDecline: (connectionId: string, matchUserId: string) => Promise<void>;
}

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${fmt(min)}–${fmt(max)}`;
}

function tierBadgeClass(tier: ScoreTier): string {
  switch (tier) {
    case "exceptional":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "strong":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "good":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "possible":
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function tierLabel(tier: ScoreTier): string {
  switch (tier) {
    case "exceptional": return "Exceptional Match";
    case "strong":      return "Strong Match";
    case "good":        return "Good Match";
    case "possible":    return "Possible Match";
  }
}

function connectionBadge(state: ConnectionState) {
  switch (state) {
    case "pending_chat":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case "active_chat":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>;
    case "declined":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
    case "blocked":
      return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Blocked</Badge>;
  }
}

export function MatchCard({ match, currentUserId: _currentUserId, onConnect, onDecline }: MatchCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const { partialProfile, totalScore, tier, connectionState, matchId } = match;

  const canConnect = connectionState === null;
  const canDecline = connectionState === null || connectionState === "pending_chat";

  async function handleConnect() {
    setConnecting(true);
    try {
      await onConnect(partialProfile.userId);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      await onDecline(matchId, partialProfile.userId);
    } finally {
      setDeclining(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {partialProfile.occupation}
              </span>
              <span className="text-xs text-muted-foreground">{partialProfile.ageRange}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${tierBadgeClass(tier)}`}
              >
                {tierLabel(tier)}
              </Badge>
              <span className="text-xs font-semibold text-foreground">
                {Math.round(totalScore)}/100
              </span>
              {connectionState && connectionBadge(connectionState)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Profile fields */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Why co-ownership
            </span>
            <p className="text-sm text-foreground mt-0.5 line-clamp-2">
              {partialProfile.whyCoOwnership}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Approx. Budget
              </span>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {formatBudget(partialProfile.approxBudgetMin, partialProfile.approxBudgetMax)}
              </p>
            </div>

            {partialProfile.preferredLocations.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Locations
                </span>
                <p className="text-sm text-foreground mt-0.5 line-clamp-2">
                  {partialProfile.preferredLocations.join(", ")}
                </p>
              </div>
            )}
          </div>

          {partialProfile.coOwnershipPurposes.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Purposes
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {partialProfile.coOwnershipPurposes.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {partialProfile.livingArrangements.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Living Arrangements
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {partialProfile.livingArrangements.map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compatibility breakdown (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="text-xs text-primary underline-offset-2 hover:underline focus:outline-none"
          >
            {showBreakdown ? "Hide" : "Show"} compatibility breakdown
          </button>
          {showBreakdown && (
            <div className="mt-3">
              <CompatibilityBreakdown
                financialScore={match.financialScore}
                propertyScore={match.propertyScore}
                structureScore={match.structureScore}
                qualityScore={match.qualityScore}
                bonusScore={match.bonusScore}
                totalScore={totalScore}
                aiBriefing={match.aiBriefing}
                gapAnalysis={match.gapAnalysis}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {(canConnect || canDecline) && (
          <div className="flex gap-2 pt-1">
            {canConnect && (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connecting}
                className="flex-1"
              >
                {connecting ? "Connecting…" : "Connect"}
              </Button>
            )}
            {canDecline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                disabled={declining}
                className={canConnect ? "" : "flex-1"}
              >
                {declining ? "Declining…" : "Decline"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
