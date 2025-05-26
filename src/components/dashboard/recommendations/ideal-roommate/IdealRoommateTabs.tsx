
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Ban } from "lucide-react";

// Define the tabs for the Ideal Roommate section
const ROOMMATE_TABS = [
  { id: "preferences", label: "1️⃣ Preferences", icon: Settings },
  { id: "deal-breakers", label: "2️⃣ Deal Breakers", icon: Ban }
];

interface IdealRoommateTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function IdealRoommateTabs({ activeTab, onTabChange }: IdealRoommateTabsProps) {
  return (
    <TabsList className="w-full grid grid-cols-2">
      {ROOMMATE_TABS.map(tab => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          className="flex items-center gap-2"
        >
          <tab.icon className="h-4 w-4" />
          <span className="hidden md:inline">{tab.label}</span>
          <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
