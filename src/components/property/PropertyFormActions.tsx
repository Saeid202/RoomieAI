
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface PropertyFormActionsProps {
  navigate: NavigateFunction;
  isSubmitting: boolean;
}

export function PropertyFormActions({ navigate, isSubmitting }: PropertyFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate("/dashboard/properties")}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-roomie-purple hover:bg-roomie-dark"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "List Property"}
      </Button>
    </div>
  );
}
