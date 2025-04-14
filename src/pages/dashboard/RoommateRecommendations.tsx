
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

  // Prevent UI flashing with stable state management
  useEffect(() => {
    document.title = "Find My Ideal Roommate";
    
    // Fixed loading state that doesn't fluctuate
    if (!contentMounted) {
      setContentMounted(true);
      
      // Delay just enough to ensure DOM is ready but not so long it causes flashing
      const stableTimer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(stableTimer);
    }
  }, [contentMounted]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    
    // Use setTimeout to ensure state updates have propagated
    setTimeout(() => {
      setContentMounted(false);
    }, 50);
  };

  // Maintain stable DOM during loading
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

  // Ensure stable DOM with consistent class names
  return (
    <div className="container mx-auto py-6" style={{ minHeight: '80vh' }}>
      <RoommateRecommendations key="recommendations-component" onError={setError} />
    </div>
  );
}
