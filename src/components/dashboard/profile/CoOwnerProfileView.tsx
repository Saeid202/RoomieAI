
import { useState } from "react";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function CoOwnerProfileView() {
  const [activeTab, setActiveTab] = useState("personal-details");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    
    // Update URL to reflect the current tab without full page reload
    const url = `/dashboard/profile/co-owner?tab=${tabValue}`;
    window.history.pushState({}, "", url);
    
    toast({
      title: "Section Changed",
      description: `You are now viewing the ${tabValue.replace(/-/g, ' ')} section`,
      duration: 2000,
    });
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Co-Owner Profile</h2>
        <div className="flex space-x-2">
          <span className="text-sm text-muted-foreground">
            Complete your profile to improve matching results
          </span>
        </div>
      </div>
      
      <CoOwnerProfileTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
    </div>
  );
}
