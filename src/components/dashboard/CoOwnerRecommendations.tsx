
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CoOwnerRecommendations() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Co-Owner Recommendations</h1>
      <p className="text-muted-foreground">Find potential co-owners for property ownership.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommended Co-Owners</CardTitle>
          <CardDescription>People interested in co-ownership</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is where your co-owner recommendations will be displayed based on your profile and preferences.</p>
        </CardContent>
      </Card>
    </div>
  );
}
