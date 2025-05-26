
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
    <Card className="w-full mx-auto shadow-lg border border-border/50">
      <div className="p-4 md:p-6">
        <Tabs
          defaultValue="personal-details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-6">
            <div className="overflow-x-auto">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto p-1 bg-muted/30 rounded-lg gap-1">
                <TabsTrigger 
                  value="personal-details"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Personal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="residence-citizenship"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Home className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Residence</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="employment"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Employment</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financial-situation"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Financial</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="investment-capacity"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Capacity</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="investment-preferences"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Preferences</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="risk-management"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Risk</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="identity-verification"
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium rounded-md min-h-[4rem] gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight">Verification</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="w-full">
            <ScrollArea className="h-[calc(100vh-300px)] w-full">
              <div className="pr-4 space-y-6">
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
      </div>
    </Card>
  );
}
