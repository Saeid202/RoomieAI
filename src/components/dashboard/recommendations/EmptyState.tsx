
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Roommate Recommendations</h1>
      <p className="text-muted-foreground">No matches found based on your preferences.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>
            We couldn't find any matches based on your current profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Try updating your preferences to see more potential matches:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Adjust your budget range</li>
            <li>Consider different locations</li>
            <li>Update your lifestyle preferences</li>
            <li>Change your roommate preferences</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.href = '/dashboard/roommate-recommendations'} className="w-full">
            Update Your Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
