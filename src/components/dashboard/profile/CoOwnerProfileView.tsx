
import { useState } from "react";
import { CoOwnerProfileTabs } from "@/components/dashboard/co-owner/CoOwnerProfileTabs";

export function CoOwnerProfileView() {
  const [activeTab, setActiveTab] = useState("personal-details");
  
  console.log("Rendering co-owner form with active tab:", activeTab);
  
  return (
    <CoOwnerProfileTabs
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}
