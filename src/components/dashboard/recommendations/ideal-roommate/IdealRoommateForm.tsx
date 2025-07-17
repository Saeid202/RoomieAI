
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { IdealRoommateTabs } from "./IdealRoommateTabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PreferencesTab } from "./PreferencesTab";
import { DealBreakersTab } from "./DealBreakersTab";
import { useState } from "react";
import { useFormUtilities } from "@/hooks/useFormUtilities";
import { useToast } from "@/hooks/use-toast";

interface IdealRoommateFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

export function IdealRoommateForm({ form, onSubmit, isSaving }: IdealRoommateFormProps) {
  const [activeTab, setActiveTab] = useState("preferences");
  const { handleTraitToggle } = useFormUtilities(form);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = form.getValues();
      console.log("IdealRoommateForm - Form data being submitted:", data);
      
      await onSubmit(data);
      
      toast({
        title: "Success",
        description: "Your ideal roommate preferences have been saved!",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ideal Roommate Preferences</h2>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/*<IdealRoommateTabs activeTab={activeTab} onTabChange={setActiveTab} />*/}
            
            <TabsContent value="preferences">
              <PreferencesTab form={form} handleTraitToggle={handleTraitToggle} />
            </TabsContent>
            
            <TabsContent value="deal-breakers">
              <DealBreakersTab form={form} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button 
              type="submit"
              disabled={isSaving}
              size="lg"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
