
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { IdealRoommateTabs } from "./IdealRoommateTabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PreferencesTab } from "./PreferencesTab";
import { LifestyleMatchTab } from "./LifestyleMatchTab";
import { HouseHabitsTab } from "./HouseHabitsTab";
import { DealBreakersTab } from "./DealBreakersTab";
import { useState } from "react";

interface IdealRoommateFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

export function IdealRoommateForm({ form, onSubmit, isSaving }: IdealRoommateFormProps) {
  const [activeTab, setActiveTab] = useState("preferences");

  const handleSubmit = async () => {
    const data = form.getValues();
    await onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ideal Roommate Preferences</h2>
        <p className="text-muted-foreground">
          Tell us what you're looking for in your ideal roommate to get better matches.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <IdealRoommateTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <TabsContent value="preferences">
          <PreferencesTab form={form} />
        </TabsContent>
        
        <TabsContent value="lifestyle-match">
          <LifestyleMatchTab form={form} />
        </TabsContent>
        
        <TabsContent value="house-habits">
          <HouseHabitsTab form={form} />
        </TabsContent>
        
        <TabsContent value="deal-breakers">
          <DealBreakersTab form={form} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSubmit}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
