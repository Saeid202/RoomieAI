
import { useState } from "react";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";
import { useToast } from "@/hooks/use-toast";

export function CoOwnerProfileView() {
  const [activeTab, setActiveTab] = useState("personal-details");
  const { toast } = useToast();
  
  console.log("Rendering co-owner form with active tab:", activeTab);
  
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    toast({
      title: "Tab Changed",
      description: `You are now viewing the ${tabValue.replace(/-/g, ' ')} section`,
      duration: 2000,
    });
  };
  
  return (
    <CoOwnerProfileTabs
      activeTab={activeTab}
      setActiveTab={handleTabChange}
    />
  );
}
