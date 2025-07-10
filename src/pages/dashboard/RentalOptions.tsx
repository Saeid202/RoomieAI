import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RentalOptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Options</h1>
          <p className="text-muted-foreground mt-1">Browse all available properties listed on our platform</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Properties</CardTitle>
          <CardDescription>Explore rental properties with roommate matching opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Browse through all available rental properties on our platform. 
              Find the perfect place and get matched with compatible roommates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}