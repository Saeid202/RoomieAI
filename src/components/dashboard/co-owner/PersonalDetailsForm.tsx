
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        
        // First check if the co-owner table exists and is accessible
        console.log("Checking co-owner table");
        const { data: tableInfo, error: tableError } = await supabase
          .from('co-owner')
          .select('count(*)')
          .limit(1);
          
        if (tableError) {
          console.error('Error checking co-owner table:', tableError);
          throw tableError;
        }
        
        console.log("Co-owner table check result:", tableInfo);
        
        // Now fetch user profile
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

  const handleSaveCoOwnerProfile = async (formData) => {
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
      
      // Prepare data for insert/update with user_id
      const profileData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Here we first insert if it doesn't exist, then update if it does (upsert)
      const { data, error } = await supabase
        .from('co-owner')
        .upsert(profileData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error("Error saving profile:", error);
        throw error;
      }
      
      console.log("Profile save result:", data);

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
