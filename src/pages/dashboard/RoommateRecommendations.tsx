
import { useState, useEffect } from "react";
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/dashboard/recommendations/LoadingState";
import { useAuth } from "@/hooks/useAuth";

export default function RoommateRecommendationsPage() {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Handle the initial page load with a proper loading state
  useEffect(() => {
    console.log("RoommatePage mounted - Initializing...");
    console.log("Auth state:", { user: user?.email, loading: authLoading });
    document.title = "Find My Ideal Roommate";
    
    // Set loaded state immediately if auth is already resolved
    if (!authLoading) {
      setIsLoaded(true);
    } else {
      // Only wait for auth to complete
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      console.log("RoommatePage unmounted - Cleaning up");
    };
  }, [user, authLoading]);

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    // Force a remount of the component by changing the key
    setTimeout(() => {
      setIsRetrying(false);
    }, 300);
  };

  // Show loading state during authentication load only
  if (authLoading) {
    return (
      <div className="container mx-auto py-6">
        <LoadingState key="initial-loading" />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto py-6 animate-fadeIn">
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

  // Main content - render with fade-in animation
  return (
    <div 
      className={`container mx-auto py-6 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ minHeight: '80vh' }}
    >
      <RoommateRecommendations 
        key={isRetrying ? "retrying-component" : "recommendations-component"} 
        onError={setError} 
      />
    </div>
  );
}
