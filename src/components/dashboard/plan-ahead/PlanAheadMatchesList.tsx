import { Calendar, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnrichedPlanAheadMatch } from "@/hooks/usePlanAheadMatches";

interface Props {
  matches: EnrichedPlanAheadMatch[];
}

export default function PlanAheadMatchesList({ matches }: Props) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {matches.map((m) => {
        const other = m.other_profile;
        const city = other?.current_city || other?.target_cities?.[0] || "Unknown";
        const date = other?.planned_move_date || "TBD";
        const score = Math.round(Number(m.compatibility_score || 0));

        return (
          <Card key={m.id} className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Potential match</CardTitle>
              <Badge variant="secondary">Score {score}</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{city}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Move by {date}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{(other?.target_cities || []).slice(0, 3).join(", ")}</span>
                </div>
              </div>

              {m.match_factors && (
                <div className="mt-3">
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-2">
                    {m.match_factors.city && (
                      <Badge variant="outline">City: {String(m.match_factors.city)}</Badge>
                    )}
                    {typeof m.match_factors.date_diff_days === "number" && (
                      <Badge variant="outline">Date diff: {m.match_factors.date_diff_days}d</Badge>
                    )}
                    {typeof m.match_factors.overlap_days === "number" && (
                      <Badge variant="outline">Overlap: {m.match_factors.overlap_days}d</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
