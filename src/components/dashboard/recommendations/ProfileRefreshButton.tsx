
import { useToast } from "@/hooks/use-toast";

interface ProfileRefreshButtonProps {
  onRefresh: () => Promise<void>;
  onError?: (error: Error) => void;
}

export function ProfileRefreshButton({ onRefresh, onError }: ProfileRefreshButtonProps) {
  const { toast } = useToast();

  const handleRefreshProfile = async () => {
    try {
      await onRefresh();
      toast({
        title: "Profile refreshed",
        description: "Your profile has been updated with the latest data",
      });
    } catch (error) {
      console.error("Error refreshing profile:", error);
      if (onError) {
        onError(error instanceof Error ? error : new Error("Failed to refresh profile"));
      }
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <button 
      onClick={handleRefreshProfile}
      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
    >
      Refresh Profile
    </button>
  );
}
