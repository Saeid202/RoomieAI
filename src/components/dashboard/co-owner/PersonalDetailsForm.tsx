
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapCoOwnerFormToDbRow } from "@/utils/mappers/coOwnerMappers";
import { CoOwnerFormValues } from "./types";

export function PersonalDetailsForm() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        
        // Get the table name exactly as it appears in Supabase
        const { data: tableNames, error: tableError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .contains('tablename', 'co');
          
        if (tableError) {
          console.error('Error fetching table names:', tableError);
        } else {
          console.log('Available tables:', tableNames);
        }
        
        // Query for the user's profile with the exact table name
        const { data, error } = await supabase
          .from('co-owner')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

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
      
      // First try to inspect the co-owner table structure
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'co-owner' });
        
      if (tableError) {
        console.error("Error getting table info:", tableError);
      } else {
        console.log("Co-owner table structure:", tableInfo);
      }
      
      // Directly try inserting the data (not using upsert initially)
      const { data, error } = await supabase
        .from('co-owner')
        .insert(dbData)
        .select();
        
      if (error) {
        console.error("Error saving profile (insert):", error);
        
        // If insert failed, try update instead
        console.log("Trying update instead...");
        const { data: updateData, error: updateError } = await supabase
          .from('co-owner')
          .update(dbData)
          .eq('user_id', user.id)
          .select();
          
        if (updateError) {
          console.error("Error saving profile (update):", updateError);
          throw updateError;
        }
        
        console.log("Profile update result:", updateData);
      } else {
        console.log("Profile insert result:", data);
      }

      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
      
      // Refresh data
      const { data: updatedData, error: fetchError } = await supabase
        .from('co-owner')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error fetching updated profile:", fetchError);
      }
      
      if (updatedData) {
        console.log("Updated profile data:", updatedData);
        setProfileData(updatedData);
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
