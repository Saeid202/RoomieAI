
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PreferenceSelectionSection } from "./preferences/PreferenceSelectionSection";
import { FormDisplaySection } from "./preferences/FormDisplaySection";
import { UserPreference } from "./types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PreferenceSelectorProps {
  defaultPreference?: UserPreference | null;
}

export function PreferenceSelector({ defaultPreference = null }: PreferenceSelectorProps) {
  const [preference, setPreference] = useState<UserPreference | null>(defaultPreference);
  const [showForms, setShowForms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    
    // Store in localStorage that the user has completed the form
    setShowForms(true);
    localStorage.setItem(`formCompleted_${preference}`, 'true');
    
    // Navigate to profile page after selecting preference
    navigate('/dashboard/profile');
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
