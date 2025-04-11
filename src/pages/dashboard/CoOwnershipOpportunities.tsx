
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoOwnershipOpportunitiesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Co-Ownership Opportunities</h1>
        <Button className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark">
          <Plus size={18} />
          Create Listing
        </Button>
      </div>
      
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
