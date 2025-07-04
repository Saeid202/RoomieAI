import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListSpacePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List Your Space</h1>
          <p className="text-muted-foreground mt-1">Sublet part of your own home and find an ideal roommate</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Owned Property</CardTitle>
          <CardDescription>Rent out part of your home (e.g., living room in a condo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Perfect for homeowners looking to offset costs by sharing their space 
              with carefully matched, compatible roommates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}