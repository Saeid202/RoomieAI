
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";
import { IdealRoommateTabs } from "./IdealRoommateTabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PreferencesTab } from "./PreferencesTab";
import { LifestyleMatchTab } from "./LifestyleMatchTab";
import { HouseHabitsTab } from "./HouseHabitsTab";
import { DealBreakersTab } from "./DealBreakersTab";

interface RoommatePreferencesFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

export function RoommatePreferencesForm({ 
  form, 
  onSubmit, 
  isSaving 
}: RoommatePreferencesFormProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = form.getValues();
    await onSubmit(data);
    
    // Show success indicator temporarily
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <IdealRoommateTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <TabsContent value="preferences">
            <PreferencesTab form={form} handleTraitToggle={() => {}} />
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
        
        <div className="flex justify-end mt-4">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="relative"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : isSaving ? (
              "Saving..."
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
