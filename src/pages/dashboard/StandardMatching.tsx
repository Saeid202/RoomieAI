import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StandardMatchingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standard Roommate Matching</h1>
          <p className="text-muted-foreground mt-1">Connect with compatible roommates - no property involved</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find Your Perfect Roommate</CardTitle>
          <CardDescription>Connect with individuals looking for compatible roommates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              We're building the perfect matching system to connect you with compatible roommates 
              based on lifestyle, preferences, and compatibility scores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}