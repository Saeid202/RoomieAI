
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { PreferenceImportanceSelector, PreferenceImportance } from "@/components/ui/preference-importance-selector";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PreferenceWithImportanceProps {
  children: ReactNode;
  form: UseFormReturn<ProfileFormValues>;
  preferenceKey: string; // Maps to roommate table importance fields
  title: string;
}

// Map preference keys from profile form to roommate table importance field names
const PREFERENCE_IMPORTANCE_FIELD_MAP: Record<string, string> = {
  "ageRangePreference": "age_range_preference_importance",
  "genderPreference": "gender_preference_importance", 
  "nationalityPreference": "nationality_preference_importance",
  "languagePreference": "language_preference_importance",
  "dietaryPreferences": "dietary_preferences_importance",
  "occupationPreference": "occupation_preference_importance",
  "workSchedulePreference": "work_schedule_preference_importance",
  "ethnicityPreference": "ethnicity_preference_importance",
  "religionPreference": "religion_preference_importance",
  "petPreference": "pet_preference_importance",
  "smokingPreference": "smoking_preference_importance",
  "housingPreference": "housing_preference_importance"
};

export function PreferenceWithImportance({ 
  children, 
  form, 
  preferenceKey, 
  title 
}: PreferenceWithImportanceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Map the profile form field name to roommate table importance field
  const importanceFieldName = PREFERENCE_IMPORTANCE_FIELD_MAP[preferenceKey] || `${preferenceKey}_importance`;
  
  // Get current importance from form watch (this will be updated when we load profile data)
  const currentImportance = form.watch(importanceFieldName as keyof ProfileFormValues) as PreferenceImportance || "notImportant";

  const handleImportanceChange = async (importance: PreferenceImportance) => {
    if (!user?.id) return;

    try {
      // Update the form value
      form.setValue(importanceFieldName as keyof ProfileFormValues, importance, { shouldDirty: true });
      
      // Save to database immediately
      const { error } = await supabase
        .from('roommate')
        .update({ [importanceFieldName]: importance })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving importance:', error);
        toast({
          title: "Error",
          description: "Failed to save preference importance",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Saved",
        description: `${title} importance updated to ${importance}`,
      });
    } catch (error) {
      console.error('Error updating importance:', error);
      toast({
        title: "Error",
        description: "Failed to update preference importance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {children}
        </div>
        <div className="flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-1">Importance</div>
          <PreferenceImportanceSelector
            value={currentImportance}
            onValueChange={handleImportanceChange}
          />
        </div>
      </div>
    </div>
  );
} 
