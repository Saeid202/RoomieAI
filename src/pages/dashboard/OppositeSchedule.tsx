import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OppositeSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opposite Schedule Room Sharing</h1>
          <p className="text-muted-foreground mt-1">Pair users with complementary day/night work schedules</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Complementary Schedules</CardTitle>
          <CardDescription>Share costs while each enjoying privacy during different hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Perfect for matching day shift workers with night shift workers, 
              allowing each person to have the space to themselves during their off hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}