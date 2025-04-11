
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";

interface PropertyFormActionsProps {
  navigate: NavigateFunction;
  isSubmitting: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPreview: () => void;
  isLastTab: boolean;
}

export function PropertyFormActions({ 
  navigate, 
  isSubmitting, 
  activeTab, 
  onTabChange, 
  onPreview, 
  isLastTab 
}: PropertyFormActionsProps) {
  const tabs = ["basic", "details", "amenities", "media"];
  const currentIndex = tabs.indexOf(activeTab);
  
  const goToPrevTab = () => {
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1]);
    }
  };
  
  const goToNextTab = () => {
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1]);
    }
  };
  
  return (
    <div className="flex justify-between space-x-4">
      <div>
        {currentIndex > 0 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={goToPrevTab}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate("/dashboard/properties")}
        >
          Cancel
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <Eye size={16} />
          Preview
        </Button>
        
        {isLastTab ? (
          <Button 
            type="submit" 
            className="bg-roomie-purple hover:bg-roomie-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "List Property"}
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={goToNextTab}
            className="bg-roomie-purple hover:bg-roomie-dark flex items-center gap-2"
          >
            Next
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
