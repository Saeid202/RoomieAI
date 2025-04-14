
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function CoOwnershipOpportunitiesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Co-Ownership Opportunities</h1>
          <p className="text-muted-foreground mt-1">Find properties available for co-ownership</p>
        </div>
        <Button className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark" asChild>
          <Link to="/dashboard/profile/co-owner">
            <Plus size={18} />
            Create Listing
          </Link>
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
            {!user ? (
              <Button className="mt-6" asChild>
                <Link to="/auth">Login to Get Started</Link>
              </Button>
            ) : (
              <Button className="mt-6" asChild>
                <Link to="/dashboard/profile/co-owner">
                  Complete Your Co-Owner Profile
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
