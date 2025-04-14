
import { useState, useEffect } from "react";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/dashboard/recommendations/LoadingState";

export default function RoommateRecommendationsPage() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contentMounted, setContentMounted] = useState(false);

  // Simplified loading state without timeouts to prevent flashing
  useEffect(() => {
    document.title = "Find My Ideal Roommate";
    
    // Set content as mounted once to prevent remounting
    if (!contentMounted) {
      setContentMounted(true);
      
      // Use requestAnimationFrame for smoother loading
      requestAnimationFrame(() => {
        setIsLoading(false);
      });
    }
  }, [contentMounted]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    
    // Force a remount of the component
    setContentMounted(false);
  };

  if (isLoading) {
    return <LoadingState />;
  }

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

  // Stable render with no transitions once loaded
  return (
    <div className="container mx-auto py-6" style={{ minHeight: '80vh' }}>
      <RoommateRecommendations key="recommendations-component" onError={setError} />
    </div>
  );
}
