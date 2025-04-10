
import { useState, useEffect } from "react";
import { Check, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PreferenceSelectionSection } from "./preferences/PreferenceSelectionSection";
import { FormDisplaySection } from "./preferences/FormDisplaySection";
import { UserPreference } from "./types";

interface PreferenceSelectorProps {
  defaultPreference?: UserPreference;
}

export function PreferenceSelector({ defaultPreference = null }: PreferenceSelectorProps) {
  const [preference, setPreference] = useState<UserPreference>(defaultPreference);
  const [showForms, setShowForms] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (defaultPreference) {
      setPreference(defaultPreference);
      const hadCompletedForm = localStorage.getItem(`formCompleted_${defaultPreference}`);
      if (hadCompletedForm === 'true') {
        setShowForms(true);
      }
    } else {
      const savedPreference = localStorage.getItem('userPreference') as UserPreference;
      const hadCompletedForm = localStorage.getItem(`formCompleted_${savedPreference}`);
      
      if (savedPreference) {
        setPreference(savedPreference);
        if (hadCompletedForm === 'true') {
          setShowForms(true);
        }
      }
    }
  }, [defaultPreference]);
  
  const handlePreferenceSelect = (pref: UserPreference) => {
    setPreference(pref);
    localStorage.setItem('userPreference', pref);
  };
  
  const handleContinue = () => {
    if (!preference) {
      toast({
        title: "Please select an option",
        description: "You need to select what you're looking for to continue",
        variant: "destructive",
      });
      return;
    }
    
    setShowForms(true);
    localStorage.setItem(`formCompleted_${preference}`, 'true');
  };
  
  const handleReset = () => {
    setShowForms(false);
  };
  
  const handleEditPreference = () => {
    setShowForms(false);
    localStorage.removeItem(`formCompleted_${preference}`);
  };
  
  if (showForms) {
    return (
      <FormDisplaySection 
        preference={preference} 
        handleEditPreference={handleEditPreference} 
      />
    );
  }
  
  return (
    <PreferenceSelectionSection 
      preference={preference} 
      handlePreferenceSelect={handlePreferenceSelect}
      handleContinue={handleContinue}
    />
  );
}
