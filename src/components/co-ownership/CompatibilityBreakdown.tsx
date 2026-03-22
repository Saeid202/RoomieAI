import { Progress } from "@/components/ui/progress";

interface CompatibilityBreakdownProps {
  financialScore: number;
  propertyScore: number;
  structureScore: number;
  qualityScore: number;
  bonusScore: number;
  totalScore: number;
  aiBriefing: string | null;
  gapAnalysis: string | null;
}

const DIMENSIONS = [
  { label: "Financial Compatibility", max: 35, key: "financialScore" as const },
  { label: "Property Alignment", max: 25, key: "propertyScore" as const },
  { label: "Co-Ownership Structure", max: 25, key: "structureScore" as const },
  { label: "Profile Quality", max: 10, key: "qualityScore" as const },
  { label: "Complementary Bonus", max: 5, key: "bonusScore" as const },
];

export function CompatibilityBreakdown({
  financialScore,
  propertyScore,
  structureScore,
  qualityScore,
  bonusScore,
  totalScore,
  aiBriefing,
  gapAnalysis,
}: CompatibilityBreakdownProps) {
  const scores: Record<string, number> = {
    financialScore,
    propertyScore,
    structureScore,
    qualityScore,
    bonusScore,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Compatibility Breakdown</h3>

      <div className="space-y-3">
        {DIMENSIONS.map(({ label, max, key }) => {
          const score = scores[key];
          const pct = Math.round((score / max) * 100);
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>
                  {score}/{max}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </div>

      {aiBriefing && (
        <div className="rounded-md bg-primary/10 border border-primary/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-primary">Why you're a strong match</p>
          <p className="text-xs text-foreground leading-relaxed">{aiBriefing}</p>
        </div>
      )}

      {gapAnalysis && (
        <div className="rounded-md bg-muted border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Areas to discuss</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{gapAnalysis}</p>
        </div>
      )}
    </div>
  );
}
