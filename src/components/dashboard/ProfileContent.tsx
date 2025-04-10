
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PreferenceSelector } from "./PreferenceSelector";
import { Users, Home, UserPlus } from "lucide-react";
import { UserPreference } from "./types";

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<UserPreference>(null);
  
  // Load the saved preference from localStorage if it exists
  useEffect(() => {
    const savedPreference = localStorage.getItem('userPreference') as UserPreference;
    if (savedPreference) {
      setActiveTab(savedPreference);
    }
  }, []);

  // Handle tab change and update localStorage
  const handleTabChange = (value: string) => {
    const preference = value as UserPreference;
    setActiveTab(preference);
    localStorage.setItem('userPreference', preference);
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">What are you looking for?</h2>
          <p className="text-gray-600 mb-6">
            Select your housing preference. You can change this at any time.
          </p>
          
          <Tabs 
            value={activeTab || "roommate"} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="w-full mb-6 grid grid-cols-3">
              <TabsTrigger value="roommate" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Roommate</span>
              </TabsTrigger>
              <TabsTrigger value="co-owner" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Co-owner</span>
              </TabsTrigger>
              <TabsTrigger value="both" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Both</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roommate" className="space-y-4">
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-4">I'm looking for a roommate</h3>
                <PreferenceSelector defaultPreference="roommate" />
              </div>
            </TabsContent>
            
            <TabsContent value="co-owner" className="space-y-4">
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-4">I'm looking for a co-owner</h3>
                <PreferenceSelector defaultPreference="co-owner" />
              </div>
            </TabsContent>
            
            <TabsContent value="both" className="space-y-4">
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-4">I'm interested in both options</h3>
                <PreferenceSelector defaultPreference="both" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
