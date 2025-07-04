import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanAheadMatchingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Ahead Smart Move In Matching</h1>
          <p className="text-muted-foreground mt-1">Match users whose moves are weeks or months away</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Smart Future Planning</CardTitle>
          <CardDescription>Align location, date, and purpose (school, work) for future moves</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Perfect for students starting new semesters, professionals relocating for work, 
              or anyone planning a move weeks or months in advance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}