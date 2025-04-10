
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RentOpportunities() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Rental Opportunities</h1>
      <p className="text-muted-foreground">Find replacement opportunities for rentals.</p>
      
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
