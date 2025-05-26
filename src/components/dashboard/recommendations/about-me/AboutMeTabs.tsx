
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Home } from "lucide-react";

// Define the simplified tabs for the About Me section
const AboutMeTabDefinitions = [
  { id: "personal-info", label: "Personal Information", icon: User },
  { id: "housing-lifestyle", label: "Housing & Lifestyle", icon: Home },
];

export function AboutMeTabs() {
  return (
    <TabsList className="w-full grid grid-cols-2">
      {AboutMeTabDefinitions.map(tab => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          className="flex items-center gap-2"
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
