
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HousingPreferencesSection } from "@/components/profile/HousingPreferencesSection";
import { LeaseTermsSection } from "@/components/profile/LeaseTermsSection";

interface HousingTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function HousingTab({ form }: HousingTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Home Sweet Home? 🏠</h3>
      <p className="text-muted-foreground">Tell us about your dream pad! Mansion or shoebox, we don't judge (much). 😉</p>
      <Tabs defaultValue="housing">
        <TabsList>
          <TabsTrigger value="housing">Housing Preferences</TabsTrigger>
          <TabsTrigger value="lease">Lease Terms</TabsTrigger>
        </TabsList>
        <TabsContent value="housing">
          <HousingPreferencesSection form={form} />
        </TabsContent>
        <TabsContent value="lease">
          <LeaseTermsSection form={form} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
