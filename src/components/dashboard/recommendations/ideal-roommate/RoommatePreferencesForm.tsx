
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useFormUtilities } from "@/hooks/useFormUtilities";
import { IdealRoommateTabs } from "./IdealRoommateTabs";
import { PreferencesTab } from "./PreferencesTab";
import { LifestyleMatchTab } from "./LifestyleMatchTab";
import { HouseHabitsTab } from "./HouseHabitsTab";
import { DealBreakersTab } from "./DealBreakersTab";
import { useState } from "react";
import { Check } from "lucide-react";

interface RoommatePreferencesFormProps {
  form: UseFormReturn<ProfileFormValues>;
  activeTab: string;
  setActiveTab: (value: string) => void;
  onSubmit: (data: ProfileFormValues) => void;
  isSaving: boolean;
}

export function RoommatePreferencesForm({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit, 
  isSaving 
}: RoommatePreferencesFormProps) {
  const { handleTraitToggle } = useFormUtilities(form);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
            <PreferencesTab form={form} handleTraitToggle={handleTraitToggle} />
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
        </Tabs>
      </form>
    </Form>
  );
}
