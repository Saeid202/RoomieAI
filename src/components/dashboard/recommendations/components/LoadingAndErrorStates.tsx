
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "../LoadingState";

interface LoadingErrorProps {
  componentMounted: boolean;
  initialized: boolean;
  internalError: Error | null;
  isRetrying: boolean;
  handleRetry: () => void;
}

export function LoadingAndErrorStates({
  componentMounted,
  initialized,
  internalError,
  isRetrying,
  handleRetry
}: LoadingErrorProps) {
  if (!componentMounted || !initialized) {
    return (
      <div className="w-full py-12 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (internalError) {
    return (
      <Card className="w-full my-6">
        <CardContent className="py-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Content</h2>
            <p className="mb-6">{internalError.message || "An unexpected error occurred"}</p>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="mx-auto flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
