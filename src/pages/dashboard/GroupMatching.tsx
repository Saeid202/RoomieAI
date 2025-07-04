import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroupMatchingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Matching (Shared Household Builder)</h1>
          <p className="text-muted-foreground mt-1">Create or join groups to rent multi-bedroom units together</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Build Your Household</CardTitle>
          <CardDescription>Perfect for friends, students, or professionals wanting to live together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Create or join groups of 3-4+ people to rent larger homes or apartments together. 
              Ideal for friend groups, student housing, or professional co-living arrangements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}