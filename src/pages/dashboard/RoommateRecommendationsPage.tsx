
import { useState, useEffect, useRef } from "react";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/dashboard/recommendations/LoadingState";

export default function RoommateRecommendationsPage() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadRef = useRef(true);
  
  // Use useEffect for initialization with a cleaner approach
  useEffect(() => {
    document.title = "Find My Ideal Roommate";
    
    if (initialLoadRef.current) {
      // First mount - show loading state for a consistent period
      const timer = setTimeout(() => {
        setIsLoading(false);
        initialLoadRef.current = false;
      }, 1200); // Longer initial timeout for stability
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    initialLoadRef.current = true;
    
    // Full reset with adequate time for state transitions
    setTimeout(() => {
      setIsRetrying(false);
      setIsLoading(false);
      initialLoadRef.current = false;
    }, 1200);
  };

  // Stable loading state
  if (isLoading || initialLoadRef.current) {
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

  // Render the main component
  return (
    <div className="container mx-auto py-6" style={{ minHeight: '80vh' }}>
      <RoommateRecommendations key="recommendations-component" onError={setError} />
    </div>
  );
}
