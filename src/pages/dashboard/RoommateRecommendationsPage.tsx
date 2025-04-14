
import { useState, useEffect, useRef } from "react";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/dashboard/recommendations/LoadingState";
import { useAuth } from "@/hooks/useAuth";

export default function RoommateRecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  
  // Improved loading mechanism that coordinates with auth state
  useEffect(() => {
    document.title = "Find My Ideal Roommate";
    mountedRef.current = true;
    
    // Don't start loading sequence until auth is settled
    if (authLoading) return;
    
    console.log("Starting loading sequence, auth status:", user ? "authenticated" : "not authenticated");
    
    // Ensure minimum loading time of 1500ms for consistent experience
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        console.log("Minimum loading time elapsed, finishing loading sequence");
        setIsLoading(false);
      }
    }, 1500);
    
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [authLoading, user]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    
    // Allow time for clean state reset before loading again
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setIsRetrying(false);
        setIsLoading(false);
      }
    }, 1200);
  };

  // Show loading state if either auth is loading or our content is loading
  if (authLoading || isLoading) {
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

  // Render the main component only when we're sure all loading is finished
  return (
    <div className="container mx-auto py-6" style={{ minHeight: '80vh' }}>
      <RoommateRecommendations key="recommendations-component" onError={setError} />
    </div>
  );
}
