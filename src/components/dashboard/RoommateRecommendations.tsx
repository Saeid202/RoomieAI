
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RoommateRecommendations() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
      <p className="text-muted-foreground">Find your ideal roommate matches based on your preferences.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommended Roommates</CardTitle>
          <CardDescription>People who match your living preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is where your roommate recommendations will be displayed based on your profile and preferences.</p>
        </CardContent>
      </Card>
    </div>
  );
}
