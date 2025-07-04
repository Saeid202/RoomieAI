import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkExchangePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Exchange Housing</h1>
          <p className="text-muted-foreground mt-1">Provide services in exchange for reduced rent or free housing</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Exchange Programs</CardTitle>
          <CardDescription>Exchange skills for housing - cleaning, tutoring, IT development, caregiving, pet sitting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Perfect for students, gig workers, and budget-conscious individuals. 
              Offer your skills (cleaning, tutoring, app development, caregiving, pet sitting) 
              in exchange for reduced or free housing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}