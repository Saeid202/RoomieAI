
import { useState } from "react";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { useToast } from "@/hooks/use-toast";

export function CoOwnerProfileView() {
  const [activeTab, setActiveTab] = useState("personal-details");
  const { toast } = useToast();
  
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    toast({
      title: "Tab Changed",
      description: `You are now viewing the ${tabValue.replace(/-/g, ' ')} section`,
      duration: 2000,
    });
  };
  
  return (
    <div className="w-full">
      <CoOwnerProfileTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
    </div>
  );
}
