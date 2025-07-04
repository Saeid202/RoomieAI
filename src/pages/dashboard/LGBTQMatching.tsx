import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LGBTQMatchingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LGBTQ+ Inclusive Matching</h1>
          <p className="text-muted-foreground mt-1">Safe spaces for LGBTQ+ users to find accepting living arrangements</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Safe & Accepting Communities</CardTitle>
          <CardDescription>Filter and match based on shared values and safety preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              A dedicated safe space for LGBTQ+ individuals to find respectful, 
              accepting roommates and living arrangements with enhanced safety features 
              and inclusive matching algorithms.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}