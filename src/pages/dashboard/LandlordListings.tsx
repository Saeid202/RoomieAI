import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandlordListingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landlord / Realtor Listings</h1>
          <p className="text-muted-foreground mt-1">Browse professional property listings</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Professional Listings</CardTitle>
          <CardDescription>Full units from landlords and realtors with roommate matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Browse full units from professional landlords and realtors. 
              Apply individually or get matched with potential roommates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}