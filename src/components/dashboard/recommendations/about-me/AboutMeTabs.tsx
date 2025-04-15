
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";

// Define the tabs for the About Me section
const AboutMeTabDefinitions = [
  { id: "personal-info", label: "1️⃣ Personal Info", icon: User },
  { id: "housing", label: "2️⃣ Housing", icon: User },
  { id: "lifestyle", label: "3️⃣ Lifestyle", icon: User },
  { id: "social-cleaning", label: "4️⃣ Social & Cleaning", icon: User },
];

export function AboutMeTabs() {
  return (
    <TabsList className="w-full grid grid-cols-4">
      {AboutMeTabDefinitions.map(tab => (
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
