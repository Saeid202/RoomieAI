
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Home } from "lucide-react";

// Define the simplified tabs for the About Me section
const AboutMeTabDefinitions = [
  { id: "personal-info", label: "Personal Information", icon: User },
  { id: "housing-lifestyle", label: "Housing & Lifestyle", icon: Home },
];

export function AboutMeTabs() {
  return (
    <TabsList className="w-full grid grid-cols-2 h-max gap-1">
      {AboutMeTabDefinitions.map(tab => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id} 
          className="flex items-center gap-2 text-xs md:text-base bg-primary data-[state=active]:bg-primary px-1 text-primary-foreground data-[state=active]:text-primary-foreground opacity-80 data-[state=active]:opacity-100 shadow-lg"
          
        >
          <tab.icon className="h-4 w-4 hidden md:block" />
          <span>{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
