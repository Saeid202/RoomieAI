
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { IdealRoommateTabs } from "./IdealRoommateTabs";

interface IdealRoommateFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isSaving: boolean;
}

export function IdealRoommateForm({ form, onSubmit, isSaving }: IdealRoommateFormProps) {
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

      <IdealRoommateTabs form={form} />

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
