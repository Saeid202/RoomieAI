import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPreferences, 
  DEFAULT_PREFERENCES, 
  PreferenceImportance,
  updatePreferenceWeight
} from '@/types/preferences';

interface UserPreferenceData {
  id?: string;
  user_id: string;
  preferences: UserPreferences;
  created_at?: string;
  updated_at?: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user preferences from database with localStorage fallback
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading preferences from database:', error);
        
        // Fallback to localStorage
        const savedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
        if (savedPreferences) {
          try {
            const parsedPreferences = JSON.parse(savedPreferences);
            setPreferences(parsedPreferences);
          } catch (parseError) {
            console.error('Error parsing saved preferences:', parseError);
            setPreferences(DEFAULT_PREFERENCES);
          }
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
        return;
      }

      if (data?.preferences) {
        try {
          const parsedPreferences = data.preferences as unknown as UserPreferences;
          setPreferences(parsedPreferences);
          // Also save to localStorage as backup
          localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(data.preferences));
        } catch (parseError) {
          console.error('Error parsing database preferences:', parseError);
          setPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        // No preferences found, use defaults
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Error in loadPreferences:', error);
      
      // Fallback to localStorage
      const savedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences(parsedPreferences);
        } catch (parseError) {
          console.error('Error parsing saved preferences:', parseError);
          setPreferences(DEFAULT_PREFERENCES);
        }
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Save preferences to database with localStorage backup
  const savePreferences = useCallback(async (newPreferences?: UserPreferences) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to save preferences",
        variant: "destructive",
      });
      return false;
    }

    const preferencesToSave = newPreferences || preferences;

    try {
      setSaving(true);

      // Save to localStorage as backup
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferencesToSave));

      // Try to save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferencesToSave as any, // Cast to any to avoid type issues with Json
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving preferences to database:', error);
        
        // Even if database save fails, we have localStorage backup
        toast({
          title: "Preferences Saved Locally",
          description: "Your preferences were saved locally but may not sync across devices.",
          variant: "default",
        });
        return true;
      }

      toast({
        title: "Preferences Saved",
        description: "Your matching preferences have been saved successfully.",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user?.id, preferences, toast]);

  // Update a specific preference
  const updatePreference = useCallback((
    key: keyof UserPreferences, 
    importance: PreferenceImportance
  ) => {
    const updatedPreferences = updatePreferenceWeight(preferences, key, importance);
    setPreferences(updatedPreferences);
    return updatedPreferences;
  }, [preferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  }, []);

  // Auto-save preferences when they change (debounced)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const enableAutoSave = useCallback((enabled: boolean = true) => {
    if (!enabled) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      savePreferences();
    }, 2000); // Auto-save after 2 seconds of inactivity

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    preferences,
    setPreferences,
    loading,
    saving,
    loadPreferences,
    savePreferences,
    updatePreference,
    resetToDefaults,
    enableAutoSave
  };
} 