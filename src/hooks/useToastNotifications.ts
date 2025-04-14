
import { useToast } from "@/hooks/use-toast";

export function useToastNotifications() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  // Add the missing showPlanMatch method
  const showPlanMatch = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      className: "bg-green-100 border-green-400",
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPlanMatch,
  };
}
