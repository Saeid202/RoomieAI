
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
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
      <TabsList className="w-full grid grid-cols-2 gap-2 h-14 bg-muted/30 p-1 rounded-2xl">
        <TabsTrigger 
          value="roommates" 
          className="flex items-center gap-3 text-base font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 py-3"
        >
          <Users size={20} />
          <span className="hidden xs:inline">Roommates</span>
          <span className="xs:hidden">Rooms</span>
          <span className="ml-1 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary">
            {roommates.length}
          </span>
        </TabsTrigger>
        <TabsTrigger 
          value="properties" 
          className="flex items-center gap-3 text-base font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 py-3"
        >
          <Building size={20} />
          <span className="hidden xs:inline">Properties</span>
          <span className="xs:hidden">Props</span>
          <span className="ml-1 bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary">
            {properties.length}
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="roommates" className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard 
              key={index} 
              property={property} 
              ownerName={property.landlord_name}
              onViewDetails={onViewDetails} 
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
