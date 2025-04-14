
import { useToast } from "@/hooks/use-toast";

export function useToastNotifications() {
  const { toast } = useToast();

  const showSuccess = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const showError = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  return {
    showSuccess,
    showError
  };
}
