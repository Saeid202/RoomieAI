import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { PreferenceImportanceSelector, PreferenceImportance } from "@/components/ui/preference-importance-selector";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface PreferenceWithImportanceProps {
  children: ReactNode;
  form: UseFormReturn<ProfileFormValues>;
  preferenceKey: string; // Maps to user_preferences keys like 'gender', 'age', etc.
  title: string;
}

// Map preference keys from profile form to user_preferences keys
const PREFERENCE_KEY_MAP: Record<string, string> = {
  "ageRangePreference": "age",
  "genderPreference": "gender", 
  "nationalityPreference": "nationality",
  "languagePreference": "language",
  "dietaryPreferences": "diet",
  "occupationPreference": "occupation",
  "workSchedulePreference": "workSchedule",
  "ethnicityPreference": "ethnicity",
  "religionPreference": "religion",
  "petPreference": "pets",
  "smokingPreference": "smoking"
};

export function PreferenceWithImportance({ 
  children, 
  form, 
  preferenceKey, 
  title 
}: PreferenceWithImportanceProps) {
  const { preferences, updatePreference, savePreferences } = useUserPreferences();
  
  // Map the profile form field name to user_preferences key
  const userPrefKey = PREFERENCE_KEY_MAP[preferenceKey] || preferenceKey;
  
  // Get current importance from user_preferences
  const currentImportance = preferences[userPrefKey as keyof typeof preferences]?.importance || "notImportant";

  const handleImportanceChange = async (importance: PreferenceImportance) => {
    // Update user preferences
    updatePreference(userPrefKey as keyof typeof preferences, importance);
    
    // Auto-save preferences after a short delay
    setTimeout(() => {
      savePreferences();
    }, 500);
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