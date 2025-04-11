
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalDetailsForm } from "@/components/dashboard/co-owner/PersonalDetailsForm";
import { ResidenceCitizenshipForm } from "@/components/dashboard/co-owner/ResidenceCitizenshipForm";
import { EmploymentForm } from "@/components/dashboard/co-owner/EmploymentForm";
import { FinancialSituationForm } from "@/components/dashboard/co-owner/FinancialSituationForm";
import { InvestmentCapacityForm } from "@/components/dashboard/co-owner/InvestmentCapacityForm";
import { InvestmentPreferencesForm } from "@/components/dashboard/co-owner/InvestmentPreferencesForm";
import { RiskManagementForm } from "@/components/dashboard/co-owner/RiskManagementForm";
import { IdentityVerificationForm } from "@/components/dashboard/co-owner/IdentityVerificationForm";
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
    <Card className="p-6 shadow-md border-muted">
      <Tabs
        defaultValue="personal-details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="overflow-x-auto pb-4 sticky top-0 bg-card z-10 border-b mb-6">
          <TabsList className="w-full bg-muted/50 inline-flex h-auto py-2 px-1 gap-1 flex-nowrap justify-start rounded-xl">
            <TabsTrigger 
              value="personal-details"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <User className="h-4 w-4 mr-2" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger 
              value="residence-citizenship"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <Home className="h-4 w-4 mr-2" />
              Residence & Citizenship
            </TabsTrigger>
            <TabsTrigger 
              value="employment"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Employment
            </TabsTrigger>
            <TabsTrigger 
              value="financial-situation"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Financial Situation
            </TabsTrigger>
            <TabsTrigger 
              value="investment-capacity"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Investment Capacity
            </TabsTrigger>
            <TabsTrigger 
              value="investment-preferences"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Investment Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="risk-management"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger 
              value="identity-verification"
              className="whitespace-nowrap flex items-center rounded-lg py-2.5 px-4"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Identity Verification
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
          <TabsContent value="personal-details" className="mt-0">
            <PersonalDetailsForm />
          </TabsContent>
          
          <TabsContent value="residence-citizenship" className="mt-0">
            <ResidenceCitizenshipForm />
          </TabsContent>
          
          <TabsContent value="employment" className="mt-0">
            <EmploymentForm />
          </TabsContent>
          
          <TabsContent value="financial-situation" className="mt-0">
            <FinancialSituationForm />
          </TabsContent>
          
          <TabsContent value="investment-capacity" className="mt-0">
            <InvestmentCapacityForm />
          </TabsContent>
          
          <TabsContent value="investment-preferences" className="mt-0">
            <InvestmentPreferencesForm />
          </TabsContent>
          
          <TabsContent value="risk-management" className="mt-0">
            <RiskManagementForm />
          </TabsContent>
          
          <TabsContent value="identity-verification" className="mt-0">
            <IdentityVerificationForm />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
