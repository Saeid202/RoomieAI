
import { Card, CardContent } from "@/components/ui/card";

export default function FutureHousingPlan() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Plan your future housing needs and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
