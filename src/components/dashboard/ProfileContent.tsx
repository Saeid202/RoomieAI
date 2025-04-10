
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Home, UserPlus } from "lucide-react";
import { UserPreference } from "./types";
import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileContent() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<UserPreference>(null);
  
  // Load the saved preference from localStorage if it exists
  // or from the URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromQuery = params.get('tab') as UserPreference;
    
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
      localStorage.setItem('userPreference', tabFromQuery);
    } else {
      const savedPreference = localStorage.getItem('userPreference') as UserPreference;
      if (savedPreference) {
        setActiveTab(savedPreference);
      }
    }
  }, [location]);

  // Handle tab change and update localStorage
  const handleTabChange = (value: string) => {
    const preference = value as UserPreference;
    setActiveTab(preference);
    localStorage.setItem('userPreference', preference);
  };

  // Render Co-owner form placeholder
  const renderCoOwnerForm = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center py-8 text-gray-500">Co-owner form will be implemented in the future update.</p>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
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
            
            <TabsContent value="roommate">
              <ProfileForm />
            </TabsContent>
            
            <TabsContent value="co-owner">
              {renderCoOwnerForm()}
            </TabsContent>
            
            <TabsContent value="both">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-roomie-purple">Roommate Matching Form</h2>
                  <ProfileForm />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-roomie-purple">Co-owner Matching Form</h2>
                  {renderCoOwnerForm()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
