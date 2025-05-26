
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";
import { IdealRoommateForm } from "./IdealRoommateForm";

interface RoommatePreferencesFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => void;
  isSaving: boolean;
}

export function RoommatePreferencesForm({ 
  form, 
  onSubmit, 
  isSaving 
}: RoommatePreferencesFormProps) {
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
        <IdealRoommateForm 
          form={form} 
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
        
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
