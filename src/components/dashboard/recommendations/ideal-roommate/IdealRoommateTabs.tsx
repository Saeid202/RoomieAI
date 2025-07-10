
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Ban } from "lucide-react";

// Define the tabs for the Ideal Roommate section
const ROOMMATE_TABS = [
  { id: "preferences", label: "Roommate Preferences", icon: Settings }
];

interface IdealRoommateTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function IdealRoommateTabs({ activeTab, onTabChange }: IdealRoommateTabsProps) {
  return (
    <TabsList className="w-full grid grid-cols-1 h-auto">
      {ROOMMATE_TABS.map(tab => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 min-h-[2.5rem] whitespace-nowrap"
        >
          <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="text-center leading-tight">{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
