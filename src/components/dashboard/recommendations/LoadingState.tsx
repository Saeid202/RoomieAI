
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
      <p className="text-muted-foreground">Finding your ideal matches...</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="bg-muted h-24" />
            <CardContent className="pt-6 space-y-4">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
