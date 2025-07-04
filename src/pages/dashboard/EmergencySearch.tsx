import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmergencySearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency / Last Minute Search</h1>
          <p className="text-muted-foreground mt-1">Urgent housing solutions for immediate needs</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Immediate Housing Solutions</CardTitle>
          <CardDescription>Priority urgent listings and instant matches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Fast-track matching system for users facing immediate relocation needs, 
              emergencies, or last-minute housing requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}