
import { UserPreference } from "@/components/dashboard/types";
import { useLocation } from "react-router-dom";

interface ViewSelectorProps {
  userPreference: UserPreference;
  forcedView?: null;
}

/**
 * Determines which profile view to display based on the current route
 * and user preferences
 */
export function useViewSelector({ 
  userPreference, 
  forcedView = null 
}: ViewSelectorProps) {
  const location = useLocation();
  const path = location.pathname;

  // Co-owner functionality has been removed
  const displayView = null;

  // Add debugging logs
  console.log("ViewSelector - path:", path);
  console.log("ViewSelector - userPreference:", userPreference);
  console.log("ViewSelector - displayView:", displayView);

  return {
    displayView,
    isCoOwnerPage: false
  };
}
