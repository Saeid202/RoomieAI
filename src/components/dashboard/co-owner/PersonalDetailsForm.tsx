
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapCoOwnerFormToDbRow } from "@/utils/mappers/coOwnerMappers";
import { CoOwnerFormValues } from "./types";
import { initializeDatabase } from "@/services/databaseService";

export function PersonalDetailsForm() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the database when component mounts
    initializeDatabase();
  }, []);

  useEffect(() => {
    async function fetchCoOwnerProfile() {
      if (!user) {
        console.log("No user found when trying to fetch profile");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching co-owner profile for user:", user.id);
        
        // Try checking both table names (with hyphen and with underscore)
        let data = null;
        let error = null;
        
        // First try with underscore (the correct format)
        const result1 = await supabase
          .from('co_owner')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (result1.error) {
          console.log('Error fetching from co_owner:', result1.error);
          
          // If that fails, try with the hyphen version
          const result2 = await supabase
            .from('co-owner')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          data = result2.data;
          error = result2.error;
          
          if (result2.error) {
            console.error('Error fetching from co-owner:', result2.error);
          } else {
            console.log('Successfully fetched from co-owner with hyphen');
          }
        } else {
          data = result1.data;
          error = result1.error;
          console.log('Successfully fetched from co_owner with underscore');
        }

        if (error) {
          console.error('Error fetching co-owner profile:', error);
          throw error;
        }

        console.log("Co-owner profile data:", data);
        if (data) {
          setProfileData(data);
        } else {
          console.log("No profile data found for user:", user.id);
        }
      } catch (error) {
        console.error('Error fetching co-owner profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your co-owner profile. ' + (error.message || ''),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCoOwnerProfile();
  }, [user, toast]);

  const handleSaveCoOwnerProfile = async (formData: CoOwnerFormValues) => {
    if (!user) {
      console.error("No user found when trying to save profile");
      toast({
        title: 'Error',
        description: 'You must be logged in to save your profile.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Saving co-owner profile for user:", user.id);
      console.log("Form data to save:", formData);
      
      // Map form data to database format using the mapper utility
      const dbData = mapCoOwnerFormToDbRow(formData, user.id);
      console.log("Mapped data for database:", dbData);
      
      // First try saving to co_owner (with underscore)
      let saveResult = null;
      let saveError = null;
      
      const insertResult = await supabase
        .from('co_owner')
        .insert(dbData)
        .select();
        
      if (insertResult.error) {
        console.error("Error saving to co_owner table:", insertResult.error);
        
        // If that fails, try the co-owner table (with hyphen)
        const hyphenResult = await supabase
          .from('co-owner')
          .insert(dbData)
          .select();
          
        saveResult = hyphenResult.data;
        saveError = hyphenResult.error;
        
        if (hyphenResult.error) {
          console.error("Error saving to co-owner table (hyphen):", hyphenResult.error);
          
          // Try update instead
          console.log("Trying update with hyphen table...");
          const updateResult = await supabase
            .from('co-owner')
            .update(dbData)
            .eq('user_id', user.id)
            .select();
            
          saveResult = updateResult.data;
          saveError = updateResult.error;
          
          if (updateResult.error) {
            console.error("Error updating co-owner table (hyphen):", updateResult.error);
          } else {
            console.log("Successfully updated in co-owner table (hyphen):", updateResult.data);
          }
        } else {
          console.log("Successfully inserted in co-owner table (hyphen):", hyphenResult.data);
        }
      } else {
        saveResult = insertResult.data;
        saveError = insertResult.error;
        console.log("Successfully inserted in co_owner table:", insertResult.data);
      }
      
      if (saveError) {
        throw saveError;
      }

      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
      
      // Refresh data with the same strategy
      let refreshedData = null;
      
      const refreshResult1 = await supabase
        .from('co_owner')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (refreshResult1.error) {
        console.log("Failed to refresh from co_owner, trying co-owner...");
        const refreshResult2 = await supabase
          .from('co-owner')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        refreshedData = refreshResult2.data;
      } else {
        refreshedData = refreshResult1.data;
      }
      
      if (refreshedData) {
        console.log("Updated profile data:", refreshedData);
        setProfileData(refreshedData);
      }
      
    } catch (error) {
      console.error('Error saving co-owner profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your co-owner profile. ' + (error.message || ''),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Loading your profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CoOwnerProfileForm 
        initialData={profileData} 
        onSave={handleSaveCoOwnerProfile} 
      />
    </div>
  );
}
