
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
      if (!user) return;

      try {
        setLoading(true);
        console.log("Fetching co-owner profile for user:", user.id);
        const { data, error } = await supabase
          .from('co-owner')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching co-owner profile:', error);
          if (error.code !== 'PGRST116') {
            throw error;
          }
        }

        console.log("Co-owner profile data:", data);
        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching co-owner profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your co-owner profile.',
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
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('co-owner')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing profile:", checkError);
        throw checkError;
      }

      // Prepare data for insert/update
      const profileData = {
        ...formData,
        user_id: user.id,
      };

      let result;
      if (existingProfile) {
        console.log("Updating existing profile:", existingProfile);
        // Update existing profile
        result = await supabase
          .from('co-owner')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        console.log("Creating new profile");
        // Insert new profile
        result = await supabase
          .from('co-owner')
          .insert(profileData);
      }

      if (result.error) {
        console.error("Error saving profile:", result.error);
        throw result.error;
      }
      
      console.log("Profile saved successfully:", result);

      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
      
      // Refresh data
      const { data: updatedData } = await supabase
        .from('co-owner')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (updatedData) {
        setProfileData(updatedData);
      }
      
    } catch (error) {
      console.error('Error saving co-owner profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your co-owner profile. ' + error.message,
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
