
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function RentOpportunities() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Opportunities</h1>
          <p className="text-muted-foreground mt-1">Find replacement opportunities for rentals.</p>
        </div>
        <Button className="flex items-center gap-2 bg-roomie-purple hover:bg-roomie-dark" asChild>
          <Link to="/dashboard/add-rental-listing">
            <Plus size={18} />
            Create Listing
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Opportunities</CardTitle>
          <CardDescription>People looking for replacement tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page shows listings from people who are looking to leave their rental and need a replacement tenant.</p>
        </CardContent>
      </Card>
    </div>
  );
}
