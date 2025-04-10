
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { PersonalDetailsForm } from "./co-owner/PersonalDetailsForm";
import { Card } from "@/components/ui/card";

export function CoOwnerRecommendations() {
  const [activeTab, setActiveTab] = useState("personal-details");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Co-Owner Investment Profile</h1>
      
      <Card className="p-6">
        <Tabs
          defaultValue="personal-details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full bg-muted inline-flex h-auto p-1 gap-2 flex-nowrap">
              <TabsTrigger 
                value="personal-details"
                className="whitespace-nowrap py-2"
              >
                Personal Details
              </TabsTrigger>
              <TabsTrigger 
                value="residence-citizenship"
                className="whitespace-nowrap py-2"
              >
                Residence & Citizenship
              </TabsTrigger>
              <TabsTrigger 
                value="employment"
                className="whitespace-nowrap py-2"
              >
                Employment
              </TabsTrigger>
              <TabsTrigger 
                value="financial-situation"
                className="whitespace-nowrap py-2"
              >
                Financial Situation
              </TabsTrigger>
              <TabsTrigger 
                value="investment-capacity"
                className="whitespace-nowrap py-2"
              >
                Investment Capacity
              </TabsTrigger>
              <TabsTrigger 
                value="investment-preferences"
                className="whitespace-nowrap py-2"
              >
                Investment Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="risk-management"
                className="whitespace-nowrap py-2"
              >
                Risk Management
              </TabsTrigger>
              <TabsTrigger 
                value="identity-verification"
                className="whitespace-nowrap py-2"
              >
                Identity Verification
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal-details" className="mt-6">
            <PersonalDetailsForm />
          </TabsContent>
          
          <TabsContent value="residence-citizenship" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Residence & Citizenship Form</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="employment" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Employment Information</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="financial-situation" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Financial Situation</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="investment-capacity" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Investment Capacity</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="investment-preferences" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Investment Preferences</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="risk-management" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Risk Management</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="identity-verification" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Identity Verification</h3>
              <p className="text-muted-foreground mt-2">This section will be implemented in the next phase.</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
