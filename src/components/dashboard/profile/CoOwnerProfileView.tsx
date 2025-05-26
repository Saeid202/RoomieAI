
import { useState, useEffect } from "react";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export function CoOwnerProfileView() {
  const [activeTab, setActiveTab] = useState("personal-details");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract tab from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
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
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Co-Owner Profile</h2>
          <span className="text-sm text-muted-foreground">
            Complete your profile to improve matching results
          </span>
        </div>
      </div>
      
      <div className="w-full">
        <CoOwnerProfileTabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
      </div>
    </div>
  );
}
