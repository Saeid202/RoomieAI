
import { RoommateRecommendations } from "@/components/dashboard/RoommateRecommendations";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function ErrorFallback() {
  return (
    <div className="container mx-auto py-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading the roommate recommendations. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function RoommateRecommendationsPage() {
  return (
    <div className="container mx-auto py-6">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RoommateRecommendations />
      </ErrorBoundary>
    </div>
  );
}
