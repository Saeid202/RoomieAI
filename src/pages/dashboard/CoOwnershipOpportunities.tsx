
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoOwnershipOpportunitiesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Co-Ownership Opportunities</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Properties</CardTitle>
          <CardDescription>Properties currently available for co-ownership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Opportunities Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              We're in the process of adding co-ownership property listings.
              Please check back soon or complete your profile to get notified of new opportunities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
