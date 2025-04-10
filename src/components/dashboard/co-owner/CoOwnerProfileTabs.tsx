
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalDetailsForm } from "@/components/dashboard/co-owner/PersonalDetailsForm";
import { 
  User, Home, Briefcase, FileText, 
  CreditCard, BarChart3, ShieldAlert, CheckCircle 
} from "lucide-react";

interface CoOwnerProfileTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export function CoOwnerProfileTabs({ 
  activeTab, 
  setActiveTab 
}: CoOwnerProfileTabsProps) {
  return (
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
              <User className="h-4 w-4 mr-2" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger 
              value="residence-citizenship"
              className="whitespace-nowrap py-2"
            >
              <Home className="h-4 w-4 mr-2" />
              Residence & Citizenship
            </TabsTrigger>
            <TabsTrigger 
              value="employment"
              className="whitespace-nowrap py-2"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Employment
            </TabsTrigger>
            <TabsTrigger 
              value="financial-situation"
              className="whitespace-nowrap py-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              Financial Situation
            </TabsTrigger>
            <TabsTrigger 
              value="investment-capacity"
              className="whitespace-nowrap py-2"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Investment Capacity
            </TabsTrigger>
            <TabsTrigger 
              value="investment-preferences"
              className="whitespace-nowrap py-2"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Investment Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="risk-management"
              className="whitespace-nowrap py-2"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger 
              value="identity-verification"
              className="whitespace-nowrap py-2"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
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
  );
}
