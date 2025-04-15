
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoommateCard } from "./RoommateCard";
import { PropertyCard } from "./PropertyCard";
import { Building, Users } from "lucide-react";

interface MatchTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  roommates: any[];
  properties: any[];
  onViewDetails: (match: any) => void;
}

export function MatchTabs({ activeTab, setActiveTab, roommates, properties, onViewDetails }: MatchTabsProps) {
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="roommates" className="flex items-center gap-2">
          <Users size={16} />
          <span>Roommates ({roommates.length})</span>
        </TabsTrigger>
        <TabsTrigger value="properties" className="flex items-center gap-2">
          <Building size={16} />
          <span>Property Sharing ({properties.length})</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="roommates" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roommates.map((match, index) => (
            <RoommateCard 
              key={index} 
              match={match} 
              onViewDetails={onViewDetails} 
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="properties" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard 
              key={index} 
              property={property} 
              onViewDetails={onViewDetails} 
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
