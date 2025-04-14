
import { useState } from "react";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RoommateRecommendationsPage() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Force a remount of the component
    setTimeout(() => {
      setError(null);
      setIsRetrying(false);
    }, 100);
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="mb-6 text-muted-foreground">
              There was an error loading the roommate recommendations. 
              {error.message ? `: ${error.message}` : ''}
            </p>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <RoommateRecommendations onError={setError} />
    </div>
  );
}
