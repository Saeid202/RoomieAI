import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShortTermPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Short Term / Temporary Housing</h1>
          <p className="text-muted-foreground mt-1">Housing for weeks or a few months</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Temporary Housing Solutions</CardTitle>
          <CardDescription>Perfect for interns, students, travelers, and remote workers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Specialized matching for short-term housing needs - ideal for internships, 
              travel assignments, temporary work relocations, or gap housing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}