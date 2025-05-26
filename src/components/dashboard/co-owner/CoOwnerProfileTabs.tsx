
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Card className="w-full max-w-none mx-auto p-4 md:p-6 shadow-md border-muted">
      <Tabs
        defaultValue="personal-details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="w-full mb-6">
          <ScrollArea className="w-full">
            <div className="w-full min-w-fit">
              <TabsList className="w-full bg-muted/50 h-auto py-2 px-1 gap-1 flex flex-wrap md:flex-nowrap justify-start rounded-xl">
                <TabsTrigger 
                  value="personal-details"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Personal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="residence-citizenship"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <Home className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Residence</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="employment"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <Briefcase className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Employment</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financial-situation"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Financial</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="investment-capacity"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Capacity</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="investment-preferences"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Preferences</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="risk-management"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <ShieldAlert className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Risk</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="identity-verification"
                  className="flex items-center rounded-lg py-2 px-2 md:px-4 text-xs md:text-sm min-w-fit"
                >
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Verification</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
        </div>

        <div className="w-full">
          <ScrollArea className="h-[calc(100vh-400px)] w-full">
            <div className="pr-4">
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
          </ScrollArea>
        </div>
      </Tabs>
    </Card>
  );
}
