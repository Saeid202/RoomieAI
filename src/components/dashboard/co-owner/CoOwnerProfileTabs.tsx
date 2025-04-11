
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
        <div className="overflow-x-auto pb-2 sticky top-0 bg-card z-10">
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

        <div className="mt-6 overflow-y-auto">
          <TabsContent value="personal-details">
            <PersonalDetailsForm />
          </TabsContent>
          
          <TabsContent value="residence-citizenship">
            <ResidenceCitizenshipForm />
          </TabsContent>
          
          <TabsContent value="employment">
            <EmploymentForm />
          </TabsContent>
          
          <TabsContent value="financial-situation">
            <FinancialSituationForm />
          </TabsContent>
          
          <TabsContent value="investment-capacity">
            <InvestmentCapacityForm />
          </TabsContent>
          
          <TabsContent value="investment-preferences">
            <InvestmentPreferencesForm />
          </TabsContent>
          
          <TabsContent value="risk-management">
            <RiskManagementForm />
          </TabsContent>
          
          <TabsContent value="identity-verification">
            <IdentityVerificationForm />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
