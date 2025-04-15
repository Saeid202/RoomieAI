
import { UserPreference } from "@/components/dashboard/types";
import { useLocation } from "react-router-dom";

interface ViewSelectorProps {
  userPreference: UserPreference;
  forcedView?: 'roommate' | 'co-owner' | null;
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

  // Check if we're on a specific profile route
  const isRoommatePage = path.includes('/profile/roommate');
  const isCoOwnerPage = path.includes('/profile/co-owner');
  
  // Route-based view takes precedence over forcedView and userPreference
  let displayView = isRoommatePage 
    ? 'roommate' 
    : isCoOwnerPage 
      ? 'co-owner' 
      : forcedView || userPreference;
  
  // Fallback to a default view if none is set
  if (!displayView && path.includes('/profile')) {
    console.log("ViewSelector - No preference found, defaulting to roommate view");
    displayView = 'roommate';
  }

  // Add debugging logs
  console.log("ViewSelector - path:", path);
  console.log("ViewSelector - isRoommatePage:", isRoommatePage);
  console.log("ViewSelector - isCoOwnerPage:", isCoOwnerPage);
  console.log("ViewSelector - forcedView:", forcedView);
  console.log("ViewSelector - userPreference:", userPreference);
  console.log("ViewSelector - displayView:", displayView);

  return {
    displayView,
    isRoommatePage,
    isCoOwnerPage
  };
}
