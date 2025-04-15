
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RentSavingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Rent Savings</h1>
      <p className="text-muted-foreground">Manage your rent savings and find ways to reduce your expenses.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Rent Savings</CardTitle>
          <CardDescription>Track how much you've saved by finding the right roommate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              We're working on a tool to help you calculate and track your rent savings.
              Check back soon for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
