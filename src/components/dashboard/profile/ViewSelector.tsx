
import { UserPreference } from "@/components/dashboard/types";
import { useLocation } from "react-router-dom";

interface ViewSelectorProps {
  userPreference: UserPreference;
  forcedView?: 'co-owner' | null;
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
  
  // Route-based view takes precedence over forcedView and userPreference
  let displayView = forcedView || userPreference;
  
  // Fallback to a default view if none is set
  if (!displayView && path.includes('/profile')) {
    console.log("ViewSelector - No preference found, defaulting to co-owner view");
    displayView = 'co-owner';
  }

  // Add debugging logs
  console.log("ViewSelector - path:", path);
  console.log("ViewSelector - forcedView:", forcedView);
  console.log("ViewSelector - userPreference:", userPreference);
  console.log("ViewSelector - displayView:", displayView);

  return {
    displayView,
  };
}
